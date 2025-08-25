import { Response } from 'express';
import { ErrorCode, Errors } from '../constants/error';
import { AuthenticateRequest } from '../types';
import { notFound, ok, serverError, unauthorized } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';
import { StatisticRepository } from '../repositories/statistic.repository';

class UserController {
  async getUserData(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if (!id) {
        unauthorized(res);
        return;
      }

      const userResult = await UserRepository.findById(id);

      if (userResult.isFailure() || !userResult.value.id) {
        notFound(res, {
          message: Errors.USER_NOT_FOUND,
          code: ErrorCode.USER_NOT_FOUND,
        });
        return;
      }

      const { username, avatar } = userResult.value;

      let score = 0;
      const statisticResult = await StatisticRepository.findByUserId(id);

      if (statisticResult.isSuccess() && statisticResult.value) {
        score = statisticResult.value.score;
      }

      ok(res, {
        avatar,
        username,
        score,
      });
    } catch (error) {
      serverError(res);
    }
  }
}

const userController = new UserController();

export const getUserData = userController.getUserData.bind(userController);
