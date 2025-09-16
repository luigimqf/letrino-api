import { AppDataSource } from '../config/db/data-source';
import { Match, User } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { GetUserDataController } from '../controllers/get-user-data.controller';
import { MatchRepository } from '../repositories/match.repository';
import { UserRepository } from '../repositories/user.repository';
import { GetUserDataUseCase } from '../usecases/get-user-data.usecase';

export const getUserDataFactory = (): IController => {
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const matchRepository = new MatchRepository(
    AppDataSource.getRepository(Match)
  );
  const getUserDataUsecase = new GetUserDataUseCase(
    userRepository,
    matchRepository
  );
  const getUserDataController = new GetUserDataController(getUserDataUsecase);
  return getUserDataController;
};
