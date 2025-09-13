import { AppDataSource } from '../config/db/data-source';
import { Statistic } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { GetUserStatisticController } from '../controllers/get-user-statistic';
import { StatisticRepository } from '../repositories/statistic.repository';
import { GetUserStatisticUseCase } from '../usecases/get-user-statistic.usecase';

export const getUserStatisticFactory = (): IController => {
  const staticticRepository = new StatisticRepository(
    AppDataSource.getRepository(Statistic)
  );
  const getUserStatisticUsecase = new GetUserStatisticUseCase(
    staticticRepository
  );
  const getUserStatisticController = new GetUserStatisticController(
    getUserStatisticUsecase
  );
  return getUserStatisticController;
};
