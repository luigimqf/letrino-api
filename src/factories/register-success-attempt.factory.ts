import { AppDataSource } from '../config/db/data-source';
import { Attempt, Statistic, UsedWord, User, Word } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { RegisterSuccessAttemptController } from '../controllers/register-success-attempt.controller';
import { AttemptRepository } from '../repositories/attempt.repository';
import { StatisticRepository } from '../repositories/statistic.repository';
import { UsedWordRepository } from '../repositories/used_word.repository';
import { WordRepository } from '../repositories/word.repository';
import { RegisterSuccessAttemptUseCase } from '../usecases/register-success-attempt.usecase';

export const registerSuccessAttemptFactory = (): IController => {
  const usedWordRepository = new UsedWordRepository(
    AppDataSource.getRepository(UsedWord)
  );
  const statisticRepository = new StatisticRepository(
    AppDataSource.getRepository(Statistic)
  );
  const attemptRepository = new AttemptRepository(
    AppDataSource.getRepository(Attempt)
  );
  const wordRepository = new WordRepository(AppDataSource.getRepository(Word));
  const registerSuccessAttemptUsecase = new RegisterSuccessAttemptUseCase(
    attemptRepository,
    statisticRepository,
    usedWordRepository,
    wordRepository
  );
  const registerSuccessAttemptController = new RegisterSuccessAttemptController(
    registerSuccessAttemptUsecase
  );
  return registerSuccessAttemptController;
};
