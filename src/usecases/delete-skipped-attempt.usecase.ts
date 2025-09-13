import { ErrorCode } from '../constants/error';
import { ISkippedAttemptRepository } from '../repositories/skipped_attempt.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IDeleteSkippedAttemptUseCase {
  execute(id: string): Promise<Either<ErrorCode, null>>;
}

export class DeleteSkippedAttemptUseCase
  implements IDeleteSkippedAttemptUseCase
{
  constructor(private skippedAttemptRepository: ISkippedAttemptRepository) {}

  async execute(id: string): Promise<Either<ErrorCode, null>> {
    const deletedDocResult = await this.skippedAttemptRepository.delete(id);

    if (deletedDocResult.isFailure() || !deletedDocResult.value) {
      return Failure.create(ErrorCode.NOT_FOUND);
    }

    return Success.create(null);
  }
}
