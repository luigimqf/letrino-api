/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { ISignInUseCase } from '../usecases/sign-in.usecase';
import { badRequest, ok } from '../utils/http-status';
import { Errors } from '../constants/error';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

export class SignInController implements IController {
  constructor(private readonly signInUsecase: ISignInUseCase) {}

  async handle(req: Request, res: Response) {
    const { email, password } = req.body;

    const result = await this.signInUsecase.execute({ email, password });

    if (result.isFailure()) {
      return badRequest(res, {
        code: result.error,
        message: Errors[result.error],
      });
    }

    return ok(res, result.value);
  }
}
