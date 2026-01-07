/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { badRequest, ok } from '../utils/http-status';
import { ErrorCode, Errors } from '../constants/error';
import { ISocialSignUpUseCase } from '../usecases/social-sign-up.usecase';
export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}
export class SocialSignUpController implements IController {
  constructor(private readonly socialSignUpUsecase: ISocialSignUpUseCase) {}

  async handle(req: Request, res: Response) {
    const { code, username } = req.body;

    if (!code) {
      return badRequest(res, {
        code: ErrorCode.REQUIRED_AUTH_CODE,
        message: Errors.REQUIRED_AUTH_CODE,
      });
    }

    if (!username) {
      return badRequest(res, {
        code: ErrorCode.REQUIRED_USERNAME,
        message: Errors.REQUIRED_USERNAME,
      });
    }

    const result = await this.socialSignUpUsecase.execute({
      code,
      username,
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
