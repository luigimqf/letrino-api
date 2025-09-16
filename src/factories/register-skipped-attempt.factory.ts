import { AppDataSource } from '../config/db/data-source';
import { SkippedAttempt, Match, UsedWord } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { RegisterSkippedAttemptController } from '../controllers/register-skipped-attempt.controller';
import { MatchRepository } from '../repositories/match.repository';
import { SkippedAttemptRepository } from '../repositories/skipped_attempt.repository';
import { UsedWordRepository } from '../repositories/used_word.repository';
import { RegisterSkippedAttemptUseCase } from '../usecases/register-skipped-attempt.usecase';

export const registerSkippedAttemptFactory = (): IController => {
  const skippedAttemptRepository = new SkippedAttemptRepository(
    AppDataSource.getRepository(SkippedAttempt)
  );
  const usedWordRepository = new UsedWordRepository(
    AppDataSource.getRepository(UsedWord)
  );
  const matchRepository = new MatchRepository(
    AppDataSource.getRepository(Match)
  );

  const registerSkippedAttemptUsecase = new RegisterSkippedAttemptUseCase(
    skippedAttemptRepository,
    usedWordRepository
  );
  const registerSkippedAttemptController = new RegisterSkippedAttemptController(
    registerSkippedAttemptUsecase
  );
  return registerSkippedAttemptController;
};
