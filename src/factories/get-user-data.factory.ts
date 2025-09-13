import { AppDataSource } from '../config/db/data-source';
import { Statistic, User } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { GetUserDataController } from '../controllers/get-user-data.controller';
import { StatisticRepository } from '../repositories/statistic.repository';
import { UserRepository } from '../repositories/user.repository';
import { GetUserDataUseCase } from '../usecases/get-user-data.usecase';

export const getUserDataFactory = (): IController => {
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const staticticRepository = new StatisticRepository(
    AppDataSource.getRepository(Statistic)
  );
  const getUserDataUsecase = new GetUserDataUseCase(
    userRepository,
    staticticRepository
  );
  const getUserDataController = new GetUserDataController(getUserDataUsecase);
  return getUserDataController;
};
