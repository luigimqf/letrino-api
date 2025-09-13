/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AuthenticateRequest } from '../types';
import { Errors } from '../constants/error';
import { unauthorized, ok, serverError } from '../utils/http-status';
import { IRegisterSkippedAttemptUseCase } from '../usecases/register-skipped-attempt.usecase';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

export class RegisterSkippedAttemptController implements IController {
  constructor(
    private readonly registerSkippedAttemptUsecase: IRegisterSkippedAttemptUseCase
  ) {}

  async handle(req: AuthenticateRequest, res: Response) {
    const id = req.userId;

    if (!id) {
      return unauthorized(res);
    }

    const result = await this.registerSkippedAttemptUsecase.execute(id);

    if (result.isFailure()) {
      serverError(res, {
        code: result.error,
        message: Errors[result.error],
      });
      return;
    }

    ok(res, result.value);
  }
}
