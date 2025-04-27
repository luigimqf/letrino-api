import { FilterQuery } from "mongoose";
import { WordSkipped } from "../config/db/models/skipped_word";
import { Either, Failure, Success } from "../utils/either";
import { Errors } from "../constants/error";
import { ISkippedWord, IWordRelatedDocument } from "../config/models/word.model";
import { OmitedModelFields } from "../config/models";

export class SkippedWordRepository {

  static async create(data: OmitedModelFields<ISkippedWord>) {
    try {
      const newDocResult = new WordSkipped(data)

      await newDocResult.save();

      return Success.create(newDocResult)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }
  static async find(conditions: FilterQuery<IWordRelatedDocument>): Promise<Either<Errors, IWordRelatedDocument[]>> {
    try {
      const skippedWords = await WordSkipped.find(conditions);

      return Success.create(skippedWords)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async findOne(conditions: FilterQuery<ISkippedWord>): Promise<Either<Errors, ISkippedWord | null>> {
    try {
      const skippedWord = await WordSkipped.findOne(conditions);

      return Success.create(skippedWord)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }
}