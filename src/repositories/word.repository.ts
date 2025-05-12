import { FilterQuery } from "mongoose";
import { Word } from "../config/db/models/word";
import { WordUsed } from "../config/db/models/used_word";
import { IWord } from "../config/models/word.model";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";
import { ObjectID } from "../types";

export class WordRepository {

  static async find(id:ObjectID): Promise<Either<Errors, IWord>> {
    try {
      const word = await Word.findById(id);

      if(!word) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(word);

    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findOneRandom(conditions: FilterQuery<IWord>): Promise<Either<Errors, IWord | null>> {
    try {
      const word = await Word.aggregate([
        {$match: conditions},
        {$sample: {size: 1}}
      ]);

      if(!word) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(word[0]);
    } catch (_) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async findUnexistedWordIn(words: unknown[], size: number = 1, filter?: FilterQuery<IWord>): Promise<Either<Errors, IWord | null>> {
    try {
      const word = await Word.aggregate([
        {$match: {word: {$nin: words}, ...(filter ?? {})}},
        {$sample: {size}}
      ])

      return Success.create(word[0])
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async findRandom(): Promise<Either<Errors, IWord | null>> {
    try {
      const todaysWord = await WordUsed.findOne({ createdAt: {
        $gte: new Date(new Date().setHours(0,0,0,0)).toISOString(),
        $lt: new Date(new Date().setHours(23,59,59,999)).toISOString()
      }});

      if(todaysWord) {
        const word = await Word.findById(todaysWord.wordId);

        if(word) {
          return Success.create(word);
        }
      }

      const usedWords = await WordUsed.find().distinct("word")

      const randomWord = await Word.aggregate([
        {$match: {word: {$nin: usedWords} } },
        {$sample: {size: 1}}
      ]);

      if(!randomWord) {
        return Failure.create(Errors.NOT_FOUND);
      }

      const newUsedWord = new WordUsed({
        wordId: randomWord[0]._id,
        word: randomWord[0].word,
      });

      await newUsedWord.save();

      return Success.create(randomWord[0]);
    } catch (error) {
      console.error(error);
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async countDocuments(conditions?: FilterQuery<IWord>): Promise<Either<Errors, number>> {
    try {
      const totalWords = await Word.countDocuments();

      return Success.create(totalWords);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }
}