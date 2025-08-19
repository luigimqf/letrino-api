import { AppDataSource } from "../config/db/data-source";
import { Statistic } from "../config/db/entity";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";

interface IStatisticUpdate {
  gamesPlayed?: number;
  gamesWon?: number;
  gamesLost?: number;
  winStreak?: number;
  bestWinStreak?: number;
  score?: number;
}

interface IStatisticBulkCreate {
  userId: string;
  gamesPlayed?: number;
  gamesWon?: number;
  gamesLost?: number;
  winStreak?: number;
  bestWinStreak?: number;
  score?: number;
}

export class StatisticRepository {
  private static repository = AppDataSource.getRepository(Statistic);

  static async create(userId: string): Promise<Either<Errors, Statistic>> {
    try {
      const statistic = this.repository.create({
        userId,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        winStreak: 0,
        bestWinStreak: 0,
        score: 0
      });
      const savedStatistic = await this.repository.save(statistic);
      return Success.create(savedStatistic);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async insertMany(statistics: IStatisticBulkCreate[]): Promise<Either<Errors, Statistic[]>> {
    try {
      const statisticsToCreate = statistics.map(stat => ({
        userId: stat.userId,
        gamesPlayed: stat.gamesPlayed || 1,
        gamesWon: stat.gamesWon || 0,
        gamesLost: stat.gamesLost || 1,
        winStreak: 0,
        bestWinStreak: stat.bestWinStreak || 0,
        score: stat.score || 0
      }));

      const createdStatistics = this.repository.create(statisticsToCreate);
      const savedStatistics = await this.repository.save(createdStatistics);
      
      return Success.create(savedStatistics);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findByUserId(userId: string): Promise<Either<Errors, Statistic | null>> {
    try {
      const statistic = await this.repository.findOne({
        where: { userId },
        relations: ['user', 'attempts']
      });
      return Success.create(statistic);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async updateGameResult(userId: string, won: boolean, scoreIncrement: number): Promise<Either<Errors, Statistic | null>> {
    try {
      const statistic = await this.repository.findOne({ where: { userId } });
      
      if (!statistic) {
        return Failure.create(Errors.NOT_FOUND);
      }

      const updateData: IStatisticUpdate = {
        gamesPlayed: statistic.gamesPlayed + 1,
        score: statistic.score + scoreIncrement
      };

      if (won) {
        updateData.gamesWon = statistic.gamesWon + 1;
        updateData.winStreak = statistic.winStreak + 1;
        updateData.bestWinStreak = Math.max(statistic.bestWinStreak, updateData.winStreak);
      } else {
        updateData.gamesLost = statistic.gamesLost + 1;
        updateData.winStreak = 0;
      }

      await this.repository.update(statistic.id, updateData);
      
      const updatedStatistic = await this.repository.findOne({
        where: { id: statistic.id },
        relations: ['user', 'attempts']
      });
      
      return Success.create(updatedStatistic);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async resetStreak(userId: string): Promise<Either<Errors, void>> {
    try {
      await this.repository.update({ userId }, { winStreak: 0 });
      return Success.create(undefined);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findTopScores(limit: number = 10): Promise<Either<Errors, Statistic[]>> {
    try {
      const statistics = await this.repository.find({
        relations: ['user'],
        order: { score: 'DESC' },
        take: limit
      });
      return Success.create(statistics);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findAllScoresOrdered(): Promise<Either<Errors, Statistic[]>> {
    try {
      const statistics = await this.repository.find({
        relations: ['user'],
        order: { score: 'DESC' }
      });
      return Success.create(statistics);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}