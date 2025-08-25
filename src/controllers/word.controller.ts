/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import z from 'zod';
import { Response } from 'express';
import {
  badRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from '../utils/http-status';
import { StatisticRepository } from '../repositories/statistic.repository';
import { AttemptRepository } from '../repositories/attempt.repository';
import {
  ATTEMPT_SCORES,
  BONUS_SCORES,
  HIGH_WIN_RATE_THRESHOLD,
  EStatistics,
} from '../constants/statistic';
import { WordRepository } from '../repositories/word.repository';
import { UsedWordRepository } from '../repositories/used_word.repository';
import { ErrorCode, Errors } from '../constants/error';
import { SkippedAttemptRepository } from '../repositories/skipped_attempt.repository';
import { AuthenticateRequest } from '../types';
import { IUsedWord } from '../config/models/used_word.model';
import { Validate } from '../utils/validator';
import { Jwt } from '../utils/jwt';

const wordSchema = z.object({
  attempt: z
    .string({
      message: 'Attempt must be a string',
    })
    .nonempty('Attempt is required'),
});

class WordController {
  async getWord(req: AuthenticateRequest, res: Response) {
    try {
      const authorizationHeader = req.headers.authorization;

      const token =
        authorizationHeader && authorizationHeader.startsWith('Bearer ')
          ? authorizationHeader.split(' ')[1]
          : null;

      const jwtResult = Jwt.verify(token ?? '');

      const id =
        jwtResult.isSuccess() && jwtResult.value && 'id' in jwtResult.value
          ? jwtResult.value.id
          : null;

      if (id) {
        const userWord = await UsedWordRepository.findUserWord({ id });

        if (userWord.isSuccess() && userWord.value?.wordId) {
          const wordDoc = await WordRepository.find(userWord.value.wordId);

          if (wordDoc.isSuccess()) {
            const { word, isGolden } = wordDoc.value;
            ok(res, {
              word,
              isGolden,
            });
            return;
          }
        }

        const usedWords = await UsedWordRepository.findUserUsedWords({ id });

        let usedWordIds: string[] = [];
        if (usedWords.isSuccess() && usedWords.value) {
          usedWordIds = (usedWords.value as IUsedWord[]).map(
            usedWord => usedWord.wordId
          );
        }

        const randomWord = await WordRepository.findUnexistedWordIn({
          excludeIds: usedWordIds,
          size: 1,
          filter: {
            isGolden: Math.random() < 0.05 ? true : false,
          },
        });

        if (randomWord.isSuccess() && randomWord.value) {
          const { word, isGolden } = randomWord.value;

          // Registrar a palavra sorteada no used_words
          await UsedWordRepository.createUsedWord({
            wordId: randomWord.value.id,
            id: id,
          });

          ok(res, {
            word,
            isGolden,
          });
          return;
        }

        // Se não encontrou nenhuma palavra disponível
        notFound(res, {
          message: 'No words available',
        });
        return;
      }

      // Caso 3: Quando não tiver id (usuário não autenticado)
      // Apenas sortear uma palavra sem registrar nada
      const randomWord = await WordRepository.findUnexistedWordIn({
        excludeIds: [],
        size: 1,
        filter: {
          isGolden: Math.random() < 0.05 ? true : false,
        },
      });

      if (randomWord.isSuccess() && randomWord.value) {
        const { word, isGolden } = randomWord.value;
        ok(res, {
          word,
          isGolden,
        });
        return;
      }

      // Se não conseguiu sortear nenhuma palavra
      notFound(res, {
        message: 'No words available',
      });
      return;
    } catch (error) {
      serverError(res);
    }
  }

  @Validate({ body: wordSchema })
  async attemptSuccess(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if (!id) {
        unauthorized(res);
        return;
      }

      const { attempt } = req.body;

      const wordIdResult = await UsedWordRepository.findUserWord({ id });

      if (wordIdResult.isFailure()) {
        notFound(res);
        return;
      }

      const todaysWord = await WordRepository.find(wordIdResult.value?.wordId!);

      if (
        todaysWord.isFailure() ||
        (todaysWord.isSuccess() && !todaysWord.value.id)
      ) {
        notFound(res, {
          message: Errors.WORD_NOT_FOUND,
          code: ErrorCode.WORD_NOT_FOUND,
        });
        return;
      }

      if (todaysWord.isSuccess() && todaysWord.value?.word === attempt) {
        let statisticResult = await StatisticRepository.findByUserId(id);

        if (statisticResult.isFailure() || !statisticResult.value) {
          statisticResult = await StatisticRepository.create(id);
        }

        if (statisticResult.isFailure()) {
          badRequest(res, {
            message: Errors.CREATE_USER_STATISTIC_FAILED,
            code: ErrorCode.CREATE_USER_STATISTIC_FAILED,
          });
          return;
        }

        const statistic = statisticResult.value!;

        await AttemptRepository.create({
          userId: id,
          statisticId: statistic.id,
          wordId: todaysWord.value.id,
          result: EStatistics.CORRECT,
          userInput: attempt,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const incorrectAttemptsResult = await AttemptRepository.countDocuments({
          userId: id,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          result: EStatistics.INCORRECT,
        });

        if (incorrectAttemptsResult.isFailure()) {
          badRequest(res, {
            message: Errors.CALCULATE_NEW_SCORE_FAILED,
            code: ErrorCode.CALCULATE_NEW_SCORE_FAILED,
          });
          return;
        }

        const currentAttempt = incorrectAttemptsResult.value + 1;

        let scoreCalculated =
          ATTEMPT_SCORES[
            Math.min(currentAttempt, 6) as keyof typeof ATTEMPT_SCORES
          ] || 0;

        if (currentAttempt === 1) {
          scoreCalculated += BONUS_SCORES.PERFECT_GAME;
        }

        const currentStreak = statistic.winStreak + 1;
        if (currentStreak >= 10) {
          scoreCalculated += BONUS_SCORES.STREAK_10;
        } else if (currentStreak >= 5) {
          scoreCalculated += BONUS_SCORES.STREAK_5;
        }

        const totalGames = statistic.gamesPlayed + 1;
        const totalWins = statistic.gamesWon + 1;
        const winRate = totalWins / totalGames;

        if (winRate >= HIGH_WIN_RATE_THRESHOLD && totalGames >= 10) {
          scoreCalculated += BONUS_SCORES.HIGH_WIN_RATE;
        }

        await StatisticRepository.updateGameResult({
          userId: id,
          won: true,
          scoreIncrement: scoreCalculated,
        });

        ok(res, {
          score: scoreCalculated,
          attempt: currentAttempt,
          bonuses: {
            perfectGame: currentAttempt === 1 ? BONUS_SCORES.PERFECT_GAME : 0,
            streak:
              currentStreak >= 5
                ? currentStreak >= 10
                  ? BONUS_SCORES.STREAK_5
                  : BONUS_SCORES.STREAK_10
                : null,
            highWinRate:
              winRate >= HIGH_WIN_RATE_THRESHOLD && totalGames >= 10
                ? BONUS_SCORES.HIGH_WIN_RATE
                : 0,
          },
        });
        return;
      }

      badRequest(res, {
        message: Errors.INCORRECT_ATTEMPT,
        code: ErrorCode.INCORRECT_ATTEMPT,
      });
    } catch (error) {
      serverError(res);
    }
  }

  @Validate({ body: wordSchema })
  async attemptFail(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if (!id) {
        unauthorized(res);
        return;
      }

      const { attempt } = req.body;

      const todaysWordId = await UsedWordRepository.findUserWord({ id });

      if (todaysWordId.isFailure()) {
        notFound(res);
        return;
      }

      const todaysWordResult = await WordRepository.find(
        todaysWordId.value?.wordId!
      );

      if (
        todaysWordResult.isFailure() ||
        (todaysWordResult.isSuccess() && !todaysWordResult.value.id)
      ) {
        notFound(res, {
          message: Errors.WORD_NOT_FOUND,
          code: ErrorCode.WORD_NOT_FOUND,
        });
        return;
      }

      if (
        todaysWordResult.isSuccess() &&
        todaysWordResult.value.word !== attempt
      ) {
        let statisticResult = await StatisticRepository.findByUserId(id);

        if (statisticResult.isFailure() || !statisticResult.value) {
          statisticResult = await StatisticRepository.create(id);
        }

        if (statisticResult.isFailure()) {
          badRequest(res, {
            message: Errors.CREATE_USER_STATISTIC_FAILED,
            code: ErrorCode.CREATE_USER_STATISTIC_FAILED,
          });
          return;
        }

        const statistic = statisticResult.value!;

        await AttemptRepository.create({
          userId: id,
          statisticId: statistic.id,
          wordId: todaysWordResult.value.id,
          result: EStatistics.INCORRECT,
          userInput: attempt,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const incorrectAttemptsResult = await AttemptRepository.countDocuments({
          userId: id,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          result: EStatistics.INCORRECT,
        });

        if (incorrectAttemptsResult.isFailure()) {
          badRequest(res, {
            message: Errors.CALCULATE_ATTEMPTS_FAILED,
            code: ErrorCode.CALCULATE_ATTEMPTS_FAILED,
          });
          return;
        }

        const totalIncorrectAttempts = incorrectAttemptsResult.value;

        if (totalIncorrectAttempts >= 6) {
          await StatisticRepository.updateGameResult({
            userId: id,
            won: false,
            scoreIncrement: 0,
          });

          ok(res, {
            score: 0,
            attempt: totalIncorrectAttempts,
            correctWord: todaysWordResult.value.word,
          });
          return;
        }

        ok(res, {
          attempt: totalIncorrectAttempts,
        });
        return;
      }

      badRequest(res, {
        message: Errors.CORRECT_ATTEMPT,
        code: ErrorCode.CORRECT_ATTEMPT,
      });
    } catch (error) {
      serverError(res);
    }
  }

  async registerSkippedAttemp(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if (!id) {
        unauthorized(res);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaySkippedResult = await SkippedAttemptRepository.findOne({
        userId: id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      });

      if (todaySkippedResult.isSuccess() && todaySkippedResult.value?.id) {
        badRequest(res, {
          message: Errors.SKIPPED_ATTEMPT_DOC,
          code: ErrorCode.SKIPPED_ATTEMPT_DOC,
        });
        return;
      }

      const todaysWordResult = await UsedWordRepository.findUserWord({ id });

      if (todaysWordResult.isFailure() || !todaysWordResult.value?.id) {
        notFound(res, {
          message: Errors.WORD_NOT_FOUND,
          code: ErrorCode.WORD_NOT_FOUND,
        });
        return;
      }

      await SkippedAttemptRepository.create({
        userId: id,
        wordId: todaysWordResult.value?.wordId!,
      });

      await StatisticRepository.resetStreak(id);

      ok(res);
    } catch (error) {
      serverError(res);
    }
  }

  async deleteSkippedAttempDocument(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if (!id) {
        unauthorized(res);
        return;
      }

      const deleteDocResult = await SkippedAttemptRepository.delete({
        userId: id,
      });

      if (
        deleteDocResult.isFailure() ||
        (deleteDocResult.isSuccess() && !deleteDocResult.value?.id)
      ) {
        notFound(res, {
          message: Errors.NOT_FOUND_DOCUMENT,
          code: ErrorCode.NOT_FOUND_DOCUMENT,
        });
        return;
      }

      ok(res);
    } catch (error) {
      serverError(res);
    }
  }
}

const wordController = new WordController();

export const getWord = wordController.getWord.bind(wordController);
export const attemptSuccess =
  wordController.attemptSuccess.bind(wordController);
export const attemptFail = wordController.attemptFail.bind(wordController);
export const registerSkippedAttemp =
  wordController.registerSkippedAttemp.bind(wordController);
export const deleteSkippedAttempDocument =
  wordController.deleteSkippedAttempDocument.bind(wordController);
