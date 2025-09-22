import { AppDataSource } from '../config/db/data-source';
import { User } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { GetUserDataController } from '../controllers/get-user-data.controller';
import { UserRepository } from '../repositories/user.repository';
import { GetUserDataUseCase } from '../usecases/get-user-data.usecase';

export const getUserDataFactory = (): IController => {
  const userRepository = new UserRepository(AppDataSource.getRepository(User));

  const getUserDataUsecase = new GetUserDataUseCase(userRepository);
  const getUserDataController = new GetUserDataController(getUserDataUsecase);
  return getUserDataController;
};
