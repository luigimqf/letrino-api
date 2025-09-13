/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { IGetUserDataUsecase } from '../usecases/get-user-data.usecase';
import { AuthenticateRequest } from '../types';
import { Errors } from '../constants/error';
import { notFound, unauthorized, ok } from '../utils/http-status';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

export class GetUserDataController implements IController {
  constructor(private readonly getUserDataUsecase: IGetUserDataUsecase) {}

  async handle(req: AuthenticateRequest, res: Response) {
    const id = req.userId;

    if (!id) {
      return unauthorized(res);
    }

    const result = await this.getUserDataUsecase.execute(id);

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
