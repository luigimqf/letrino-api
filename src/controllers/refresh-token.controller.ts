/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AuthenticateRequest } from '../types';
import { ErrorCode, Errors } from '../constants/error';
import { unauthorized, ok } from '../utils/http-status';
import { Jwt } from '../utils/jwt';
import { z } from 'zod';
import { Validate } from '../utils/validator';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

const refreshTokenSchema = z.object({
  refresh_token: z
    .string({
      message: Errors.REQUIRED_REFRESH_TOKEN,
    })
    .nonempty(Errors.REQUIRED_REFRESH_TOKEN),
});

class RefreshTokenController implements IController {
  @Validate({ body: refreshTokenSchema })
  async handle(req: AuthenticateRequest, res: Response) {
    const { refresh_token } = req.body;

    const jwtResult = Jwt.verify(refresh_token);

    if (jwtResult.isFailure()) {
      unauthorized(res, {
        message: Errors.INVALID_TOKEN,
        code: ErrorCode.INVALID_TOKEN,
      });
      return;
    }

    const id = jwtResult.value;
    const newToken = Jwt.sign({ id });
    const newRefreshToken = Jwt.sign({ id });

    ok(res, {
      success: true,
      token: newToken,
      refresh_token: newRefreshToken,
    });
    return;
  }
}

export const refreshTokenFactory = () => new RefreshTokenController();
