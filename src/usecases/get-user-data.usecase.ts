import { ErrorCode } from '../constants/error';
import { IStatisticRepository } from '../repositories/statistic.repository';
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
    private statisticRepository: IStatisticRepository
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

    let score = 0;

    const statistic = await this.statisticRepository.findByUserId(id);

    if (statistic.isSuccess() && statistic.value) {
      score = statistic.value.score;
    }

    return Success.create({ username, avatar, score });
  }
}
