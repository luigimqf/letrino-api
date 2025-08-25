import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ErrorCode, Errors } from '../constants/error';
import {
  badRequest,
  found,
  notFound,
  ok,
  serverError,
  unauthorized,
} from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';
import { StatisticRepository } from '../repositories/statistic.repository';
import { Jwt } from '../utils/jwt';
import { HOUR_IN_SECONDS, WEEK_IN_SECONDS } from '../constants/time';
import nodemailer from 'nodemailer';
import { env } from '../config/enviroment';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { AuthenticateRequest } from '../types';
import { Success } from '../constants/success';
import { Validate } from '../utils/validator';
import { getRandomAvatar } from '../constants/avatar';

const createUserSchema = z.object({
  username: z
    .string()
    .min(5, { message: 'Must have at least 5 characteres' })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: 'Only alphanumeric characters without spaces are allowed',
    })
    .nonempty('Username is required'),
  email: z.string().email('Email is invalid'),
  password: z
    .string({
      message: 'Password must be a string',
    })
    .nonempty('password is required'),
});

const loginSchema = z.object({
  email: z
    .string({
      message: Errors.REQUIRED_EMAIL,
    })
    .email(Errors.INVALID_EMAIL),
  password: z.string({
    message: Errors.REQUIRED_PASSWORD,
  }),
});

const refreshTokenSchema = z.object({
  refresh_token: z
    .string({
      message: Errors.REQUIRED_REFRESH_TOKEN,
    })
    .nonempty(Errors.REQUIRED_REFRESH_TOKEN),
});

const passwordResetSchema = z.object({
  token: z.string().nonempty('Token is required'),
  newPassword: z
    .string({
      message: Errors.REQUIRED_PASSWORD,
    })
    .nonempty(Errors.REQUIRED_PASSWORD),
});

const emailSchema = z.object({
  email: z
    .string({
      message: Errors.REQUIRED_EMAIL,
    })
    .email(Errors.INVALID_EMAIL)
    .nonempty(Errors.REQUIRED_EMAIL),
});

class AuthController {
  @Validate({ body: loginSchema })
  async signIn(req: AuthenticateRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const userResult = await UserRepository.findOneBy({
        where: { email },
        relations: ['statistic'],
        select: {
          statistic: {
            score: true,
          },
        },
      });

      if (userResult.isFailure() || !userResult.value) {
        notFound(res, {
          message: Errors.USER_NOT_FOUND,
          code: ErrorCode.USER_NOT_FOUND,
        });
        return;
      }

      const {
        id,
        passwordHash: userPassword,
        username,
        avatar,
        statistic,
      } = userResult.value;

      const isPasswordValid = bcrypt.compareSync(password, userPassword);

      if (!isPasswordValid) {
        badRequest(res, {
          message: Errors.INVALID_CREDENTIALS,
          code: ErrorCode.INVALID_CREDENTIALS,
        });
        return;
      }

      const token = Jwt.sign({ email, id }, HOUR_IN_SECONDS);
      const refreshToken = Jwt.sign({ email, id }, WEEK_IN_SECONDS);

      ok(res, {
        token,
        refresh_token: refreshToken,
        username,
      });
    } catch (error) {
      console.error('SignIn error:', error);
      serverError(res);
    }
  }

  @Validate({ body: createUserSchema })
  async signUp(req: AuthenticateRequest, res: Response) {
    try {
      const { email, password, username } = req.body;

      const usedEmailResult = await UserRepository.findOneBy({
        where: { email },
      });

      if (usedEmailResult.isSuccess() && usedEmailResult.value?.id) {
        found(res, {
          message: Errors.FOUND_EMAIL,
          code: ErrorCode.FOUND_EMAIL,
        });
        return;
      }

      const usernameResult = await UserRepository.findOneBy({
        where: { username },
      });

      if (usernameResult.isSuccess() && usernameResult.value?.id) {
        found(res, {
          message: Errors.FOUND_USERNAME,
          code: ErrorCode.FOUND_USERNAME,
        });
        return;
      }

      const hash = bcrypt.hashSync(password, 10);

      const newUserResult = await UserRepository.create({
        username,
        email,
        passwordHash: hash,
        avatar: getRandomAvatar(),
      });

      if (newUserResult.isFailure()) {
        serverError(res);
        return;
      }

      const newUser = newUserResult.value;
      await StatisticRepository.create(newUser.id);

      ok(res);
    } catch (error) {
      serverError(res);
    }
  }

  @Validate({ body: refreshTokenSchema })
  async refreshToken(req: AuthenticateRequest, res: Response) {
    try {
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
      const newRefreshToken = Jwt.sign({ id }, WEEK_IN_SECONDS);

      ok(res, {
        success: true,
        token: newToken,
        refresh_token: newRefreshToken,
      });
      return;
    } catch (error) {
      serverError(res);
    }
  }

  @Validate({ body: passwordResetSchema })
  async refreshPassword(req: AuthenticateRequest, res: Response) {
    try {
      const { token, newPassword } = req.body;

      const decodedResult = Jwt.verify(token);

      if (decodedResult.isFailure()) {
        unauthorized(res, {
          message: Errors.INVALID_TOKEN,
          code: ErrorCode.INVALID_TOKEN,
        });
        return;
      }

      const updateResult = await UserRepository.update(decodedResult.value.id, {
        passwordHash: bcrypt.hashSync(newPassword, 10),
      });

      if (updateResult.isFailure()) {
        notFound(res);
        return;
      }

      ok(res);
    } catch (error) {
      serverError(res);
    }
  }

  @Validate({ body: emailSchema })
  async forgotPassword(req: AuthenticateRequest, res: Response) {
    try {
      const { email } = req.body;

      const userResult = await UserRepository.findOneBy({
        where: { email },
      });

      if (userResult.isFailure() || !userResult.value?.id) {
        notFound(res);
        return;
      }

      const token = Jwt.sign({ id: userResult.value?.id }, HOUR_IN_SECONDS);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
      });

      const emailSource = fs.readFileSync(
        path.join(__dirname, '../views/forgot-password.hbs'),
        'utf8'
      );
      const template = Handlebars.compile(emailSource);
      const html = template({
        RESET_LINK: `${env.PASSWORD_RESET_URL}?token=${token}`,
      });

      await transporter.sendMail({
        to: userResult.value.email,
        subject: 'Password Reset',
        html,
      });

      ok(res);

      return;
    } catch (error) {
      serverError(res);
    }
  }
}

const authController = new AuthController();

export const signIn = authController.signIn.bind(authController);
export const signUp = authController.signUp.bind(authController);
export const refreshToken = authController.refreshToken.bind(authController);
export const refreshPassword =
  authController.refreshPassword.bind(authController);
export const forgotPassword =
  authController.forgotPassword.bind(authController);
