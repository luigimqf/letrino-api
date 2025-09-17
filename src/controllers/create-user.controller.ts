/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { ICreateUserUseCase } from '../usecases/create-user.usecase';
import { badRequest } from '../utils/http-status';
import { Errors } from '../constants/error';

export interface IController {
  handle(req: Request, res: Response): Promise<any>;
}

export class CreateUserController implements IController {
  constructor(private readonly createUserUsecase: ICreateUserUseCase) {}

  async handle(req: Request, res: Response) {
    const userData = req.body;

    const result = await this.createUserUsecase.execute(userData);

    if (result.isFailure()) {
      badRequest(res, {
        code: result.error,
        message: Errors[result.error],
      });
      return;
    }

    return res.status(201).json(result.value);
  }
}
