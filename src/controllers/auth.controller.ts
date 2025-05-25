import {Response} from 'express';
import {z} from 'zod';
import bcrypt from 'bcrypt';
import { Errors } from '../constants/error';
import { schemaValidator } from '../utils/validator';
import { badRequest, found, notFound, ok, serverError } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';
import { Jwt } from '../utils/jwt';
import { HOUR_IN_SECONDS, WEEK_IN_SECONDS } from '../constants/time';
import nodemailer from 'nodemailer'
import { env } from '../config/enviroment';
import Handlebars from 'handlebars';
import fs from "fs"
import path from 'path';
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

const loginSchema = z.object({
  email: z.string({
    message: Errors.REQUIRED_EMAIL
  }).email(Errors.INVALID_EMAIL),
  password: z.string({
    message: Errors.REQUIRED_PASSWORD
  })
})

const refreshTokenSchema = z.string({
  message: Errors.REQUIRED_REFRESH_TOKEN
}).nonempty(Errors.REQUIRED_REFRESH_TOKEN);

const passwordSchema = z.string({
  message: Errors.REQUIRED_PASSWORD
}).nonempty(Errors.REQUIRED_PASSWORD)

const emailSchema = z.string({message: Errors.REQUIRED_EMAIL}).email(Errors.INVALID_EMAIL).nonempty(Errors.REQUIRED_EMAIL);

export async function signIn(req: AuthenticateRequest, res: Response) {
  try {
    const schemaResult = schemaValidator(loginSchema, req.body);

    if(schemaResult.isFailure()) {
      badRequest(res, schemaResult.error);
      return;
    }
    
    const { email, password } = schemaResult.value;
    const userResult = await UserRepository.findOneBy({
      email
    });

    if(userResult.isFailure() || !userResult.value) {
      notFound(res, Errors.NOT_FOUND_USER);
      return;
    }

    const {username, password: userPassword,score} = userResult.value

    const isPasswordValid = bcrypt.compareSync(password, userPassword);

    if (!isPasswordValid) {
      badRequest(res, Errors.INVALID_CREDENTIALS);
      return;
    }

    const token = Jwt.sign({email: userResult.value?.email, id: userResult.value?._id});

    const refreshToken = Jwt.sign({email: userResult.value?.email, id: userResult.value?._id}, WEEK_IN_SECONDS);
  
    ok(res,{
      token,
      refresh_token: refreshToken,
      user: {
        username,
        score
      }
    })
  } catch (error) {
    serverError(res);
  }
}

export async function signUp(req: AuthenticateRequest, res: Response) {
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

export async function getUserData(req: AuthenticateRequest, res: Response) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED);
      return;
    }

    const userResult = await UserRepository.findById(id);

    if(userResult.isFailure() || !userResult.value._id) {
      notFound(res, Errors.NOT_FOUND_USER);
      return 
    }

    const {username,score} = userResult.value;

    ok(res, {
      username,
      score
    })
  } catch (error) {
    serverError(res)
  }
}

export async function refreshToken(req: AuthenticateRequest, res: Response) {
  try {
    const schemaResult = schemaValidator(refreshTokenSchema, req.body.refresh_token);

    if (schemaResult.isFailure()) {
      badRequest(res, schemaResult.error);
      return;
    }

    const refreshToken = schemaResult.value;

    const jwtResult = Jwt.verify(refreshToken);

    if(jwtResult.isFailure()) {
      badRequest(res, Errors.INVALID_TOKEN);
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

export async function refreshPassword(req: AuthenticateRequest, res: Response) {
  try {
    const { token, newPassword } = req.body;

    const passwordResult = schemaValidator(passwordSchema, newPassword);

    if(passwordResult.isFailure()) {
      badRequest(res, passwordResult.error)
      return;
    }

    const decodedResult = Jwt.verify(token)

    if(decodedResult.isFailure()) {
      badRequest(res, Errors.INVALID_TOKEN)
      return;
    }

    const updateResult = await UserRepository.update(decodedResult.value.id, {
      password: bcrypt.hashSync(newPassword, 10)
    });

    if(updateResult.isFailure()) {
      notFound(res, Errors.NOT_FOUND)
      return;
    }

    ok(res)
  } catch (error) {
    serverError(res, Errors.SERVER_ERROR)
  }
}

export async function forgotPassword(req: AuthenticateRequest, res: Response) {
  try {
    const emailResult = schemaValidator(emailSchema, req.body.email);

    if(emailResult.isFailure()){
      badRequest(res, emailResult.error);
      return;
    }

    const userResult = await UserRepository.findOneBy({
      email: emailResult.value
    })

    if(userResult.isFailure() || !userResult.value?._id) {
      notFound(res, Errors.NOT_FOUND)
      return;
    }

    const token = Jwt.sign({id: userResult.value?._id}, HOUR_IN_SECONDS);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD
      },
    })

    const emailSource = fs.readFileSync(path.join(__dirname, "../views/forgot-password.hbs"), "utf8")
    const template = Handlebars.compile(emailSource);
    const html = template({RESET_LINK: `${env.PASSWORD_RESET_URL}?token=${token}`})

    await transporter.sendMail({
      to: userResult.value.email,
      subject: "Password Reset",
      html
    })

    ok(res)

    return;
  } catch (error) {
    serverError(res)
  }
}