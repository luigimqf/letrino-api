import { ErrorCode } from '../constants/error';
import { IMatchRepository } from '../repositories/match.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IGetLeaderboardUsecase {
  execute(id?: string | null): Promise<Either<ErrorCode, ILeaderboard>>;
}

interface ILeaderboard {
  leaderboard: Omit<ILeaderboardEntry, 'id'>[];
  user?: Omit<ILeaderboardEntry, 'id'>;
}

interface ILeaderboardEntry {
  id: string;
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
          id: entry.userId,
          avatar: entry.avatar,
          username: entry.username,
          score: entry.totalScore,
          position: index + 1,
          winRate: parseFloat(entry.winRate.toFixed(2)),
        })
      );

      const isUserInTop10 = leaderboard.some(entry => entry.id === id);

      const leaderboardWithoutId = leaderboard.map(({ id, ...rest }) => rest);

      const response: ILeaderboard = { leaderboard: leaderboardWithoutId };

      if (!id || !isUserInTop10) {
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
