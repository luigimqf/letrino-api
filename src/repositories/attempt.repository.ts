/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataSource } from '../config/db/data-source';
import { Attempt } from '../config/db/entity/Attempt';
import { Errors } from '../constants/error';
import { EStatistics } from '../constants/statistic';
import { Either, Failure, Success } from '../utils/either';
import { Between, MoreThanOrEqual, LessThan } from 'typeorm';

interface IAttemptCreate {
  userId: string;
  statisticId: string;
  wordId: string;
  result: EStatistics;
  userInput: string;
}

interface IDateRange {
  gte?: Date;
  lt?: Date;
}

interface IAttemptConditions {
  userId?: string;
  wordId?: string;
  statisticId?: string;
  result?: EStatistics;
  createdAt?: IDateRange;
}

export class AttemptRepository {
  private static repository = AppDataSource.getRepository(Attempt);

  static async create({
    userId,
    userInput,
    statisticId,
    wordId,
    result,
  }: IAttemptCreate): Promise<Either<Errors, Attempt>> {
    try {
      const attempt = this.repository.create({
        userId,
        statisticId,
        wordId,
        result,
        userInput,
      });
      const savedAttempt = await this.repository.save(attempt);
      return Success.create(savedAttempt);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findByStatisticId(
    statisticId: string
  ): Promise<Either<Errors, Attempt[]>> {
    try {
      const attempts = await this.repository.find({
        where: { statisticId },
        relations: ['user', 'word', 'statistic'],
        order: { createdAt: 'ASC' },
      });
      return Success.create(attempts);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async countDocuments(
    conditions: IAttemptConditions
  ): Promise<Either<Errors, number>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('attempt');

      if (conditions.userId) {
        queryBuilder.andWhere('attempt.userId = :userId', {
          userId: conditions.userId,
        });
      }

      if (conditions.wordId) {
        queryBuilder.andWhere('attempt.wordId = :wordId', {
          wordId: conditions.wordId,
        });
      }

      if (conditions.statisticId) {
        queryBuilder.andWhere('attempt.statisticId = :statisticId', {
          statisticId: conditions.statisticId,
        });
      }

      if (conditions.result) {
        queryBuilder.andWhere('attempt.result = :result', {
          result: conditions.result,
        });
      }

      if (conditions.createdAt) {
        const { gte, lt } = conditions.createdAt;

        if (gte) {
          queryBuilder.andWhere('attempt.createdAt >= :gte', { gte });
        }

        if (lt) {
          queryBuilder.andWhere('attempt.createdAt < :lt', { lt });
        }
      }

      const count = await queryBuilder.getCount();
      return Success.create(count);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findTodaysAttempts(
    userId: string
  ): Promise<Either<Errors, Attempt[]>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attempts = await this.repository.find({
        where: {
          userId,
          createdAt: Between(today, tomorrow),
        },
        select: {
          result: true,
          wordId: true,
          userInput: true,
        },
      });

      return Success.create(attempts);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async find(
    conditions: IAttemptConditions
  ): Promise<Either<Errors, Attempt[]>> {
    try {
      const whereConditions: any = {};

      if (conditions.userId) {
        whereConditions.userId = conditions.userId;
      }

      if (conditions.wordId) {
        whereConditions.wordId = conditions.wordId;
      }

      if (conditions.statisticId) {
        whereConditions.statisticId = conditions.statisticId;
      }

      if (conditions.result) {
        whereConditions.result = conditions.result;
      }

      if (conditions.createdAt) {
        const { gte, lt } = conditions.createdAt;

        if (gte && lt) {
          whereConditions.createdAt = Between(gte, lt);
        } else if (gte) {
          whereConditions.createdAt = MoreThanOrEqual(gte);
        } else if (lt) {
          whereConditions.createdAt = LessThan(lt);
        }
      }

      const attempts = await this.repository.find({
        where: whereConditions,
        relations: ['user', 'word', 'statistic'],
        order: { createdAt: 'ASC' },
      });

      return Success.create(attempts);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}
