import { AppDataSource } from '../config/db/data-source';
import { User } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { RefreshPasswordController } from '../controllers/refresh-password.controller';
import { UserRepository } from '../repositories/user.repository';
import { RefreshPasswordUseCase } from '../usecases/refresh-password.usecase';

export const refreshPasswordFactory = (): IController => {
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const refreshPasswordUsecase = new RefreshPasswordUseCase(userRepository);
  const refreshPasswordController = new RefreshPasswordController(
    refreshPasswordUsecase
  );
  return refreshPasswordController;
};
