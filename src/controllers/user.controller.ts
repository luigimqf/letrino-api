import { Request, Response } from 'express'
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { Errors } from '../constants/error';
import { schemaValidator } from '../utils/validator';
import { badRequest, ok, serverError } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';

const createUserSchema = z.object({
  name: z
    .string({
      message: 'Name must be a string'
    })
    .regex(/^[a-zA-Z\s]*$/, {
      message: 'Name must only contain letters'
    })
    .nonempty("Name is required"),
  email: z.string().email('Email is invalid'),
  password: z.string({
    message: 'Password must be a string'
  }).nonempty("password is required")
})

export async function createUser(req: Request, res: Response) {
  try {
    const bodyResult = schemaValidator(createUserSchema, req.body);

    if(bodyResult.isFailure()) {
      badRequest(res, bodyResult.error);
      return;
    }

    const {email, password, name} = bodyResult.value;

    const hash = bcrypt.hashSync(password, 10);

    const newUserResult = await UserRepository.create({
      name,
      email,
      password: hash,
    });

    if(newUserResult.isFailure()) {
      serverError(res, newUserResult.error);
      return;
    }

    ok(res);

  } catch (error) {
    serverError(res, Errors.SERVER_ERROR);
  }
};

