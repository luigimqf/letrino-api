import { env } from '../config/enviroment';
import { JwtPayloadWithId } from '../types';
import jwt from 'jsonwebtoken';
import { ErrorCode, Errors } from '../constants/error';
import { Either, Failure, Success } from './either';
import { DAY_IN_SECONDS } from '../constants/time';

export class Jwt {
  static sign(
    payload: string | Buffer | object,
    expiresIn: number = DAY_IN_SECONDS,
    args?: jwt.SignOptions
  ): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn,
      ...args,
    });
  }

  static verify(token: string): Either<string, JwtPayloadWithId> {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayloadWithId;

      return Success.create<JwtPayloadWithId>(payload);
    } catch (error) {
      return Failure.create(ErrorCode.INVALID_TOKEN);
    }
  }
}
