import { User } from '../config/db/entity';
import { ErrorCode } from '../constants/error';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure } from '../utils/either';

export interface ICreateUserUseCase {
  execute(data: User): Promise<Either<ErrorCode, User>>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: User): Promise<Either<ErrorCode, User>> {
    const userWithEmail = await this.userRepository.findOneBy({
      email: data.email,
    });

    if (userWithEmail.isFailure() || userWithEmail.value) {
      return Failure.create(ErrorCode.FOUND_EMAIL);
    }

    const userWithUsername = await this.userRepository.findOneBy({
      username: data.username,
    });

    if (userWithUsername.isFailure() || userWithUsername.value) {
      return Failure.create(ErrorCode.FOUND_USERNAME);
    }

    const newUser = await this.userRepository.create(data);

    if (newUser.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    return newUser;
  }
}
