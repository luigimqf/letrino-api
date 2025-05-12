import mongoose from "mongoose";
import { ISkippedWord } from "../../models/word.model";

export const skippedAttemptSchema = new mongoose.Schema<ISkippedWord>({
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

export const SkippedAttempt = mongoose.model("skipped-attempt", skippedAttemptSchema);