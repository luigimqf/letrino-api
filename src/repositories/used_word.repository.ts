/* eslint-disable @typescript-eslint/no-explicit-any */
import { Errors } from '../constants/error';
import { Either, Failure, Success } from '../utils/either';
import { UsedWord } from '../config/db/entity';
import { Between, IsNull, Repository } from 'typeorm';
import { DateUtils } from '../utils/date';

export interface IUsedWordRepository {
  find(
    conditions?: Partial<UsedWord>,
    distinct?: string
  ): Promise<Either<Errors, unknown[] | UsedWord[]>>;
  createUsedWord(data: {
    wordId: string;
    id: string;
  }): Promise<Either<Errors, UsedWord>>;
  findUserWord(id: string): Promise<Either<Errors, UsedWord | null>>;
  findUserUsedWords(id: string): Promise<Either<Errors, UsedWord[]>>;
  countDocuments(
    conditions?: Partial<UsedWord>
  ): Promise<Either<Errors, number>>;
  updateMany(
    filter: Partial<UsedWord>,
    updateData: Partial<UsedWord>
  ): Promise<Either<Errors, boolean>>;
}

export class UsedWordRepository implements IUsedWordRepository {
  constructor(private readonly repository: Repository<UsedWord>) {}

  async find(
    conditions: Partial<UsedWord> = {},
    distinct?: string
  ): Promise<Either<Errors, unknown[] | UsedWord[]>> {
    try {
      let result;

      if (distinct) {
        const queryBuilder = this.repository.createQueryBuilder('usedWord');

        Object.entries(conditions).forEach(([key, value]) => {
          if (value === undefined) {
            queryBuilder.andWhere(`usedWord.${key} IS NULL`);
          } else {
            queryBuilder.andWhere(`usedWord.${key} = :${key}`, {
              [key]: value,
            });
          }
        });

        const rawResult = await queryBuilder
          .select(`DISTINCT usedWord.${distinct}`)
          .getRawMany();
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

  async createUsedWord({
    wordId,
    id,
  }: {
    wordId: string;
    id: string;
  }): Promise<Either<Errors, UsedWord>> {
    try {
      const newUsedWord = this.repository.create({
        wordId,
        userId: id,
      });
      const savedUsedWord = await this.repository.save(newUsedWord);
      return Success.create(savedUsedWord);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async findUserWord(id: string): Promise<Either<Errors, UsedWord | null>> {
    try {
      const dayAtStart = DateUtils.startOfDay();
      const dayAtEnd = DateUtils.endOfDay();

      const todaysWord = await this.repository.findOneBy({
        userId: id,
        createdAt: Between(dayAtStart, dayAtEnd),
        deletedAt: IsNull(),
      });

      return Success.create(todaysWord);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async findUserUsedWords(id: string): Promise<Either<Errors, UsedWord[]>> {
    try {
      const usedWords = await this.repository.find({
        where: { userId: id, deletedAt: IsNull() },
      });
      return Success.create(usedWords);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async countDocuments(
    conditions?: Partial<UsedWord>
  ): Promise<Either<Errors, number>> {
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

  async updateMany(
    filter: Partial<UsedWord>,
    updateData: Partial<UsedWord>
  ): Promise<Either<Errors, boolean>> {
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
      return Success.create(
        result.affected !== undefined && result.affected > 0
      );
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}
