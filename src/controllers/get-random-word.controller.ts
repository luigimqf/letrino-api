/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Errors } from '../constants/error';
import { notFound, ok } from '../utils/http-status';
import { IGetRandomWordUseCase } from '../usecases/get-random-word.usecase';
import { Jwt } from '../utils/jwt';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

export class GetRandomWordController implements IController {
  constructor(private readonly getRandomWordUsecase: IGetRandomWordUseCase) {}

  async handle(req: Request, res: Response) {
    const authorizationHeader = req.headers.authorization;

    console.log('Authorization Header:', authorizationHeader);
    const token =
      authorizationHeader && authorizationHeader.startsWith('Bearer ')
        ? authorizationHeader.split(' ')[1]
        : null;

    const jwtResult = Jwt.verify(token ?? '');

    const id =
      jwtResult.isSuccess() && jwtResult.value && 'id' in jwtResult.value
        ? jwtResult.value.id
        : null;

    const result = await this.getRandomWordUsecase.execute(id);

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
