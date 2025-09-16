import { AppDataSource } from '../config/db/data-source';
import { Match } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { GetLeaderboardController } from '../controllers/get-leaderboard.controller';
import { MatchRepository } from '../repositories/match.repository';
import { GetLeaderboardUseCase } from '../usecases/get-leaderboard.usecase';

export const getLeaderboardFactory = (): IController => {
  const matchRepository = new MatchRepository(
    AppDataSource.getRepository(Match)
  );

  const getLeaderboardUseCase = new GetLeaderboardUseCase(matchRepository);
  const getLeaderboardController = new GetLeaderboardController(
    getLeaderboardUseCase
  );
  return getLeaderboardController;
};
