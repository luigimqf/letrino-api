import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import {type Request} from 'express'

export interface AuthenticateRequest extends Request {
  userId?: ObjectID;
}
export interface JwtPayloadWithId extends JwtPayload {
  id: ObjectID;
}

export type ObjectID = mongoose.Schema.Types.ObjectId;


