/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AuthenticateRequest } from '../types';
import { Errors } from '../constants/error';
import { notFound, unauthorized, ok } from '../utils/http-status';
import { IGetUserStatisticUseCase } from '../usecases/get-user-statistic.usecase';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

export class GetUserStatisticController implements IController {
  constructor(
    private readonly getUserStatisticUsecase: IGetUserStatisticUseCase
  ) {}

  async handle(req: AuthenticateRequest, res: Response) {
    const id = req.userId;

    if (!id) {
      return unauthorized(res);
    }

    const result = await this.getUserStatisticUsecase.execute(id);

    if (result.isFailure()) {
      notFound(res, {
        code: result.error,
        message: Errors[result.error],
      });
      return;
    }

    ok(res, result.value);
  }
}
