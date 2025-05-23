import { Response } from 'express'
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { Errors } from '../constants/error';
import { schemaValidator } from '../utils/validator';
import { badRequest, found, ok, serverError } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';
import { AuthenticateRequest } from '../types';

const createUserSchema = z.object({
  username: z
    .string()
    .min(5, {message: "Must have at least 5 characteres"})
    .regex(/^[a-zA-Z0-9]+$/, {
      message: 'Only alphanumeric characters without spaces are allowed',
    })
    .nonempty("Username is required"),
  email: z.string().email('Email is invalid'),
  password: z.string({
    message: 'Password must be a string'
  }).nonempty("password is required")
})

export async function createUser(req: AuthenticateRequest, res: Response) {
  try {
    const bodyResult = schemaValidator(createUserSchema, req.body);

    if(bodyResult.isFailure()) {
      badRequest(res, bodyResult.error);
      return;
    }

    const {email, password, username} = bodyResult.value;

    const usedEmailResult = await UserRepository.findOneBy({
      email
    });

    if(usedEmailResult.isSuccess() && usedEmailResult.value?._id) {
      found(res, Errors.FOUND_EMAIL);
      return;
    }
    const usernameResult = await UserRepository.findOneBy({
      username
    });

    if(usernameResult.isSuccess() && usernameResult.value?._id) {
      found(res, Errors.FOUND_USERNAME);
      return;
    }

    const hash = bcrypt.hashSync(password, 10);

    const newUserResult = await UserRepository.create({
      username,
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

