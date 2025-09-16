import { ErrorCode } from '../constants/error';
import { IMatchRepository } from '../repositories/match.repository';
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
  constructor(private matchRepository: IMatchRepository) {}

  async execute(id?: string): Promise<Either<ErrorCode, ILeaderboard>> {
    try {
      const leaderboardResult = await this.matchRepository.getTopScores(10);

      if (leaderboardResult.isFailure()) {
        return Failure.create(ErrorCode.LEADERBOARD_NOT_FOUND);
      }

      const leaderboardData = leaderboardResult.value ?? [];

      const leaderboard: ILeaderboardEntry[] = leaderboardData.map(
        (entry, index) => ({
          avatar: entry.avatar,
          username: entry.username,
          score: entry.totalScore,
          position: index + 1,
          winRate: parseFloat(entry.winRate.toFixed(2)),
        })
      );

      const response: ILeaderboard = { leaderboard };

      if (!id) {
        return Success.create(response);
      }

      const userInTop10 = leaderboardData.find(entry => entry.userId === id);

      if (userInTop10) {
        return Success.create(response);
      }

      const userEntryResult =
        await this.matchRepository.getLeaderboardEntry(id);

      if (userEntryResult.isFailure() || !userEntryResult.value) {
        return Success.create(response);
      }

      const userData = userEntryResult.value;

      const userStatsResult = await this.matchRepository.getStats(id);

      if (userStatsResult.isFailure() || !userStatsResult.value) {
        return Success.create(response);
      }

      const userStats = userStatsResult.value;

      response.user = {
        avatar: userData.avatar,
        username: userData.username,
        score: userStats.score,
        position: userData.position,
        winRate: parseFloat(userStats.winRate.toFixed(2)),
      };

      return Success.create(response);
    } catch (error) {
      return Failure.create(ErrorCode.LEADERBOARD_NOT_FOUND);
    }
  }
}
