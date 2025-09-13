import { AppDataSource } from '../config/db/data-source';
import { User } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { ForgotPasswordController } from '../controllers/forgot-password.controller';
import { UserRepository } from '../repositories/user.repository';
import { ForgotPasswordUseCase } from '../usecases/forgot-password.usecase';

export const forgotPasswordFactory = (): IController => {
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const forgotPasswordUsecase = new ForgotPasswordUseCase(userRepository);
  const forgotPasswordController = new ForgotPasswordController(
    forgotPasswordUsecase
  );
  return forgotPasswordController;
};
