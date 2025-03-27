import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  score: number;
  password: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}