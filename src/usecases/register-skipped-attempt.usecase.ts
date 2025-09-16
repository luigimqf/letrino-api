import { ErrorCode } from '../constants/error';
import { IMatchRepository } from '../repositories/match.repository';
import { ISkippedAttemptRepository } from '../repositories/skipped_attempt.repository';
import { IUsedWordRepository } from '../repositories/used_word.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IRegisterSkippedAttemptUseCase {
  execute(id: string): Promise<Either<ErrorCode, null>>;
}

export class RegisterSkippedAttemptUseCase
  implements IRegisterSkippedAttemptUseCase
{
  constructor(
    private skippedAttemptRepository: ISkippedAttemptRepository,
    private usedWordRepository: IUsedWordRepository
  ) {}

  async execute(id: string): Promise<Either<ErrorCode, null>> {
    const skippedAttemptResult =
      await this.skippedAttemptRepository.findOneToday(id);
    if (skippedAttemptResult.isFailure() || !skippedAttemptResult.value) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    if (skippedAttemptResult.value?.id) {
      return Failure.create(ErrorCode.SKIPPED_ATTEMPT_DOC);
    }

    const userWord = await this.usedWordRepository.findUserWord(id);
    if (userWord.isFailure() || !userWord.value) {
      return Failure.create(ErrorCode.WORD_NOT_FOUND);
    }

    const skippedAttempt = await this.skippedAttemptRepository.create({
      userId: id,
      wordId: userWord.value.wordId,
    });

    if (skippedAttempt.isFailure() || !skippedAttempt.value) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    return Success.create(null);
  }
}
