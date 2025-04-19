import { Types } from "mongoose";
import { ModelWithTimestamp } from ".";

export interface IUser extends ModelWithTimestamp {
  _id: Types.ObjectId;
  name: string;
  email: string;
  score: number;
  password: string;
}