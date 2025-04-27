import { FilterQuery, UpdateQuery } from "mongoose";
import { WordUsed } from "../config/db/models/used_word";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";
import { ObjectID } from "../types";
import { IWordRelatedDocument } from "../config/models/word.model";

export class UsedWordRepository {

  static async find(conditions: FilterQuery<IWordRelatedDocument> = {}, distinct?: string): Promise<Either<Errors, unknown[] | null>> {
    try {
      const usedWords = distinct 
        ? await WordUsed.find(conditions).distinct(distinct) 
        : await WordUsed.find(conditions);
            
      return Success.create(usedWords)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

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

  static async findTodaysWord(): Promise<Either<Errors,IWordRelatedDocument | null>> {
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

  static async countDocuments(conditions?: FilterQuery<IWordRelatedDocument>): Promise<Either<Errors, number>> {
    try {
      const totalUsedWords = await WordUsed.countDocuments(conditions);

      return Success.create(totalUsedWords);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async updateMany(filter: FilterQuery<IWordRelatedDocument>, update: UpdateQuery<IWordRelatedDocument>): Promise<Either<Errors, boolean>> {
    try {
      await WordUsed.updateMany(filter,update)

      return Success.create(true)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }
}