import { ErrorCode } from '../constants/error';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IGetUserDataUsecase {
  execute(
    id: string
  ): Promise<
    Either<ErrorCode, { username: string; avatar: string; score: number }>
  >;
}

export class GetUserDataUseCase implements IGetUserDataUsecase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    id: string
  ): Promise<
    Either<ErrorCode, { username: string; avatar: string; score: number }>
  > {
    const user = await this.userRepository.findById(id);

    if (user.isFailure() || !user.value.id) {
      return Failure.create(ErrorCode.USER_NOT_FOUND);
    }

    const { username, avatar, id: userId } = user.value;

    const matches = user.value.matches;

    const score = matches.reduce((acc, match) => acc + match.score, 0);

    return Success.create({ username, avatar, score, id: userId });
  }
}
