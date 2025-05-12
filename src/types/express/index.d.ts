import 'express';
import { ObjectID } from '.';

declare global {
  namespace Express {
    export interface User {
      userId?: ObjectID;
    }
    export interface Request {
      userId?: ObjectID;
    }
  }
}