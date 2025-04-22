import mongoose from "mongoose";
import { Word } from "../config/db/models/word";
import { words } from "../constants/words";
import 'dotenv/config'

async function createWords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI ?? "");
    await Word.insertMany(words);
    console.log(`Successfully filled`)

  } catch (error) {
    console.log(error)
  } finally {
    await mongoose.disconnect()
  }
}

createWords();