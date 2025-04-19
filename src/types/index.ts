import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

export interface JwtPayloadWithId extends JwtPayload {
  id: ObjectID;
}

export type ObjectID = mongoose.Schema.Types.ObjectId;


