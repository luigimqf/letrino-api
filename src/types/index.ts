import { JwtPayload } from "jsonwebtoken";
import {type Request} from 'express'

export interface ModelWithTimestamp {
  id: string
  createdAt: Date;
  updatedAt: Date;
}

export type OmitedModelFields<T extends ModelWithTimestamp> = Omit<T,"id" | "createdAt" | "updatedAt">

export interface AuthenticateRequest extends Request {
  userId?: string;
}
export interface JwtPayloadWithId extends JwtPayload {
  id: string;
}



