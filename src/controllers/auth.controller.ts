import {Request, Response} from 'express';
import {z} from 'zod';
import { User } from '../config/db/models/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HOUR_IN_SECONDS } from '../constants/time';
import { env } from '../config/enviroment';
import { Errors } from '../constants/error';
import { JwtPayloadWithId } from '../types';
import { SessionRepository } from '../repositories/session.repository';

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
    const { success, data, error } = loginSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message
      })
      return
    }

    const { email, password } = data;

    const user = await User.findOne().where('email').equals(email);

    if (!user) {
      res.status(404).json({
        success: false,
        error: Errors.USER_NOT_FOUND
      })
      return
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        error: Errors.INVALID_CREDENTIALS
      })
      return
    }

    const token = jwt.sign({email: user.email, id: user._id}, env.JWT_SECRET, {expiresIn: HOUR_IN_SECONDS * 24});

    const refreshToken = jwt.sign({email: user.email, id: user._id}, env.JWT_SECRET, {expiresIn: HOUR_IN_SECONDS * 24 * 7});

    res.status(200).json({
      success: true,
      token,
      refresh_token: refreshToken
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: Errors.SERVER_ERROR
    })
  }
}

const refreshTokenSchema = z.string({
  message: 'Refresh token is required'
});

async function refreshToken(req: Request, res: Response) {
  try {
    const { success, data: refreshToken, error } = refreshTokenSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.issues[0].message
      })
      return;
    }

    let id;

    try {
      ({id} = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayloadWithId);
      const newToken = jwt.sign({id}, env.JWT_SECRET, {expiresIn: HOUR_IN_SECONDS * 24});
      const newRefreshToken = jwt.sign({id}, env.JWT_SECRET, {expiresIn: HOUR_IN_SECONDS * 24 * 7});

      res.status(200).json({
        success: true,
        token: newToken,
        refresh_token: newRefreshToken
      })
      return;
    } catch (error) {
      res.status(401).json({
        success: false,
        error: Errors.INVALID_TOKEN
      });
      if(id) {
        await SessionRepository.delete(id);
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: Errors.SERVER_ERROR
    })
  }
}

export { login,refreshToken }