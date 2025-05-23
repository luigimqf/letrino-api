import {Response} from 'express';
import {z} from 'zod';
import bcrypt from 'bcrypt';
import { Errors } from '../constants/error';
import { schemaValidator } from '../utils/validator';
import { badRequest, notFound, ok, serverError } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';
import { Jwt } from '../utils/jwt';
import { HOUR_IN_SECONDS, WEEK_IN_SECONDS } from '../constants/time';
import nodemailer from 'nodemailer'
import { env } from '../config/enviroment';
import Handlebars from 'handlebars';
import fs from "fs"
import path from 'path';
import { AuthenticateRequest } from '../types';

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

export async function login(req: AuthenticateRequest, res: Response) {
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

    const {username, password: userPassword} = userResult.value

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
        username
      }
    })
  } catch (error) {
    serverError(res);
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