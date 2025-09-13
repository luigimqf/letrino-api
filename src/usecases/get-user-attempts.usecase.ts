import { ErrorCode } from '../constants/error';
import { IAttemptRepository } from '../repositories/attempt.repository';
import { Either, Failure, Success } from '../utils/either';

interface IAttempt {
  status: string;
  userInput: string;
}

export interface IGetUserAttemptsUseCase {
  execute(id: string): Promise<Either<ErrorCode, IAttempt[]>>;
}

export class GetUserAttemptsUseCase implements IGetUserAttemptsUseCase {
  constructor(private attemptRepository: IAttemptRepository) {}

  async execute(id: string): Promise<Either<ErrorCode, IAttempt[]>> {
    const userAttempts = await this.attemptRepository.findTodaysAttempts(id);

    if (userAttempts.isFailure() || !userAttempts.value) {
      return Failure.create(ErrorCode.ATTEMPTS_NOT_FOUND);
    }

    const formattedAttempts = userAttempts.value.map(attempt => ({
      status: attempt.result,
      userInput: attempt.userInput,
    }));

    return Success.create(formattedAttempts);
  }
}
