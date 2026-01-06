/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { badRequest, ok } from '../utils/http-status';
import { ErrorCode, Errors } from '../constants/error';
import { ISocialSignInUseCase } from '../usecases/social-sign-in.usecase';
export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}
export class SocialSignInController implements IController {
  constructor(private readonly socialSignInUsecase: ISocialSignInUseCase) {}

  async handle(req: Request, res: Response) {
    const { code } = req.body;

    if (!code) {
      return badRequest(res, {
        code: ErrorCode.REQUIRED_AUTH_CODE,
        message: Errors.REQUIRED_AUTH_CODE,
      });
    }

    const result = await this.socialSignInUsecase.execute({
      code,
    });

    if (result.isFailure()) {
      return badRequest(res, {
        code: result.error,
        message: Errors[result.error],
      });
    }

    return ok(res, result.value);
  }
}
