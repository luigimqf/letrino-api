import mongoose from "mongoose";
import { IUsedWord } from "../../models/used_word";

export const wordUsedSchema = new mongoose.Schema<IUsedWord>({
  wordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Words",
    required: true,
  },
  deletedAt: Date
},{timestamps: true});

export const WordUsed = mongoose.model("used-word", wordUsedSchema);