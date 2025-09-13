/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AuthenticateRequest } from '../types';
import { Errors } from '../constants/error';
import { unauthorized, ok, notFound } from '../utils/http-status';
import { IDeleteSkippedAttemptUseCase } from '../usecases/delete-skipped-attempt.usecase';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

export class DeleteSkippedAttemptController implements IController {
  constructor(
    private readonly deleteSkippedAttemptUsecase: IDeleteSkippedAttemptUseCase
  ) {}

  async handle(req: AuthenticateRequest, res: Response) {
    const id = req.userId;

    if (!id) {
      return unauthorized(res);
    }

    const result = await this.deleteSkippedAttemptUsecase.execute(id);

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
