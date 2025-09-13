import { ErrorCode } from '../constants/error';
import { EStatistics } from '../constants/statistic';
import { IAttemptRepository } from '../repositories/attempt.repository';
import { IStatisticRepository } from '../repositories/statistic.repository';
import { IUsedWordRepository } from '../repositories/used_word.repository';
import { IWordRepository } from '../repositories/word.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IRegisterFailedAttemptUseCase {
  execute({
    id,
    attempt,
  }: {
    id: string;
    attempt: string;
  }): Promise<Either<ErrorCode, ISuccessReturn>>;
}

interface ISuccessReturn {
  score?: number;
  attempt: number;
  correctWord?: string;
}

export class RegisterFailedAttemptUseCase
  implements IRegisterFailedAttemptUseCase
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

    if (word.value.word === attempt) {
      return Failure.create(ErrorCode.CORRECT_ATTEMPT);
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
      result: EStatistics.INCORRECT,
      userInput: attempt,
    });

    if (attemptResult.isFailure() || !attemptResult.value) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    const incorrectAttemptResult =
      await this.attemptRepository.countIncorrectAttemptsToday(id);

    if (incorrectAttemptResult.isFailure() || !incorrectAttemptResult.value) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    const totalIncorrectAttempts = incorrectAttemptResult.value!;

    if (totalIncorrectAttempts >= 6) {
      await this.statisticRepository.updateGameResult({
        userId: id,
        won: false,
        scoreIncrement: 0,
      });

      return Success.create({
        score: 0,
        attempt: totalIncorrectAttempts,
        correctWord: word.value.word,
      });
    }

    return Success.create({
      attempt: totalIncorrectAttempts,
    });
  }
}
