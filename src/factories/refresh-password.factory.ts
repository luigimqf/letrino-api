import { AppDataSource } from '../config/db/data-source';
import { User } from '../config/db/entity';
import { Token } from '../config/db/entity/Token';
import { IController } from '../controllers/create-user.controller';
import { RefreshPasswordController } from '../controllers/refresh-password.controller';
import { TokenRepository } from '../repositories/token.repository';
import { UserRepository } from '../repositories/user.repository';
import { RefreshPasswordUseCase } from '../usecases/refresh-password.usecase';

export const refreshPasswordFactory = (): IController => {
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const tokenRepository = new TokenRepository(
    AppDataSource.getRepository(Token)
  );
  const refreshPasswordUsecase = new RefreshPasswordUseCase(
    userRepository,
    tokenRepository
  );
  const refreshPasswordController = new RefreshPasswordController(
    refreshPasswordUsecase
  );
  return refreshPasswordController;
};
