import { ErrorCode } from '../constants/error';
import { EGameStatus } from '../constants/match';
import {
  ATTEMPT_SCORES,
  BONUS_SCORES,
  EAttemptStatus,
  HIGH_WIN_RATE_THRESHOLD,
} from '../constants/attempt';
import { IAttemptRepository } from '../repositories/attempt.repository';
import { IMatchRepository } from '../repositories/match.repository';
import { IUsedWordRepository } from '../repositories/used_word.repository';
import { IWordRepository } from '../repositories/word.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IRegisterSuccessAttemptUseCase {
  execute({
    id,
    attempt,
  }: {
    id: string;
    attempt: string;
  }): Promise<Either<ErrorCode, ISuccessReturn>>;
}

interface ISuccessReturn {
  attempt: number;
  totalScore: number;
  scoreDetails: {
    attemptScore: number;
    perfectGame: number;
    winStreak: number;
    highWinRate: number;
  };
}

export class RegisterSuccessAttemptUseCase
  implements IRegisterSuccessAttemptUseCase
{
  constructor(
    private attemptRepository: IAttemptRepository,
    private matchRepository: IMatchRepository,
    private usedWordRepository: IUsedWordRepository,
    private wordRepository: IWordRepository
  ) {}

  async execute({
    id,
    attempt,
  }: {
    id: string;
    attempt: string;
  }): Promise<Either<ErrorCode, ISuccessReturn>> {
    const usedWord = await this.usedWordRepository.findUserWord(id);

    if (usedWord.isFailure() || !usedWord.value) {
      return Failure.create(ErrorCode.USER_WORD_NOT_FOUND);
    }

    const word = await this.wordRepository.find(usedWord?.value?.wordId || '');

    if (word.isFailure() || !word.value) {
      return Failure.create(ErrorCode.WORD_NOT_FOUND);
    }

    let userMatchResult = await this.matchRepository.findTodaysMatch(id);

    if (
      userMatchResult.isFailure() &&
      userMatchResult.error === ErrorCode.MATCH_NOT_FOUND
    ) {
      const newMatchResult = await this.matchRepository.create({
        userId: id,
        score: 0,
        result: EGameStatus.IN_PROGRESS,
        wordId: word.value.id,
      });

      if (newMatchResult.isFailure() || !newMatchResult.value) {
        return Failure.create(ErrorCode.MATCH_CREATE_FAILED);
      }

      userMatchResult = Success.create(newMatchResult.value);
    }

    if (userMatchResult.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    if (userMatchResult.value.result !== EGameStatus.IN_PROGRESS) {
      return Failure.create(ErrorCode.MATCH_NOT_IN_PROGRESS);
    }

    if (word.value.word !== attempt) {
      return Failure.create(ErrorCode.INCORRECT_ATTEMPT);
    }

    const attemptResult = await this.attemptRepository.create({
      userId: id,
      matchId: userMatchResult.value.id,
      wordId: word.value.id,
      result: EAttemptStatus.CORRECT,
      userInput: attempt,
    });

    if (attemptResult.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    const incorrectAttemptResult =
      await this.attemptRepository.countIncorrectAttemptsToday(id);

    if (incorrectAttemptResult.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    const currentAttempt = incorrectAttemptResult.value + 1;

    let scoreCalculated =
      ATTEMPT_SCORES[
        Math.min(currentAttempt, 6) as keyof typeof ATTEMPT_SCORES
      ] || 0;

    if (currentAttempt === 1) {
      scoreCalculated += BONUS_SCORES.PERFECT_GAME;
    }

    const statsResult = await this.matchRepository.getStats(id);

    if (statsResult.isFailure() || !statsResult.value) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    const { totalMatches, currentWinStreak, winRate } = statsResult.value;

    const attempts = await this.attemptRepository.findTodaysAttempts(id);

    if (attempts.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    if (currentWinStreak >= 10) {
      scoreCalculated += BONUS_SCORES.STREAK_10;
    } else if (currentWinStreak >= 5) {
      scoreCalculated += BONUS_SCORES.STREAK_5;
    }

    if (winRate >= HIGH_WIN_RATE_THRESHOLD && totalMatches >= 10) {
      scoreCalculated += BONUS_SCORES.HIGH_WIN_RATE;
    }

    const updateMatchResult = await this.matchRepository.update({
      id: userMatchResult.value.id,
      data: {
        score: scoreCalculated,
        result: EGameStatus.CORRECT,
      },
    });

    if (updateMatchResult.isFailure() || !updateMatchResult.value) {
      return Failure.create(ErrorCode.MATCH_UPDATE_FAILED);
    }

    return Success.create({
      attempt: currentAttempt,
      totalScore: scoreCalculated,
      scoreDetails: {
        attemptScore:
          ATTEMPT_SCORES[
            Math.min(currentAttempt, 6) as keyof typeof ATTEMPT_SCORES
          ] || 0,
        perfectGame: currentAttempt === 1 ? BONUS_SCORES.PERFECT_GAME : 0,
        winStreak:
          currentWinStreak >= 5
            ? currentWinStreak >= 10
              ? BONUS_SCORES.STREAK_10
              : BONUS_SCORES.STREAK_5
            : 0,
        highWinRate:
          winRate >= HIGH_WIN_RATE_THRESHOLD && totalMatches >= 10
            ? BONUS_SCORES.HIGH_WIN_RATE
            : 0,
      },
    });
  }
}
