import { AppDataSource } from '../config/db/data-source';
import { User } from '../config/db/entity';
import { Token } from '../config/db/entity/Token';
import { IController } from '../controllers/create-user.controller';
import { ForgotPasswordController } from '../controllers/forgot-password.controller';
import { TokenRepository } from '../repositories/token.repository';
import { UserRepository } from '../repositories/user.repository';
import { ForgotPasswordUseCase } from '../usecases/forgot-password.usecase';

export const forgotPasswordFactory = (): IController => {
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const tokenRepository = new TokenRepository(
    AppDataSource.getRepository(Token)
  );
  const forgotPasswordUsecase = new ForgotPasswordUseCase(
    userRepository,
    tokenRepository
  );
  const forgotPasswordController = new ForgotPasswordController(
    forgotPasswordUsecase
  );
  return forgotPasswordController;
};
