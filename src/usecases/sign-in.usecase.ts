import { ErrorCode } from '../constants/error';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure, Success } from '../utils/either';
import bcrypt from 'bcryptjs';
import { Jwt } from '../utils/jwt';
import { DAY_IN_SECONDS, WEEK_IN_SECONDS } from '../constants/time';

export interface ISignInUseCase {
  execute(data: {
    email: string;
    password: string;
  }): Promise<
    Either<
      ErrorCode,
      { token: string; refresh_token: string; username: string }
    >
  >;
}

export class SignInUseCase implements ISignInUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<
    Either<
      ErrorCode,
      { token: string; refresh_token: string; username: string }
    >
  > {
    const user = await this.userRepository.findOneBy({ email });

    if (user.isFailure() || !user.value?.id) {
      return Failure.create(ErrorCode.INVALID_CREDENTIALS);
    }

    const { id, passwordHash, username } = user.value;

    const isPasswordValid = bcrypt.compareSync(password, passwordHash);

    if (!isPasswordValid) {
      return Failure.create(ErrorCode.INVALID_CREDENTIALS);
    }

    const token = Jwt.sign({ email, id }, DAY_IN_SECONDS);
    const refreshToken = Jwt.sign({ email, id }, WEEK_IN_SECONDS);

    return Success.create({ token, refresh_token: refreshToken, username });
  }
}
