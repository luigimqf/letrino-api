import { AppDataSource } from '../config/db/data-source';
import { Statistic, User } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { GetLeaderboardController } from '../controllers/get-leaderboard.controller';
import { StatisticRepository } from '../repositories/statistic.repository';
import { UserRepository } from '../repositories/user.repository';
import { GetLeaderboardUseCase } from '../usecases/get-leaderboard.usecase';

export const getLeaderboardFactory = (): IController => {
  const statisticRepository = new StatisticRepository(
    AppDataSource.getRepository(Statistic)
  );

  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const getLeaderboardUseCase = new GetLeaderboardUseCase(
    statisticRepository,
    userRepository
  );
  const getLeaderboardController = new GetLeaderboardController(
    getLeaderboardUseCase
  );
  return getLeaderboardController;
};
