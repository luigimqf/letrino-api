import {Response, NextFunction} from 'express';
import { StatisticRepository } from '../repositories/statistic.repository';
import { badRequest } from '../utils/http-status';
import { Errors } from '../constants/error';
import { EStatistics } from '../constants/statistic';
import { AuthenticateRequest } from '../types';

export async function checkAttempts(req: AuthenticateRequest,res:Response,next: NextFunction) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED)
      return;
    }

    const correctAttempsResult = await StatisticRepository.countDocuments({
      userId: id,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
      type: EStatistics.CORRECT,
    });

    if(correctAttempsResult.isSuccess() && correctAttempsResult.value > 0){
      badRequest(res, Errors.ALREADY_GOT_RIGHT)
      return;
    }

    const failedAttemptsResult = await StatisticRepository.countDocuments({
      userId: id,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
      type: EStatistics.INCORRECT,
    })

    if(failedAttemptsResult.isSuccess() && failedAttemptsResult.value >= 5) {
      badRequest(res, Errors.ALREADY_FAILED)
      return;
    }

    next()
  } catch (error) {
    badRequest(res,Errors.SERVER_ERROR)
    return;
  }
}