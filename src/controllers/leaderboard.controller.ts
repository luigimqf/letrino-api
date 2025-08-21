import { Response } from 'express'
import z from 'zod';
import { ErrorCode, Errors } from '../constants/error';
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
        notFound(res);
        return;
      }
      
      const leaderboard = statisticsResult.value ?? [];

      const leaderboardFormatted = leaderboard.map((statistic, index) => {
        const { user, score, gamesPlayed, gamesWon } = statistic;
        const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(2) : "0.00";

        return {
          avatar: user.avatar,
          username: user.username,
          score,
          position: index + 1,
          winRate: parseFloat(winRate)
        }
      });

      const response = {
        leaderboard: leaderboardFormatted
      };

      const token = req.headers.authorization?.split(' ')[1];
      const decoded = Jwt.verify(token ?? '');

      if (decoded.isFailure()) {
        ok(res, response);
        return;
      }

      const id = decoded.value.id ?? '';
      const user = await UserRepository.findById(id);

      if(user.isFailure() || !user.value.id) {
        ok(res, response);
        return;
      }

      const userStatistic = await StatisticRepository.findByUserId(id);

      if(userStatistic.isFailure() || !userStatistic.value) {
        ok(res, response);
        return;
      }

      const isUserInTop10 = leaderboard.find((s) => s.userId === id);

      if(isUserInTop10) {
        ok(res, response);
        return;
      }

      const allStatisticsResult = await StatisticRepository.findAllScoresOrdered();
      
      if(allStatisticsResult.isSuccess()) {
        const userPosition = allStatisticsResult.value.findIndex((s) => s.userId === id) + 1;
        const userTotalGames = userStatistic.value.gamesPlayed || 0;
        const userWinRate = userTotalGames > 0 ? 
          ((userStatistic.value.gamesWon / userTotalGames) * 100).toFixed(2) : "0.00";

        const responseWithUser = {
          ...response,
          user: {
            avatar: user.value.avatar,
            username: user.value.username,
            score: userStatistic.value.score,
            position: userPosition || 'Unranked',
            winRate: parseFloat(userWinRate)
          }
        }

        ok(res, responseWithUser);
        return;
      }

      ok(res, response);

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
      
      const updateResult = await StatisticRepository.updateGameResult({
        userId: id,
        won: true,
        scoreIncrement: score
      });

      if(updateResult.isFailure()) {
        serverError(res, {
          message: Errors.UPDATE_SCORE_FAILED,
          code: ErrorCode.UPDATE_SCORE_FAILED
        });
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
