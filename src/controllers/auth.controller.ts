import {Request, Response} from 'express';
import {z} from 'zod';
import bcrypt from 'bcrypt';
import { Errors } from '../constants/error';
import { schemaValidator } from '../utils/validator';
import { badRequest, notFound, ok, serverError } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';
import { Jwt } from '../utils/jwt';
import { WEEK_IN_SECONDS } from '../constants/time';

const loginSchema = z.object({
  email: z.string({
    message: 'Email is required'
  }).email('Email is invalid'),
  password: z.string({
    message: 'Password is required'
  })
})

async function login(req: Request, res: Response) {
  try {
    const schemaResult = schemaValidator(loginSchema, req.body);

    if(schemaResult.isFailure()) {
      badRequest(res, schemaResult.error);
      return;
    }
    
    const { email, password } = schemaResult.value;
    const userResult = await UserRepository.findWhere('email', email);

    if(userResult.isFailure()) {
      notFound(res, Errors.USER_NOT_FOUND);
      return;
    }

    const isPasswordValid = bcrypt.compareSync(password, userResult.value?.password ?? '');

    if (!isPasswordValid) {
      badRequest(res, Errors.INVALID_PASSWORD);
      return;
    }

    const token = Jwt.sign({email: userResult.value?.email, id: userResult.value?._id});

    const refreshToken = Jwt.sign({email: userResult.value?.email, id: userResult.value?._id}, WEEK_IN_SECONDS);
  
    ok(res,{
      token,
      refresh_token: refreshToken
    })
  } catch (error) {
    serverError(res);
  }
}

const refreshTokenSchema = z.string({
  message: 'Refresh token is required'
});

async function refreshToken(req: Request, res: Response) {
  try {
    const schemaResult = schemaValidator(refreshTokenSchema, req.body.refresh_token);

    if (schemaResult.isFailure()) {
      badRequest(res, schemaResult.error);
      return;
    }

    const refreshToken = schemaResult.value;

    const jwtResult = Jwt.verify(refreshToken);

    if(jwtResult.isFailure()) {
      badRequest(res, jwtResult.error);
      //Add session delete with Id
      return;
    }

    const id = jwtResult.value;
    const newToken = Jwt.sign({id});
    const newRefreshToken = Jwt.sign({id}, WEEK_IN_SECONDS);

    ok(res, {
      success: true,
      token: newToken,
      refresh_token: newRefreshToken
    })
    return;
    
  } catch (error) {
    serverError(res);
  }
}

export { login,refreshToken }