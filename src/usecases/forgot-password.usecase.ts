import path from 'path';
import { env } from '../config/enviroment';
import { ErrorCode } from '../constants/error';
import Handlebars from 'handlebars';
import { HOUR_IN_SECONDS } from '../constants/time';
import { IUserRepository } from '../repositories/user.repository';
import { Either, Failure, Success } from '../utils/either';
import { Jwt } from '../utils/jwt';
import nodemailer from 'nodemailer';
import fs from 'fs';
import { ITokenRepository } from '../repositories/token.repository';

export interface IForgotPasswordUsecase {
  execute(email: string): Promise<Either<ErrorCode, null>>;
}

export class ForgotPasswordUseCase implements IForgotPasswordUsecase {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: ITokenRepository
  ) {}

  async execute(email: string): Promise<Either<ErrorCode, null>> {
    const userResult = await this.userRepository.findOneBy({ email });

    if (userResult.isFailure() || !userResult.value) {
      return Failure.create(ErrorCode.USER_NOT_FOUND);
    }

    const token = Jwt.sign({ id: userResult.value?.id }, HOUR_IN_SECONDS);

    const tokenResult = await this.tokenRepository.create(token);

    if (tokenResult.isFailure()) {
      return Failure.create(ErrorCode.TOKEN_CREATION_FAILED);
    }

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
      to: userResult.value?.email,
      subject: 'Password Reset',
      html,
    });

    return Success.create(null);
  }
}
