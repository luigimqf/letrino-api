import { AppDataSource } from "../config/db";
import { Statistic } from "../config/db/entity";
import { Errors } from "../constants/error";
import { EStatistics } from "../constants/statistic";
import { Either, Failure, Success } from "../utils/either";
import { MoreThanOrEqual, LessThan, Between } from "typeorm";

interface IStatisticCreate {
  wordId: string;
  attempt?: string;
  userId: string;
  type: EStatistics;
}

interface IDateRange {
  gte?: Date;
  lt?: Date;
}

interface IStatisticConditions {
  wordId?: string;
  userId?: string;
  type?: EStatistics;
  createdAt?: IDateRange;
}

export class StatisticRepository {
  private static repository = AppDataSource.getRepository(Statistic);

  static async create({ wordId, attempt, userId, type }: IStatisticCreate): Promise<Either<Errors, Statistic>> {
    try {
      const statistic = this.repository.create({ wordId, attempt, userId, type });
      const savedStatistic = await this.repository.save(statistic);
      return Success.create(savedStatistic);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
  
  static async findOne(conditions: Partial<Statistic>): Promise<Either<Errors, Statistic | null>> {
    try {
      const statistic = await this.repository.findOne({ where: conditions });
      return Success.create(statistic);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async countDocuments(conditions: IStatisticConditions): Promise<Either<Errors, number>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('statistic');
      
      if (conditions.wordId) {
        queryBuilder.andWhere('statistic.wordId = :wordId', { wordId: conditions.wordId });
      }
      
      if (conditions.userId) {
        queryBuilder.andWhere('statistic.userId = :userId', { userId: conditions.userId });
      }
      
      if (conditions.type) {
        queryBuilder.andWhere('statistic.type = :type', { type: conditions.type });
      }
      
      if (conditions.createdAt) {
        const { gte, lt } = conditions.createdAt;
        
        if (gte) {
          queryBuilder.andWhere('statistic.createdAt >= :gte', { gte });
        }
        
        if (lt) {
          queryBuilder.andWhere('statistic.createdAt < :lt', { lt });
        }
      }
      
      const count = await queryBuilder.getCount();
      return Success.create(count);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async insertMany(statistics: Partial<Statistic>[]): Promise<Either<Errors, Statistic[]>> {
    try {
      const entities = this.repository.create(statistics);
      const savedEntities = await this.repository.save(entities);
      return Success.create(savedEntities);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}