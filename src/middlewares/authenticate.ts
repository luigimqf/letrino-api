import {Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/enviroment';
import { Errors } from '../constants/error';
import { AuthenticateRequest, JwtPayloadWithId } from '../types';


export async function authenticate(req: AuthenticateRequest,res:Response,next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({message: Errors.NO_TOKEN});
      return; 
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayloadWithId;

      req.userId = decoded.id;
      
      next();
    } catch (error) {
      res.status(401).json({
        message: Errors.TOKEN_EXPIRED
      });
    }
  } catch (error) {
    res.status(500).json({message: Errors.SERVER_ERROR});
  }
}

