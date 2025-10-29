import { ErrorCode } from '../constants/error';
import { ETokenStatus } from '../constants/token';
import { ITokenRepository } from '../repositories/token.repository';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure, Success } from '../utils/either';
import bcrypt from 'bcryptjs';

export interface IRefreshPasswordUsecase {
  execute(
    id: string,
    newPassword: string,
    token: string
  ): Promise<Either<ErrorCode, null>>;
}

export class RefreshPasswordUseCase implements IRefreshPasswordUsecase {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: ITokenRepository
  ) {}

  async execute(
    id: string,
    newPassword: string,
    token: string
  ): Promise<Either<ErrorCode, null>> {
    const tokenRecordResult = await this.tokenRepository.findActive(token);

    if (tokenRecordResult.isFailure() || !tokenRecordResult.value) {
      return Failure.create(ErrorCode.INVALID_TOKEN);
    }

    const updatedUserResult = await this.userRepository.update(id, {
      passwordHash: bcrypt.hashSync(newPassword, 10),
    });

    if (updatedUserResult.isFailure() || !updatedUserResult.value) {
      return Failure.create(ErrorCode.REFRESH_PASSWORD_FAILED);
    }

    await this.tokenRepository.update({
      ...tokenRecordResult.value,
      status: ETokenStatus.REVOKED,
    });

    return Success.create(null);
  }
}
