import { ErrorCode } from '../constants/error';
import { IMatchRepository } from '../repositories/match.repository';
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
  constructor(
    private userRepository: IUserRepository,
    private matchRepository: IMatchRepository
  ) {}

  async execute(
    id: string
  ): Promise<
    Either<ErrorCode, { username: string; avatar: string; score: number }>
  > {
    const user = await this.userRepository.findById(id);

    if (user.isFailure() || !user.value.id) {
      return Failure.create(ErrorCode.USER_NOT_FOUND);
    }

    const { username, avatar } = user.value;

    const matches = await this.matchRepository.findAllByUserId(id);

    if (matches.isFailure() || !matches.value) {
      return Failure.create(ErrorCode.MATCHES_NOT_FOUND);
    }

    const score = matches.value.reduce((acc, match) => acc + match.score, 0);

    return Success.create({ username, avatar, score });
  }
}
