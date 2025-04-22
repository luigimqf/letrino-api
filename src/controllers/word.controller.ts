import z from "zod";
import { schemaValidator } from "../utils/validator";
import { Request, Response } from "express";
import { badRequest, notFound, ok, serverError } from "../utils/http-status";
import { StatisticRepository } from "../repositories/statistic.repository";
import { EStatistics } from "../constants/statistic";
import { WordUsed } from "../config/db/models/wordUsed";
import { WordRepository } from "../repositories/word.repository";
import { UsedWordRepository } from "../repositories/used_word.repository";
import { Errors } from "../constants/error";

const wordSchema = z.string({
  message: 'Attempt is required'
})

export async function getWord(_: Request, res: Response) {
  try {
    const todaysWord = await UsedWordRepository.findTodaysWord();

    if(todaysWord.isSuccess() && todaysWord.value?.wordId) {
      const wordDoc = await WordRepository.find(todaysWord.value.wordId);

      if(wordDoc.isSuccess()){
        const {word,isGolden} = wordDoc.value;
        ok(res, {
          word,
          isGolden
        });
        return;
      }
    }

    const usedWords = await UsedWordRepository.find();

    if(usedWords.isSuccess() && usedWords.value) {
      const randomWord = Math.random() < 0.01
        ? await WordRepository.findOneRandom({isGolden: true})
        :  await WordRepository.findUnexistedWordIn(usedWords.value, 1, {
          isGolden: true
        }) 

      if(randomWord.isSuccess()) {
        const {word,isGolden} = randomWord.value!;
        await UsedWordRepository.createUsedWord({
          wordId: randomWord.value!._id
        })
        ok(res, {
          word,
          isGolden
        })
        return;
      }

      ok(res);
      return 
    }

    ok(res);
    return; 
    
  } catch (error) {
    serverError(res);
  }
}

export async function wordSuccess(req: Request, res: Response) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED);
      return;
    }

    const todaysAttemptResult = await StatisticRepository.find({
      type: EStatistics.CORRECT,
      userId: id
    });

    if(todaysAttemptResult.isSuccess() && todaysAttemptResult.value?._id){
      badRequest(res, Errors.ALREADY_ATTEMPTED)
      return;
    }

    const attemptResult = schemaValidator(wordSchema, req.body.attempt);

    if (attemptResult.isFailure()) {
      badRequest(res, attemptResult.error);
      return;
    }

    const wordIdResult = await UsedWordRepository.findTodaysWord();

    if(wordIdResult.isFailure()) {
      notFound(res, Errors.NOT_FOUND);
      return;
    }

    const todaysWord = await WordRepository.find(wordIdResult.value?.wordId!)

    if(todaysWord.isSuccess() && todaysWord.value?.word === attemptResult.value) {
      await StatisticRepository.create({
        word: todaysWord.value._id,
        attempt: attemptResult.value,
        userId: id,
        type: EStatistics.CORRECT
      });
  
      ok(res)
      return;
    }

    badRequest(res, Errors.INCORRECT_ATTEMPT)
    
  } catch (error) {
    serverError(res);
  }
}

export async function wordFail(req: Request, res: Response) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED);
      return;
    }

    const todaysAttemptResult = await StatisticRepository.find({
      type: EStatistics.CORRECT,
      userId: id
    });

    if(todaysAttemptResult.isSuccess() && todaysAttemptResult.value?._id){
      badRequest(res, Errors.ALREADY_ATTEMPTED)
      return;
    }

    const attemptResult = schemaValidator(wordSchema, req.body.attempt);

    if (attemptResult.isFailure()) {
      badRequest(res, attemptResult.error);
      return;
    }

    const todaysWordId = await UsedWordRepository.findTodaysWord();

    if(todaysWordId.isFailure()) {
      notFound(res)
      return;
    }

    const wordResult = await WordRepository.find(todaysWordId.value?.wordId!);

    if(wordResult.isSuccess() && wordResult.value.word !== attemptResult.value) {
      await StatisticRepository.create({
        attempt: attemptResult.value,
        word: wordResult.value._id,
        type: EStatistics.INCORRECT,
        userId: id,
      });
  
      ok(res, "created")
      return;
    }

    badRequest(res, Errors.CORRECT_ATTEMPT)
    
  } catch (error) {
    serverError(res);
  }
}

// export async function wordSkipped(req: Request, res: Response) {
//   try {
//     const id = req.userId;

//     if(!id) {
//       badRequest(res, Errors.UNAUTHORIZED)
//       return;
//     }

//     const attemptResult = schemaValidator(wordSchema, req.body.attempt);

//     if (attemptResult.isFailure()) {
//       badRequest(res, attemptResult.error);
//       return;
//     }

//     const createStatisticResult = await StatisticRepository.create(wordResult.value,id, EStatistics.INCORRECT);

//     if (createStatisticResult.isFailure()) {
//       badRequest(res, createStatisticResult.error);
//       return;
//     }

//     ok(res);
    
//   } catch (error) {
//     serverError(res);
//   }
// }