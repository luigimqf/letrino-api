import { AppDataSource } from '../config/db/data-source';
import { SkippedAttempt } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { DeleteSkippedAttemptController } from '../controllers/delete-skipped-attempt.controller';
import { SkippedAttemptRepository } from '../repositories/skipped_attempt.repository';
import { DeleteSkippedAttemptUseCase } from '../usecases/delete-skipped-attempt.usecase';

export const deleteSkippedAttemptFactory = (): IController => {
  const skippedAttemptRepository = new SkippedAttemptRepository(
    AppDataSource.getRepository(SkippedAttempt)
  );

  const deleteSkippedAttemptUsecase = new DeleteSkippedAttemptUseCase(
    skippedAttemptRepository
  );
  const deleteSkippedAttemptController = new DeleteSkippedAttemptController(
    deleteSkippedAttemptUsecase
  );
  return deleteSkippedAttemptController;
};
