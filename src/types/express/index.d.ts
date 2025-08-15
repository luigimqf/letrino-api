import 'express';
declare global {
  namespace Express {
    export interface User {
      userId?: string;
    }
    export interface Request {
      userId?: string;
    }
  }
}