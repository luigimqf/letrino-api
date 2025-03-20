import {Request, Response} from 'express';
import {z} from 'zod';
import { User } from '../config/db/models/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HOUR_IN_SECONDS } from '../constants/time';
import { env } from '../config/enviroment';

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
        error: 'User not found'
      })
      return
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
      return
    }

    const token = jwt.sign({email: user.email, id: user._id}, env.JWT_SECRET, {expiresIn: HOUR_IN_SECONDS * 24});

    const refreshToken = jwt.sign({email: user.email, id: user._id}, env.JWT_SECRET, {expiresIn: HOUR_IN_SECONDS * 24 * 7});

    res.status(200).json({
      success: true,
      token,
      refreshToken
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    })
  }
}

export { login }