import { AppDataSource } from "../config/db";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";
import { IWordRelatedDocument } from "../config/models/word.model";
import { UsedWord } from "../config/db/entity";

export class UsedWordRepository {
  private static repository = AppDataSource.getRepository(UsedWord);

  static async find(conditions: Partial<UsedWord> = {}, distinct?: string): Promise<Either<Errors, unknown[] | null>> {
    try {
      let result;
      
      if (distinct) {
        const queryBuilder = this.repository.createQueryBuilder('usedWord');
        Object.entries(conditions).forEach(([key, value]) => {
          queryBuilder.andWhere(`usedWord.${key} = :${key}`, { [key]: value });
        });
        result = await queryBuilder.select(`DISTINCT usedWord.${distinct}`).getRawMany();
        result = result.map(item => item[`usedWord_${distinct}`]);
      } else {
        result = await this.repository.find({ where: conditions });
      }
            
      return Success.create(result);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async createUsedWord({ wordId }: { wordId: string }): Promise<Either<Errors, null>> {
    try {
      const newUsedWord = this.repository.create({ wordId });
      await this.repository.save(newUsedWord);
      return Success.create(null);
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
      const count = await this.repository.count({ where: conditions });
      return Success.create(count);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async updateMany(filter: Partial<UsedWord>, update: Partial<UsedWord>): Promise<Either<Errors, boolean>> {
    try {
      await this.repository.update(filter, update);
      return Success.create(true);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}