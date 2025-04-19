import 'express';
import { ObjectID } from '.';

declare global {
  namespace Express {
    interface User {
      userId?: ObjectID;
    }
    interface Request {
      userId?: ObjectID;
    }
  }
}