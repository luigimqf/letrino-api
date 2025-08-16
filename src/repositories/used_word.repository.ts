/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataSource } from "../config/db";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";
import { UsedWord } from "../config/db/entity";
import { IsNull } from "typeorm";

export class UsedWordRepository {
  private static repository = AppDataSource.getRepository(UsedWord);

  static async find(conditions: Partial<UsedWord> = {}, distinct?: string): Promise<Either<Errors, unknown[] | UsedWord[]>> {
    try {
      let result;
      
      if (distinct) {
        const queryBuilder = this.repository.createQueryBuilder('usedWord');
        
        Object.entries(conditions).forEach(([key, value]) => {
          if (value === undefined) {
            queryBuilder.andWhere(`usedWord.${key} IS NULL`);
          } else {
            queryBuilder.andWhere(`usedWord.${key} = :${key}`, { [key]: value });
          }
        });
        
        const rawResult = await queryBuilder.select(`DISTINCT usedWord.${distinct}`).getRawMany();
        result = rawResult.map(item => item[`usedWord_${distinct}`]);
      } else {
        const whereConditions: any = {};
        
        Object.entries(conditions).forEach(([key, value]) => {
          if (value === undefined) {
            whereConditions[key] = IsNull();
          } else {
            whereConditions[key] = value;
          }
        });
        
        result = await this.repository.find({ where: whereConditions });
      }
            
      return Success.create(result);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async createUsedWord({ wordId }: { wordId: string }): Promise<Either<Errors, UsedWord>> {
    try {
      const newUsedWord = this.repository.create({ wordId });
      const savedUsedWord = await this.repository.save(newUsedWord);
      return Success.create(savedUsedWord);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findTodaysWord(): Promise<Either<Errors, UsedWord | null>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysWord = await this.repository
        .createQueryBuilder('usedWord')
        .where('usedWord.createdAt >= :today', { today })
        .andWhere('usedWord.createdAt < :tomorrow', { tomorrow })
        .andWhere('usedWord.deletedAt IS NULL')
        .getOne();

      return Success.create(todaysWord);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async countDocuments(conditions?: Partial<UsedWord>): Promise<Either<Errors, number>> {
    try {
      const whereConditions: any = {};
      
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          if (value === undefined) {
            whereConditions[key] = IsNull();
          } else {
            whereConditions[key] = value;
          }
        });
      }
      
      const count = await this.repository.count({ where: whereConditions });
      return Success.create(count);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async updateMany(filter: Partial<UsedWord>, updateData: Partial<UsedWord>): Promise<Either<Errors, boolean>> {
    try {
      const whereConditions: any = {};
      
      Object.entries(filter).forEach(([key, value]) => {
        if (value === undefined) {
          whereConditions[key] = IsNull();
        } else {
          whereConditions[key] = value;
        }
      });
      
      const result = await this.repository.update(whereConditions, updateData);
      return Success.create(result.affected !== undefined && result.affected > 0);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}