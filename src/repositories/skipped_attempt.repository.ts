import { AppDataSource } from "../config/db/data-source";
import { Either, Failure, Success } from "../utils/either";
import { ISkippedWord } from "../config/models/word.model";
import { Errors } from "../constants/error";
import { SkippedAttempt } from "../config/db/entity";
import { OmitedModelFields } from "../types";
import { FindOptionsWhere, IsNull } from "typeorm";

interface IDateRange {
  gte?: Date;
  lt?: Date;
}

interface ISkippedAttemptConditions {
  wordId?: string;
  userId?: string;
  deletedAt?: Date | null;
  createdAt?: IDateRange;
}

export class SkippedAttemptRepository {
  private static repository = AppDataSource.getRepository(SkippedAttempt);

  static async create(data: OmitedModelFields<ISkippedWord>): Promise<Either<Errors, SkippedAttempt>> {
    try {
      const newDoc = this.repository.create(data);
      const savedDoc = await this.repository.save(newDoc);
      return Success.create(savedDoc);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async find(conditions: ISkippedAttemptConditions): Promise<Either<Errors, SkippedAttempt[]>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('skippedAttempt');
      
      if (conditions.wordId) {
        queryBuilder.andWhere('skippedAttempt.wordId = :wordId', { wordId: conditions.wordId });
      }
      
      if (conditions.userId) {
        queryBuilder.andWhere('skippedAttempt.userId = :userId', { userId: conditions.userId });
      }
      
      if (conditions.deletedAt !== undefined) {
        if (conditions.deletedAt === null) {
          queryBuilder.andWhere('skippedAttempt.deletedAt IS NULL');
        } else {
          queryBuilder.andWhere('skippedAttempt.deletedAt = :deletedAt', { deletedAt: conditions.deletedAt });
        }
      }
      
      if (conditions.createdAt) {
        const { gte, lt } = conditions.createdAt;
        
        if (gte) {
          queryBuilder.andWhere('skippedAttempt.createdAt >= :gte', { gte });
        }
        
        if (lt) {
          queryBuilder.andWhere('skippedAttempt.createdAt < :lt', { lt });
        }
      }
      
      const skippedWords = await queryBuilder.getMany();
      return Success.create(skippedWords);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findOne(conditions: ISkippedAttemptConditions): Promise<Either<Errors, SkippedAttempt | null>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('skippedAttempt');
      
      if (conditions.wordId) {
        queryBuilder.andWhere('skippedAttempt.wordId = :wordId', { wordId: conditions.wordId });
      }
      
      if (conditions.userId) {
        queryBuilder.andWhere('skippedAttempt.userId = :userId', { userId: conditions.userId });
      }
      
      if (conditions.deletedAt !== undefined) {
        if (conditions.deletedAt === null) {
          queryBuilder.andWhere('skippedAttempt.deletedAt IS NULL');
        } else {
          queryBuilder.andWhere('skippedAttempt.deletedAt = :deletedAt', { deletedAt: conditions.deletedAt });
        }
      }
      
      if (conditions.createdAt) {
        const { gte, lt } = conditions.createdAt;
        
        if (gte) {
          queryBuilder.andWhere('skippedAttempt.createdAt >= :gte', { gte });
        }
        
        if (lt) {
          queryBuilder.andWhere('skippedAttempt.createdAt < :lt', { lt });
        }
      }
      
      const skippedWord = await queryBuilder.getOne();
      return Success.create(skippedWord);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async delete(conditions: FindOptionsWhere<SkippedAttempt>): Promise<Either<Errors, SkippedAttempt | null>> {
    try {
      const skippedWord = await this.repository.findOne({ where: conditions });
      
      if (!skippedWord) {
        return Success.create(null);
      }
      
      const result = await this.repository.remove(skippedWord);
      return Success.create(result);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}