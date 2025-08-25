import { Response } from 'express';
import { notFound, ok, serverError, unauthorized } from '../utils/http-status';
import { StatisticRepository } from '../repositories/statistic.repository';
import { ErrorCode, Errors } from '../constants/error';
import { AuthenticateRequest } from '../types';

class StatisticController {
  async getStatistics(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if (!id) {
        unauthorized(res);
        return;
      }

      const statisticResult = await StatisticRepository.findByUserId(id);

      if (statisticResult.isFailure() || !statisticResult.value) {
        notFound(res, {
          message: Errors.USER_NOT_FOUND,
          code: ErrorCode.USER_NOT_FOUND,
        });
        return;
      }

      const { gamesPlayed, gamesWon, winStreak, bestWinStreak, score } =
        statisticResult.value;

      const winPercentage =
        gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(2) : '0.00';

      ok(res, {
        gamesPlayed,
        gamesWon,
        winStreak,
        bestWinStreak,
        score,
        winPercentage: parseFloat(winPercentage),
      });
    } catch (error) {
      console.error('GetStatistics error:', error);
      serverError(res);
    }
  }
}

const statisticController = new StatisticController();

export const getStatistics =
  statisticController.getStatistics.bind(statisticController);
