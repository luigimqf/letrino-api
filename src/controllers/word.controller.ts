/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import z from "zod";
import { Response } from "express";
import { badRequest, notFound, ok, serverError } from "../utils/http-status";
import { StatisticRepository } from "../repositories/statistic.repository";
import { AttemptRepository } from "../repositories/attempt.repository";
import { ATTEMPT_PENALTY, BASE_SCORE, EStatistics } from "../constants/statistic";
import { WordRepository } from "../repositories/word.repository";
import { UsedWordRepository } from "../repositories/used_word.repository";
import { Errors } from "../constants/error";
import { UserRepository } from "../repositories/user.repository";
import { SkippedAttemptRepository } from "../repositories/skipped_attempt.repository";
import { AuthenticateRequest } from "../types";
import { IUsedWord } from "../config/models/used_word.model";
import { Validate } from "../utils/validator";

const wordSchema = z.object({
  attempt: z.string({
    message: 'Attempt must be a string'
  }).nonempty('Attempt is required')
});

class WordController {
  async getWord(_: AuthenticateRequest, res: Response) {
    try {
      const todaysWord = await UsedWordRepository.findTodaysWord();
      if(todaysWord.isSuccess() && todaysWord.value?.wordId) {
        const wordDoc = await WordRepository.find(todaysWord.value.wordId);

        if(wordDoc.isSuccess()){
          const {word,isGolden} = wordDoc.value;
          ok(res, {
            word,
            isGolden
          });
          return;
        }
      }

      const usedWords = await UsedWordRepository.find();
      if(usedWords.isSuccess() && usedWords.value) {
        const usedWordIds = (usedWords.value as IUsedWord[]).map((usedWord) => usedWord.wordId);
        const randomWord = await WordRepository.findUnexistedWordIn(usedWordIds, 1, {
          isGolden: Math.random() < 0.05 ? true : false
        }) 

        if(randomWord.isSuccess()) {
          const {word,isGolden} = randomWord.value!;
          await UsedWordRepository.createUsedWord({
            wordId: randomWord.value!.id
          })
          ok(res, {
            word,
            isGolden
          })
          return;
        }

        notFound(res);
        return 
      }

      notFound(res);
      return; 
      
    } catch (error) {
      serverError(res);
    }
  }

  @Validate({body: wordSchema})
  async attemptSuccess(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if(!id) {
        badRequest(res, Errors.UNAUTHORIZED);
        return;
      }

      const { attempt } = req.body;

      const wordIdResult = await UsedWordRepository.findTodaysWord();

      if(wordIdResult.isFailure()) {
        notFound(res, Errors.NOT_FOUND);
        return;
      }

      const todaysWord = await WordRepository.find(wordIdResult.value?.wordId!);

      if(todaysWord.isFailure() || (todaysWord.isSuccess() && !todaysWord.value.id)){
        notFound(res, Errors.NOT_FOUND_WORD)
        return;
      }

      if(todaysWord.isSuccess() && todaysWord.value?.word === attempt) {
        let statisticResult = await StatisticRepository.findByUserId(id);
        
        if(statisticResult.isFailure() || !statisticResult.value) {
          statisticResult = await StatisticRepository.create(id);
        }

        if(statisticResult.isFailure()) {
          badRequest(res, "Error creating user statistics");
          return;
        }

        const statistic = statisticResult.value!;

        await AttemptRepository.create({
          userId: id,
          statisticId: statistic.id,
          wordId: todaysWord.value.id,
          result: EStatistics.CORRECT
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
          result: EStatistics.INCORRECT
        });
    
        if(incorrectAttemptsResult.isFailure()) {
          badRequest(res, "Error calculating new score")
          return;
        }

        const scoreCalculated = BASE_SCORE - (ATTEMPT_PENALTY * incorrectAttemptsResult.value);

        await StatisticRepository.updateGameResult(id, true, scoreCalculated);

        ok(res, { score: scoreCalculated });
        return;
      }

      badRequest(res, Errors.INCORRECT_ATTEMPT)
      
    } catch (error) {
      serverError(res);
    }
  }

  @Validate({body: wordSchema})
  async attemptFail(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if(!id) {
        badRequest(res, Errors.UNAUTHORIZED);
        return;
      }

      const { attempt } = req.body;

      const todaysWordId = await UsedWordRepository.findTodaysWord();

      if(todaysWordId.isFailure()) {
        notFound(res)
        return;
      }

      const todaysWordResult = await WordRepository.find(todaysWordId.value?.wordId!);

      if(todaysWordResult.isFailure() || (todaysWordResult.isSuccess() && !todaysWordResult.value.id)){
        notFound(res, Errors.NOT_FOUND_WORD)
        return;
      }

      if(todaysWordResult.isSuccess() && todaysWordResult.value.word !== attempt) {
        let statisticResult = await StatisticRepository.findByUserId(id);
        
        if(statisticResult.isFailure() || !statisticResult.value) {
          statisticResult = await StatisticRepository.create(id);
        }

        if(statisticResult.isFailure()) {
          badRequest(res, "Error creating user statistics");
          return;
        }

        const statistic = statisticResult.value!;

        await AttemptRepository.create({
          userId: id,
          statisticId: statistic.id,
          wordId: todaysWordResult.value.id,
          result: EStatistics.INCORRECT
        });
    
        ok(res)
        return;
      }

      badRequest(res, Errors.CORRECT_ATTEMPT)
      
    } catch (error) {
      serverError(res);
    }
  }

  async registerSkippedAttemp(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if(!id) {
        badRequest(res, Errors.UNAUTHORIZED)
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
      })

      if(todaySkippedResult.isSuccess() && todaySkippedResult.value?.id) {
        badRequest(res,"Skipped Document found")
        return;
      }

      const todaysWordResult = await UsedWordRepository.findTodaysWord();

      if(todaysWordResult.isFailure() || !todaysWordResult.value?.id) {
        notFound(res, Errors.NOT_FOUND_WORD)
        return;
      }

      await SkippedAttemptRepository.create({
        userId: id,
        wordId: todaysWordResult.value?.wordId!
      })

      await StatisticRepository.resetStreak(id);

      ok(res);
      
    } catch (error) {
      serverError(res);
    }
  }

  async deleteSkippedAttempDocument(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if(!id) {
        badRequest(res, Errors.UNAUTHORIZED)
        return;
      }

      const deleteDocResult = await SkippedAttemptRepository.delete({
        userId: id
      })

      if(deleteDocResult.isFailure() || (deleteDocResult.isSuccess() && !deleteDocResult.value?.id)) {
        notFound(res, Errors.NOT_FOUND_DOCUMENT)
        return;
      }

      ok(res)

    } catch (error) {
      serverError(res)
    }
  }
}

const wordController = new WordController();

export const getWord = wordController.getWord.bind(wordController);
export const attemptSuccess = wordController.attemptSuccess.bind(wordController);
export const attemptFail = wordController.attemptFail.bind(wordController);
export const registerSkippedAttemp = wordController.registerSkippedAttemp.bind(wordController);
export const deleteSkippedAttempDocument = wordController.deleteSkippedAttempDocument.bind(wordController);