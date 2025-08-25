import { Response } from 'express';
import { ErrorCode, Errors } from '../constants/error';
import { AttemptRepository } from '../repositories/attempt.repository';
import { AuthenticateRequest } from '../types';
import { notFound, ok, serverError, unauthorized } from '../utils/http-status';

class AttemptController {
  async getAttemptsByUserId(req: AuthenticateRequest, res: Response) {
    try {
      const id = req.userId;

      if (!id) {
        unauthorized(res);
        return;
      }

      const attemptsResult = await AttemptRepository.findTodaysAttempts(id);

      if (attemptsResult.isFailure() || !attemptsResult.value) {
        notFound(res, {
          message: Errors.USER_NOT_FOUND,
          code: ErrorCode.USER_NOT_FOUND,
        });
        return;
      }

      ok(res, { attempts: attemptsResult.value });
    } catch (error) {
      console.error('GetUserAttempts error:', error);
      serverError(res);
    }
  }
}

const userController = new AttemptController();

export const getUserAttempts =
  userController.getAttemptsByUserId.bind(userController);
