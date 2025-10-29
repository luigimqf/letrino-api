import { Match } from '../config/db/entity';
import { ErrorCode } from '../constants/error';
import { EGameStatus } from '../constants/match';
import { IMatchRepository } from '../repositories/match.repository';
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
  constructor(private matchRepository: IMatchRepository) {}

  async execute(id: string): Promise<Either<ErrorCode, IUserStatistic>> {
    const matches = await this.matchRepository.findAllByUserId(id);

    if (matches.isFailure() || !matches.value) {
      return Failure.create(ErrorCode.MATCHES_NOT_FOUND);
    }

    const gamesPlayed = matches.value.length;
    const gamesWon = matches.value.filter(
      match => match.result === EGameStatus.CORRECT
    ).length;
    const score = matches.value.reduce((acc, match) => acc + match.score, 0);

    const { bestWinStreak, winStreak } = this.calculateWinStreak(matches.value);

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

  private calculateWinStreak(matches: Match[]) {
    if (matches.length === 0) {
      return {
        bestWinStreak: 0,
        winStreak: 0,
      };
    }

    const sortedMatches = matches.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    let bestWinStreak = 0;
    let currentWinStreak = 0;

    for (const match of sortedMatches) {
      if (match.result === EGameStatus.CORRECT) {
        currentWinStreak++;
        bestWinStreak = Math.max(bestWinStreak, currentWinStreak);
      } else {
        currentWinStreak = 0;
      }
    }

    let winStreak = 0;

    for (let i = sortedMatches.length - 1; i >= 0; i--) {
      if (sortedMatches[i].result === EGameStatus.CORRECT) {
        winStreak++;
      } else {
        break;
      }
    }

    return {
      bestWinStreak,
      winStreak,
    };
  }
}
