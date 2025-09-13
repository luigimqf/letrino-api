/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AuthenticateRequest } from '../types';
import { Errors } from '../constants/error';
import { notFound, unauthorized, ok } from '../utils/http-status';
import { IGetUserAttemptsUseCase } from '../usecases/get-user-attempts.usecase';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

export class GetUserAttemptController implements IController {
  constructor(
    private readonly getUserAttemptsUsecase: IGetUserAttemptsUseCase
  ) {}

  async handle(req: AuthenticateRequest, res: Response) {
    const id = req.userId;

    if (!id) {
      return unauthorized(res);
    }

    const result = await this.getUserAttemptsUsecase.execute(id);

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
