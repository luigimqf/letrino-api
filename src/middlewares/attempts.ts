import {Response, NextFunction} from 'express';
import { AttemptRepository } from '../repositories/attempt.repository';
import { badRequest, serverError, unauthorized } from '../utils/http-status';
import { ErrorCode, Errors } from '../constants/error';
import { EStatistics } from '../constants/statistic';
import { AuthenticateRequest } from '../types';

export async function checkAttempts(req: AuthenticateRequest,res:Response,next: NextFunction) {
  try {
    const id = req.userId;

    if(!id) {
      unauthorized(res)
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const correctAttempsResult = await AttemptRepository.countDocuments({
      userId: id,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      result: EStatistics.CORRECT,
    });

    if(correctAttempsResult.isSuccess() && correctAttempsResult.value > 0){
      badRequest(res, {
        message: Errors.ALREADY_GOT_RIGHT,
        code: ErrorCode.ALREADY_GOT_RIGHT
      })
      return;
    }

    const failedAttemptsResult = await AttemptRepository.countDocuments({
      userId: id,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      result: EStatistics.INCORRECT,
    })

    if(failedAttemptsResult.isSuccess() && failedAttemptsResult.value >= 6) {
      badRequest(res, {
        message: Errors.ALREADY_FAILED,
        code: ErrorCode.ALREADY_FAILED
      })
      return;
    }

    next()
  } catch (error) {
    serverError(res)
    return;
  }
}