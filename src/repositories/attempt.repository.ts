/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataSource } from '../config/db/data-source';
import { Attempt } from '../config/db/entity/Attempt';
import { Errors } from '../constants/error';
import { EAttemptStatus } from '../constants/attempt';
import { DateUtils } from '../utils/date';
import { Either, Failure, Success } from '../utils/either';
import { Between, MoreThanOrEqual, LessThan, Repository } from 'typeorm';

export interface IAttemptRepository {
  create(data: IAttemptCreate): Promise<Either<Errors, Attempt>>;
  findByStatisticId(statisticId: string): Promise<Either<Errors, Attempt[]>>;
  countIncorrectAttemptsToday(userId: string): Promise<Either<Errors, number>>;
  countDocuments(
    conditions: IAttemptConditions
  ): Promise<Either<Errors, number>>;
  findTodaysAttempts(userId: string): Promise<Either<Errors, Attempt[]>>;
  find(conditions: IAttemptConditions): Promise<Either<Errors, Attempt[]>>;
}

interface IAttemptCreate {
  userId: string;
  matchId: string;
  wordId: string;
  result: EAttemptStatus;
  userInput?: string;
}

interface IDateRange {
  gte?: Date;
  lt?: Date;
}

interface IAttemptConditions {
  userId?: string;
  wordId?: string;
  statisticId?: string;
  result?: EAttemptStatus;
  createdAt?: IDateRange;
}

export class AttemptRepository implements IAttemptRepository {
  constructor(private readonly repository: Repository<Attempt>) {}

  async create({
    userId,
    userInput,
    matchId,
    wordId,
    result,
  }: IAttemptCreate): Promise<Either<Errors, Attempt>> {
    try {
      const attempt = this.repository.create({
        userId,
        matchId,
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

  async findByStatisticId(matchId: string): Promise<Either<Errors, Attempt[]>> {
    try {
      const attempts = await this.repository.find({
        where: { matchId },
        relations: ['user', 'word', 'statistic'],
        order: { createdAt: 'ASC' },
      });
      return Success.create(attempts);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async countIncorrectAttemptsToday(
    userId: string
  ): Promise<Either<Errors, number>> {
    try {
      const today = DateUtils.startOfDay();
      const tomorrow = DateUtils.endOfDay();

      const count = await this.repository.count({
        where: {
          userId,
          result: EAttemptStatus.INCORRECT,
          createdAt: Between(today, tomorrow),
        },
      });

      return Success.create(count);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async countDocuments(
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

  async findTodaysAttempts(userId: string): Promise<Either<Errors, Attempt[]>> {
    try {
      const today = DateUtils.startOfDay();
      const tomorrow = DateUtils.endOfDay();

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

  async find(
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
