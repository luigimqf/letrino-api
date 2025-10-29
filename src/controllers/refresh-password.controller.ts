/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AuthenticateRequest } from '../types';
import { ErrorCode, Errors } from '../constants/error';
import { ok, serverError } from '../utils/http-status';
import { z } from 'zod';
import { Validate } from '../utils/validator';
import { IRefreshPasswordUsecase } from '../usecases/refresh-password.usecase';
import { Jwt } from '../utils/jwt';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

const passwordResetSchema = z.object({
  token: z.string().nonempty('Token is required'),
  newPassword: z
    .string({
      message: Errors.REQUIRED_PASSWORD,
    })
    .nonempty(Errors.REQUIRED_PASSWORD),
});

export class RefreshPasswordController implements IController {
  constructor(private refreshPasswordUsecase: IRefreshPasswordUsecase) {}
  @Validate({ body: passwordResetSchema })
  async handle(req: AuthenticateRequest, res: Response) {
    const { token, newPassword } = req.body;

    const decodedResult = Jwt.verify(token);

    if (decodedResult.isFailure()) {
      serverError(res, {
        message:
          Errors[decodedResult.error as keyof typeof Errors] ||
          Errors.SERVER_ERROR,
        code: decodedResult.error,
      });
      return;
    }

    const updateResult = await this.refreshPasswordUsecase.execute(
      decodedResult.value.id,
      newPassword,
      token
    );

    if (updateResult.isFailure()) {
      serverError(res, {
        message: Errors.REFRESH_PASSWORD_FAILED,
        code: ErrorCode.REFRESH_PASSWORD_FAILED,
      });
      return;
    }

    ok(res);
    return;
  }
}
