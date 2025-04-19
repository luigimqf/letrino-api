import mongoose, { Document } from "mongoose";
import { WordUsed } from "../config/db/models/wordUsed";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";
import { Word } from "../config/db/models/word";
import { IUsedWord } from "../config/models/used_word";
import { ObjectID } from "../types";

export class UsedWordRepository {

  static async createUsedWord({wordId}: {wordId: ObjectID}): Promise<Either<Errors, null>> {
    try {
      const newUsedWord = new WordUsed({
        wordId,
      });

      await newUsedWord.save();

      return Success.create(null)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async findTodaysWord(): Promise<Either<Errors,IUsedWord | null>> {
    try {
      const todaysWord = await WordUsed.findOne({createdAt: {
        $gte: new Date().setHours(0,0,0,0),
        $lt: new Date().setHours(23,59,59,999),
      }});

      return Success.create(todaysWord);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async find(distinct?: string): Promise<Either<Errors, unknown[] | null>> {
    try {
      const usedWords = distinct 
        ? await WordUsed.find().distinct(distinct) 
        : await WordUsed.find();
            
      return Success.create(usedWords)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }


}