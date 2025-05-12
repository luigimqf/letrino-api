import { DeleteResult, FilterQuery } from "mongoose";
import { SkippedAttempt } from "../config/db/models/skipped_attempt";
import { Either, Failure, Success } from "../utils/either";
import { ISkippedWord } from "../config/models/word.model";
import { OmitedModelFields } from "../config/models";
import { Errors } from "../constants/error";

export class SkippedAttemptRepository {

  static async create(data: OmitedModelFields<ISkippedWord>) {
    try {
      const newDocResult = new SkippedAttempt(data)

      await newDocResult.save();

      return Success.create(newDocResult)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async find(conditions: FilterQuery<ISkippedWord>): Promise<Either<Errors, ISkippedWord[]>> {
    try {
      const skippedWords = await SkippedAttempt.find(conditions);

      return Success.create(skippedWords)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async findOne(conditions: FilterQuery<ISkippedWord>): Promise<Either<Errors, ISkippedWord | null>> {
    try {
      const skippedWord = await SkippedAttempt.findOne(conditions);

      return Success.create(skippedWord)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async delete(conditions: FilterQuery<ISkippedWord>): Promise<Either<Errors, ISkippedWord | null>> {
    try {
      const deletedDocument = await SkippedAttempt.findOneAndDelete(conditions)

      return Success.create(deletedDocument)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }
}