import { User } from '../config/db/entity';
import { ErrorCode } from '../constants/error';
import { IUserRepository } from '../repositories/user.repository';
import { DateUtils } from '../utils/date';
import { Either, Failure, Success } from '../utils/either';
import bcrypt from 'bcryptjs';

export interface ICreateUserUseCase {
  execute(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<Either<ErrorCode, ICreateUserReturn>>;
}

interface ICreateUserReturn {
  id: string;
  username: string;
  avatar: string;
  email: string;
}
export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<Either<ErrorCode, ICreateUserReturn>> {
    const { email, username, password } = data;
    const userWithEmail = await this.userRepository.findOneBy({
      email,
    });

    if (userWithEmail.isSuccess() && userWithEmail.value?.id) {
      return Failure.create(ErrorCode.FOUND_EMAIL);
    }

    const userWithUsername = await this.userRepository.findOneBy({
      username,
    });

    if (userWithUsername.isSuccess() && userWithUsername.value?.id) {
      return Failure.create(ErrorCode.FOUND_USERNAME);
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = await this.userRepository.create({
      email,
      username,
      passwordHash,
    });

    if (newUser.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    const {
      username: userUsername,
      email: userEmail,
      avatar,
      id,
    } = newUser.value;

    return Success.create({
      id,
      username: userUsername,
      avatar,
      email: userEmail,
    });
  }
}
