import { AppDataSource } from "../config/db";
import { UsedWord, Word } from "../config/db/entity";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";

export class WordRepository {
  private static repository = AppDataSource.getRepository(Word);
  private static usedWordRepository = AppDataSource.getRepository(UsedWord);

  static async find(id: string): Promise<Either<Errors, Word>> {
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

  static async findOneRandom(conditions: Partial<Word>): Promise<Either<Errors, Word | null>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('word');
      
      Object.entries(conditions).forEach(([key, value]) => {
        queryBuilder.andWhere(`word.${key} = :${key}`, { [key]: value });
      });
      
      queryBuilder.orderBy('RANDOM()').limit(1);
      
      const word = await queryBuilder.getOne();
      return Success.create(word);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findUnexistedWordIn(excludeIds: string[], size: number = 1, filter?: Partial<Word>): Promise<Either<Errors, Word | null>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('word');
      
      if (excludeIds.length > 0) {
        queryBuilder.where('word.id NOT IN (:...excludeIds)', { excludeIds });
      }
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          queryBuilder.andWhere(`word.${key} = :${key}`, { [key]: value });
        });
      }
      
      queryBuilder.orderBy('RANDOM()').limit(size);
      
      const word = await queryBuilder.getOne();
      return Success.create(word);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findRandom(): Promise<Either<Errors, Word | null>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysWord = await this.usedWordRepository
        .createQueryBuilder('usedWord')
        .leftJoinAndSelect('usedWord.word', 'word')
        .where('usedWord.createdAt >= :today', { today })
        .andWhere('usedWord.createdAt < :tomorrow', { tomorrow })
        .andWhere('usedWord.deletedAt IS NULL')
        .getOne();

      if (todaysWord) {
        return Success.create(todaysWord.word);
      }

      const usedWordIds = await this.usedWordRepository
        .createQueryBuilder('usedWord')
        .select('usedWord.wordId')
        .where('usedWord.deletedAt IS NULL')
        .getRawMany();

      const excludeIds = usedWordIds.map(item => item.usedWord_wordId);

      const queryBuilder = this.repository.createQueryBuilder('word');
      
      if (excludeIds.length > 0) {
        queryBuilder.where('word.id NOT IN (:...excludeIds)', { excludeIds });
      }
      
      queryBuilder.orderBy('RANDOM()').limit(1);
      
      const randomWord = await queryBuilder.getOne();

      if (!randomWord) {
        return Failure.create(Errors.NOT_FOUND);
      }

      const newUsedWord = this.usedWordRepository.create({
        wordId: randomWord.id,
      });

      await this.usedWordRepository.save(newUsedWord);

      return Success.create(randomWord);
    } catch (error) {
      console.error(error);
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async countDocuments(): Promise<Either<Errors, number>> {
    try {
      const totalWords = await this.repository.count();
      return Success.create(totalWords);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}