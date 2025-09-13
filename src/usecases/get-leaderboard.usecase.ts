import { ErrorCode } from '../constants/error';
import { IStatisticRepository } from '../repositories/statistic.repository';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IGetLeaderboardUsecase {
  execute(id?: string): Promise<Either<ErrorCode, ILeaderboard>>;
}

interface ILeaderboard {
  leaderboard: ILeaderboardEntry[];
  user?: ILeaderboardEntry;
}

interface ILeaderboardEntry {
  avatar: string;
  username: string;
  score: number;
  position: number;
  winRate: number;
}

export class GetLeaderboardUseCase implements IGetLeaderboardUsecase {
  constructor(
    private statisticRepository: IStatisticRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(id?: string): Promise<Either<ErrorCode, ILeaderboard>> {
    const leaderboardResult = await this.statisticRepository.findTopScores(10);

    if (leaderboardResult.isFailure()) {
      return Failure.create(ErrorCode.LEADERBOARD_NOT_FOUND);
    }

    const leaderboardData = leaderboardResult.value ?? [];

    const leaderboard: ILeaderboardEntry[] = leaderboardData.map(
      (statistic, index) => {
        const { user, score, gamesPlayed, gamesWon } = statistic;
        const winRate =
          gamesPlayed > 0
            ? ((gamesWon / gamesPlayed) * 100).toFixed(2)
            : '0.00';

        return {
          avatar: user.avatar,
          username: user.username,
          score,
          position: index + 1,
          winRate: parseFloat(winRate),
        };
      }
    );

    const response: ILeaderboard = { leaderboard };

    if (!id) {
      return Success.create(response);
    }

    const userResult = await this.userRepository.findById(id);
    const userStatisticResult = await this.statisticRepository.findByUserId(id);
    const isUserInTop10 = leaderboardData.find(s => s.userId === id);

    if (
      userResult.isFailure() ||
      !userResult.value ||
      userStatisticResult.isFailure() ||
      !userStatisticResult.value ||
      isUserInTop10
    ) {
      return Success.create(response);
    }

    const allStatisticsResult =
      await this.statisticRepository.findAllScoresOrdered();

    if (allStatisticsResult.isFailure() || !allStatisticsResult.value) {
      return Success.create(response);
    }

    const userPosition =
      allStatisticsResult.value?.findIndex(s => s.userId === id) ?? -1;
    const userTotalGames = userStatisticResult.value?.gamesPlayed ?? 0;
    const userGamesWon = userStatisticResult.value?.gamesWon ?? 0;
    const userWinRate =
      userTotalGames > 0
        ? ((userGamesWon / userTotalGames) * 100).toFixed(2)
        : '0.00';

    response.user = {
      avatar: userResult.value?.avatar ?? '',
      username: userResult.value?.username ?? '',
      score: userStatisticResult.value?.score ?? 0,
      position: userPosition + 1,
      winRate: parseFloat(userWinRate),
    };

    return Success.create(response);
  }
}
