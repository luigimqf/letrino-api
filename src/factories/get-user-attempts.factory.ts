import { AppDataSource } from '../config/db/data-source';
import { Attempt } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { GetUserAttemptController } from '../controllers/get-user-attempts.controller';
import { AttemptRepository } from '../repositories/attempt.repository';
import { GetUserAttemptsUseCase } from '../usecases/get-user-attempts.usecase';

export const getUserAttemptsFactory = (): IController => {
  const attemptRepository = new AttemptRepository(
    AppDataSource.getRepository(Attempt)
  );
  const getUserAttemptsUsecase = new GetUserAttemptsUseCase(attemptRepository);
  const getUserAttemptsController = new GetUserAttemptController(
    getUserAttemptsUsecase
  );
  return getUserAttemptsController;
};
