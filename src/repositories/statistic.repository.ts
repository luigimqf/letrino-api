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
  [key: string]: unknown;
}

export class StatisticRepository {
  private static repository = AppDataSource.getRepository(Statistic);

  static async create({ wordId, attempt, userId, type }: IStatisticCreate): Promise<Either<Errors, undefined>> {
    try {
      const statistic = this.repository.create({ wordId, attempt, userId, type });
      await this.repository.save(statistic);
      return Success.create(undefined);
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
      const whereConditions: Record<string, unknown> = { ...conditions };
      
      if (conditions.createdAt) {
        delete whereConditions.createdAt;
        const { gte, lt } = conditions.createdAt;
        
        if (gte && lt) {
          whereConditions.createdAt = Between(gte, lt);
        } else if (gte) {
          whereConditions.createdAt = MoreThanOrEqual(gte);
        } else if (lt) {
          whereConditions.createdAt = LessThan(lt);
        }
      }
      
      const count = await this.repository.count({ where: whereConditions });
      return Success.create(count);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async insertMany(statistics: Partial<Statistic>[]): Promise<Either<Errors, void>> {
    try {
      const entities = this.repository.create(statistics);
      await this.repository.save(entities);
      return Success.create(undefined);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}