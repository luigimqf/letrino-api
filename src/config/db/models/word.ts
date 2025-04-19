import mongoose from "mongoose";
import { IWord } from "../../models/word.model";

const wordSchema = new mongoose.Schema<IWord>({
  word: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export const Word = mongoose.model("Words", wordSchema);