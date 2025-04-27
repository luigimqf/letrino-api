import mongoose from "mongoose";
import { ISkippedWord } from "../../models/word.model";

export const skippedWordSchema = new mongoose.Schema<ISkippedWord>({
  wordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Words",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  deletedAt: Date
},{timestamps: true});

export const WordSkipped = mongoose.model("skipped-word", skippedWordSchema);