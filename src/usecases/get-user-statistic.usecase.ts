import { ErrorCode } from '../constants/error';
import { IStatisticRepository } from '../repositories/statistic.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IGetUserStatisticUseCase {
  execute(id: string): Promise<Either<ErrorCode, IUserStatistic>>;
}

interface IUserStatistic {
  gamesPlayed: number;
  gamesWon: number;
  winStreak: number;
  bestWinStreak: number;
  score: number;
  winPercentage: number;
}

export class GetUserStatisticUseCase implements IGetUserStatisticUseCase {
  constructor(private statisticRepository: IStatisticRepository) {}

  async execute(id: string): Promise<Either<ErrorCode, IUserStatistic>> {
    const statistic = await this.statisticRepository.findByUserId(id);

    if (statistic.isFailure() || !statistic.value) {
      return Failure.create(ErrorCode.STATISTIC_NOT_FOUND);
    }

    const { gamesPlayed, gamesWon, winStreak, bestWinStreak, score } =
      statistic.value;

    const winPercentage =
      gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(2) : '0.00';

    return Success.create({
      gamesPlayed,
      gamesWon,
      winStreak,
      bestWinStreak,
      score,
      winPercentage: parseFloat(winPercentage),
    });
  }
}
