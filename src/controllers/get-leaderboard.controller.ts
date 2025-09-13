/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Errors } from '../constants/error';
import { notFound, ok } from '../utils/http-status';
import { IGetLeaderboardUsecase } from '../usecases/get-leaderboard.usecase';
import { Jwt } from '../utils/jwt';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

export class GetLeaderboardController implements IController {
  constructor(private readonly getLeaderboardUseCase: IGetLeaderboardUsecase) {}

  async handle(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = Jwt.verify(token ?? '');

    const id = decoded.isSuccess() ? (decoded.value.id ?? '') : '';

    const result = await this.getLeaderboardUseCase.execute(id);

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
