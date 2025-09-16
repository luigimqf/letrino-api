import { User } from '../config/db/entity';
import { ErrorCode } from '../constants/error';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure } from '../utils/either';
import bcrypt from 'bcryptjs';

export interface ICreateUserUseCase {
  execute(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<Either<ErrorCode, User>>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<Either<ErrorCode, User>> {
    const { email, username, password } = data;
    const userWithEmail = await this.userRepository.findOneBy({
      email,
    });

    if (userWithEmail.isFailure() || userWithEmail.value) {
      return Failure.create(ErrorCode.FOUND_EMAIL);
    }

    const userWithUsername = await this.userRepository.findOneBy({
      username,
    });

    if (userWithUsername.isFailure() || userWithUsername.value) {
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

    return newUser;
  }
}
