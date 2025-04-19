import mongoose from "mongoose";

export interface ModelWithTimestamp {
  _id: mongoose.Schema.Types.ObjectId
  createdAt: Date;
  updatedAt: Date;
}