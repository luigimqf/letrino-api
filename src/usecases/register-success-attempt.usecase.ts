import { ErrorCode } from '../constants/error';
import {
  ATTEMPT_SCORES,
  BONUS_SCORES,
  EStatistics,
  HIGH_WIN_RATE_THRESHOLD,
} from '../constants/statistic';
import { IAttemptRepository } from '../repositories/attempt.repository';
import { IStatisticRepository } from '../repositories/statistic.repository';
import { IUsedWordRepository } from '../repositories/used_word.repository';
import { IUserRepository } from '../repositories/user.repository';
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
  bonuses: {
    perfectGame: number;
    streak: number;
    highWinRate: number;
  };
}

export class RegisterSuccessAttemptUseCase
  implements IRegisterSuccessAttemptUseCase
{
  constructor(
    private attemptRepository: IAttemptRepository,
    private statisticRepository: IStatisticRepository,
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
      return Failure.create(ErrorCode.WORD_NOT_FOUND);
    }

    const word = await this.wordRepository.find(usedWord?.value?.wordId || '');

    if (word.isFailure() || !word.value) {
      return Failure.create(ErrorCode.WORD_NOT_FOUND);
    }

    if (word.value.word !== attempt) {
      return Failure.create(ErrorCode.INCORRECT_ATTEMPT);
    }

    const statistic = await this.statisticRepository.findByUserId(id);

    if (statistic.isFailure() || !statistic.value) {
      return Failure.create(ErrorCode.STATISTIC_NOT_FOUND);
    }

    const statisticData = statistic.value!;

    const attemptResult = await this.attemptRepository.create({
      userId: id,
      statisticId: statisticData.id,
      wordId: word.value.id,
      result: EStatistics.CORRECT,
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

    const currentStreak = statisticData.winStreak + 1;
    if (currentStreak >= 10) {
      scoreCalculated += BONUS_SCORES.STREAK_10;
    } else if (currentStreak >= 5) {
      scoreCalculated += BONUS_SCORES.STREAK_5;
    }

    const totalGames = statisticData.gamesPlayed + 1;
    const totalWins = statisticData.gamesWon + 1;
    const winRate = totalWins / totalGames;

    if (winRate >= HIGH_WIN_RATE_THRESHOLD && totalGames >= 10) {
      scoreCalculated += BONUS_SCORES.HIGH_WIN_RATE;
    }

    const updatedStatistic = await this.statisticRepository.updateGameResult({
      userId: id,
      won: true,
      scoreIncrement: scoreCalculated,
    });

    if (updatedStatistic.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    return Success.create({
      attempt: currentAttempt,
      bonuses: {
        perfectGame: currentAttempt === 1 ? BONUS_SCORES.PERFECT_GAME : 0,
        streak:
          currentStreak >= 5
            ? currentStreak >= 10
              ? BONUS_SCORES.STREAK_5
              : BONUS_SCORES.STREAK_10
            : 0,
        highWinRate:
          winRate >= HIGH_WIN_RATE_THRESHOLD && totalGames >= 10
            ? BONUS_SCORES.HIGH_WIN_RATE
            : 0,
      },
    });
  }
}
