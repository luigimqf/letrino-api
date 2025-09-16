import { In, Not, Repository } from 'typeorm';
import { Word } from '../config/db/entity';
import { Errors } from '../constants/error';
import { Either, Failure, Success } from '../utils/either';

export interface IWordRepository {
  find(id: string): Promise<Either<Errors, Word>>;
  findOneRandom(exclude?: string[]): Promise<Either<Errors, Word>>;
  countDocuments(): Promise<Either<Errors, number>>;
}

export class WordRepository implements IWordRepository {
  constructor(private readonly repository: Repository<Word>) {}

  async find(id: string): Promise<Either<Errors, Word>> {
    try {
      const word = await this.repository.findOne({ where: { id } });

      if (!word) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(word);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async findOneRandom(exclude = []): Promise<Either<Errors, Word>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('word');

      if (exclude.length) {
        queryBuilder.where('word.id NOT IN (:...exclude)', { exclude });
      }

      const word = await queryBuilder.orderBy('RANDOM()').limit(1).getOne();

      if (!word) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(word);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async countDocuments(): Promise<Either<Errors, number>> {
    try {
      const totalWords = await this.repository.count();
      return Success.create(totalWords);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}
