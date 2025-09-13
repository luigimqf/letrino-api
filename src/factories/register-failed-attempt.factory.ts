import { AppDataSource } from '../config/db/data-source';
import { Attempt, Statistic, UsedWord, Word } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { RegisterFailedAttemptController } from '../controllers/register-failed-attempt.controller';
import { AttemptRepository } from '../repositories/attempt.repository';
import { StatisticRepository } from '../repositories/statistic.repository';
import { UsedWordRepository } from '../repositories/used_word.repository';
import { WordRepository } from '../repositories/word.repository';
import { RegisterFailedAttemptUseCase } from '../usecases/register-failed-attempt.usecase';

export const registerFailedAttemptFactory = (): IController => {
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
  const registerFailedAttemptUsecase = new RegisterFailedAttemptUseCase(
    attemptRepository,
    statisticRepository,
    usedWordRepository,
    wordRepository
  );
  const registerFailedAttemptController = new RegisterFailedAttemptController(
    registerFailedAttemptUsecase
  );
  return registerFailedAttemptController;
};
