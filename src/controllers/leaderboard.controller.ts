import { Response } from 'express'
import z from 'zod';
import { Errors } from '../constants/error';
import { notFound, ok, serverError } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';
import { StatisticRepository } from '../repositories/statistic.repository';
import { AuthenticateRequest } from '../types';
import { Jwt } from '../utils/jwt';
import { Validate } from '../utils/validator';

const scoreSchema = z.object({
  score: z.number({
    message: 'Score must be a number'
  })
});

const idParamsSchema = z.object({
  id: z.string().nonempty('ID is required')
});

class LeaderboardController {
  async getLeaderboard(req: AuthenticateRequest, res: Response) {
    try {
      const statisticsResult = await StatisticRepository.findTopScores(10);

      if(statisticsResult.isFailure()) {
        notFound(res, statisticsResult.error);
        return;
      }
      
      const leaderboard = statisticsResult.value ?? [];

      const leaderboardFormatted = leaderboard.map((statistic, index) => {
        const { user, score } = statistic;

        return {
          avatar: user.avatar,
          username: user.username,
          score,
          position: index + 1
        }
      });

      const token = req.headers.authorization?.split(' ')[1];

      const decoded = Jwt.verify(token ?? '');

      const id = decoded.isSuccess() ? decoded.value.id ?? '' : '';

      const user = await UserRepository.findById(id);

      if(user.isFailure() || !user.value.id) {
        ok(res,{
          leaderboard: leaderboardFormatted
        });
        return;
      }

      const userStatistic = await StatisticRepository.findByUserId(id);

      if(userStatistic.isFailure() || !userStatistic.value) {
        ok(res,{
          leaderboard: leaderboardFormatted
        });
        return;
      }

      const isUserInTop10 = leaderboard.find((s) => s.userId === id);

      if(isUserInTop10) {
        ok(res, {
          leaderboard: leaderboardFormatted,
        });
        return;
      }

      // Buscar posição do usuário no ranking geral
      const allStatisticsResult = await StatisticRepository.findTopScores(1000); // ou implementar método específico
      
      if(allStatisticsResult.isSuccess()) {
        const userPosition = allStatisticsResult.value.findIndex((s) => s.userId === id) + 1;

        ok(res, {
          leaderboard: leaderboardFormatted,
          user: {
            avatar: user.value.avatar,
            username: user.value.username,
            score: userStatistic.value.score,
            position: userPosition || 'Unranked'
          }
        });
        return;
      }

      ok(res, {
        leaderboard: leaderboardFormatted
      });

    } catch (error) {
      serverError(res);
    }
  }

  @Validate({
    body: scoreSchema,
    params: idParamsSchema,
  })
  async updateScore(req: AuthenticateRequest, res: Response) {
    try { 
      const { id } = req.params;
      const { score } = req.body;
      
      const updateResult = await StatisticRepository.updateGameResult(id, true, score);

      if(updateResult.isFailure()) {
        notFound(res, updateResult.error);
        return;
      }
      
      const updatedStatistic = updateResult.value;
      
      ok(res, {
        message: `Score updated successfully: new score is ${updatedStatistic?.score}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: Errors.SERVER_ERROR
      })
    }
  }
}

const leaderboardController = new LeaderboardController();

export const getLeaderboard = leaderboardController.getLeaderboard.bind(leaderboardController);
export const updateScore = leaderboardController.updateScore.bind(leaderboardController);
