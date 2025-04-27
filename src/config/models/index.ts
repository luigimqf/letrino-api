import mongoose from "mongoose";

export interface ModelWithTimestamp {
  _id: mongoose.Schema.Types.ObjectId
  createdAt: Date;
  updatedAt: Date;
}

export type OmitedModelFields<T extends ModelWithTimestamp> = Omit<T,"_id" | "createdAt" | "updatedAt"> 