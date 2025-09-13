import { ErrorCode } from '../constants/error';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure, Success } from '../utils/either';
import bcrypt from 'bcryptjs';

export interface IRefreshPasswordUsecase {
  execute(id: string, newPassword: string): Promise<Either<ErrorCode, null>>;
}

export class RefreshPasswordUseCase implements IRefreshPasswordUsecase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    id: string,
    newPassword: string
  ): Promise<Either<ErrorCode, null>> {
    const updatedUserResult = await this.userRepository.update(id, {
      passwordHash: bcrypt.hashSync(newPassword, 10),
    });

    if (updatedUserResult.isFailure() || !updatedUserResult.value) {
      return Failure.create(ErrorCode.REFRESH_PASSWORD_FAILED);
    }

    return Success.create(null);
  }
}
