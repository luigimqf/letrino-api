import { Attempt } from '../config/db/entity';
import { IMatch, Match } from '../config/db/entity/Match';
import { ErrorCode, Errors } from '../constants/error';
import { EGameStatus } from '../constants/match';
import { DateUtils } from '../utils/date';
import { Either, Failure, Success } from '../utils/either';
import { Between, Repository } from 'typeorm';

export interface IMatchRepository {
  create(data: ICreateMatchDTO): Promise<Either<ErrorCode, Match>>;
  findByUserId(userId: string): Promise<Either<ErrorCode, Match>>;
  findTodaysMatch(userId: string): Promise<Either<ErrorCode, Match>>;
  findAllByUserId(userId: string): Promise<Either<ErrorCode, Match[]>>;
  getStats(userId: string): Promise<Either<ErrorCode, IStats>>;
  getTopScores(limit: number): Promise<Either<ErrorCode, ILeaderboardStats[]>>;
  getLeaderboardEntry(userId: string): Promise<Either<ErrorCode, IUserStats>>;
  update(data: IUpdateMatchDTO): Promise<Either<ErrorCode, Match>>;
}

interface IStats {
  totalMatches: number;
  totalWins: number;
  winRate: number;
  bestWinStreak: number;
  currentWinStreak: number;
  score: number;
}

interface ILeaderboardStats {
  userId: string;
  avatar: string;
  username: string;
  totalScore: number;
  totalGames: number;
  gamesWon: number;
  winRate: number;
}

interface IUserStats extends ILeaderboardStats {
  position: number;
}

interface ICreateMatchDTO {
  attempts?: Attempt[];
  userId: string;
  wordId: string;
  score?: number;
  result?: EGameStatus;
}

interface IUpdateMatchDTO {
  id: string;
  data: {
    attempts?: Attempt[];
    score?: number;
    result?: EGameStatus;
  };
}

export class MatchRepository implements IMatchRepository {
  constructor(private readonly repository: Repository<Match>) {}

  async create({
    userId,
    attempts,
    score,
    wordId,
    result,
  }: ICreateMatchDTO): Promise<Either<ErrorCode, Match>> {
    try {
      const newMatch = this.repository.create({
        userId,
        attempts,
        score,
        wordId,
        result,
      });
      const savedMatch = await this.repository.save(newMatch);
      return Success.create(savedMatch);
    } catch (error) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }
  }

  async findTodaysMatch(userId: string): Promise<Either<ErrorCode, Match>> {
    try {
      const startOfDay = DateUtils.startOfDay();
      const endOfDay = DateUtils.endOfDay();

      const match = await this.repository.findOne({
        where: {
          userId,
          createdAt: Between(startOfDay, endOfDay),
        },
      });

      if (!match) {
        return Failure.create(ErrorCode.MATCH_NOT_FOUND);
      }

      return Success.create(match || null);
    } catch (error) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }
  }

  async findByUserId(userId: string): Promise<Either<ErrorCode, Match>> {
    try {
      const match = await this.repository.findOneBy({ userId });
      if (!match) {
        return Failure.create(ErrorCode.MATCH_NOT_FOUND);
      }
      return Success.create(match);
    } catch (error) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }
  }

  async findAllByUserId(userId: string): Promise<Either<ErrorCode, Match[]>> {
    try {
      const matches = await this.repository.findBy({ userId });
      if (!matches || matches.length === 0) {
        return Failure.create(ErrorCode.MATCHES_NOT_FOUND);
      }
      return Success.create(matches);
    } catch (error) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }
  }

  async getStats(userId: string): Promise<Either<ErrorCode, IStats>> {
    try {
      const matches = await this.repository.findBy({ userId });
      if (!matches || matches.length === 0) {
        return Failure.create(ErrorCode.MATCHES_NOT_FOUND);
      }

      const score = matches.reduce((acc, match) => acc + match.score, 0);
      const totalMatches = matches.length;
      const totalWins = matches.filter(
        match => match.result === EGameStatus.CORRECT
      ).length;
      const winRate = totalMatches
        ? parseFloat(((totalWins / totalMatches) * 100).toFixed(2))
        : 0;

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

      return Success.create({
        score,
        totalMatches,
        totalWins,
        winRate,
        bestWinStreak,
        currentWinStreak: winStreak,
      });
    } catch (error) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }
  }

  async getTopScores(
    limit: number
  ): Promise<Either<ErrorCode, ILeaderboardStats[]>> {
    try {
      const topScoresResult = await this.repository
        .createQueryBuilder('match')
        .select([
          'match.userId as userId',
          'user.avatar as avatar',
          'user.username as username',
          'SUM(match.score) as totalScore',
          'COUNT(match.id) as totalGames',
          'SUM(CASE WHEN match.result = :winStatus THEN 1 ELSE 0 END) as gamesWon',
          '(SUM(CASE WHEN match.result = :winStatus THEN 1 ELSE 0 END) * 100.0 / COUNT(match.id)) as winRate',
        ])
        .innerJoin('match.user', 'user')
        .setParameter('winStatus', EGameStatus.CORRECT)
        .groupBy('match.userId, user.avatar, user.username')
        .orderBy('totalScore', 'DESC')
        .limit(limit)
        .getRawMany();

      if (!topScoresResult || topScoresResult.length === 0) {
        return Failure.create(ErrorCode.LEADERBOARD_NOT_FOUND);
      }

      const leaderboardStats: ILeaderboardStats[] = topScoresResult.map(
        result => ({
          userId: result.userId,
          avatar: result.avatar,
          username: result.username,
          totalScore: parseInt(result.totalscore) || 0,
          totalGames: parseInt(result.totalgames) || 0,
          gamesWon: parseInt(result.gameswon) || 0,
          winRate: parseFloat(result.winrate) || 0,
        })
      );

      return Success.create(leaderboardStats);
    } catch (error) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }
  }

  async getLeaderboardEntry(
    userId: string
  ): Promise<Either<ErrorCode, IUserStats>> {
    try {
      const userStatsResult = await this.repository
        .createQueryBuilder('match')
        .select([
          'match.userId as userId',
          'user.avatar as avatar',
          'user.username as username',
          'SUM(match.score) as totalScore',
          'COUNT(match.id) as totalGames',
          'SUM(CASE WHEN match.result = :winStatus THEN 1 ELSE 0 END) as gamesWon',
          '(SUM(CASE WHEN match.result = :winStatus THEN 1 ELSE 0 END) * 100.0 / COUNT(match.id)) as winRate',
        ])
        .innerJoin('match.user', 'user')
        .where('match.userId = :userId', { userId })
        .setParameter('winStatus', EGameStatus.CORRECT)
        .groupBy('match.userId, user.avatar, user.username')
        .getRawOne();

      if (!userStatsResult) {
        return Failure.create(ErrorCode.USER_NOT_FOUND);
      }

      const positionResult = await this.repository
        .createQueryBuilder('match')
        .select(['match.userId as userId', 'SUM(match.score) as totalScore'])
        .groupBy('match.userId')
        .orderBy('totalScore', 'DESC')
        .getRawMany();

      const userPosition =
        positionResult.findIndex(entry => entry.userId === userId) + 1;

      const userStats: IUserStats = {
        ...userStatsResult,
        position: userPosition,
      };

      return Success.create(userStats);
    } catch (error) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }
  }

  async update({
    id,
    data,
  }: IUpdateMatchDTO): Promise<Either<ErrorCode, Match>> {
    try {
      const match = await this.repository.findOne({
        where: { id },
        relations: ['attempts'],
      });

      if (!match) {
        return Failure.create(ErrorCode.MATCH_NOT_FOUND);
      }

      if (data.score !== undefined) {
        match.score = data.score;
      }
      if (data.result !== undefined) {
        match.result = data.result;
      }

      // Não atualize attempts aqui, pois eles já estão sendo criados/gerenciados separadamente
      // O relacionamento OneToMany cuida da associação automaticamente

      const updatedMatch = await this.repository.save(match);
      return Success.create(updatedMatch);
    } catch (error) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }
  }
}
