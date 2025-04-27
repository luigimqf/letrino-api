import mongoose from "mongoose";
import { IWordRelatedDocument } from "../../models/word.model";

export const usedWordSchema = new mongoose.Schema<IWordRelatedDocument>({
  wordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Words",
    required: true,
  },
  deletedAt: Date
},{timestamps: true});

export const WordUsed = mongoose.model("used-word", usedWordSchema);