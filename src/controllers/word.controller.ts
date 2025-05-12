/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import z from "zod";
import { schemaValidator } from "../utils/validator";
import { Request, Response } from "express";
import { badRequest, notFound, ok, serverError } from "../utils/http-status";
import { StatisticRepository } from "../repositories/statistic.repository";
import { ATTEMPT_PENALTY, BASE_SCORE, EStatistics } from "../constants/statistic";
import { WordRepository } from "../repositories/word.repository";
import { UsedWordRepository } from "../repositories/used_word.repository";
import { Errors } from "../constants/error";
import { UserRepository } from "../repositories/user.repository";
import { SkippedAttemptRepository } from "../repositories/skipped_attempt.repository";

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
      const randomWord = await WordRepository.findUnexistedWordIn(usedWords.value, 1, {
          isGolden: Math.random() < 0.01 ? true : false
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

export async function attemptSuccess(req: Request, res: Response) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED);
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
        wordId: todaysWord.value._id,
        attempt: attemptResult.value,
        userId: id,
        type: EStatistics.CORRECT
      });
  
      const incorrectAttemptsResult = await StatisticRepository.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        },
        type: EStatistics.INCORRECT
      })
  
      if(incorrectAttemptsResult.isFailure()) {
        badRequest(res, "Error calculating new score")
        return;
      }

      const score = BASE_SCORE - (ATTEMPT_PENALTY * incorrectAttemptsResult.value)

      const updateUserResult = await UserRepository.update(id, {
        $inc: {score}
      })

      if(updateUserResult.isFailure()) {
        badRequest(res, "Error updating score")
        return;
      }

      ok(res)
      return;
    }

    badRequest(res, Errors.INCORRECT_ATTEMPT)
    
  } catch (error) {
    serverError(res);
  }
}

export async function attemptFail(req: Request, res: Response) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED);
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
        wordId: wordResult.value._id,
        type: EStatistics.INCORRECT,
        userId: id,
      });
  
      ok(res)
      return;
    }

    badRequest(res, Errors.CORRECT_ATTEMPT)
    
  } catch (error) {
    serverError(res);
  }
}

export async function registerSkippedAttemp(req: Request, res: Response) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED)
      return;
    }

    const todaySkippedResult = await SkippedAttemptRepository.findOne({
      userId: id,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
    })

    if(todaySkippedResult.isSuccess() && todaySkippedResult.value?._id) {
      badRequest(res,"Skipped Document found")
      return;
    }

    const todaysWordResult = await UsedWordRepository.findTodaysWord();

    if(todaysWordResult.isFailure() || !todaysWordResult.value?._id) {
      notFound(res, Errors.WORD_NOT_FOUND)
      return;
    }

    await SkippedAttemptRepository.create({
      userId: id,
      wordId: todaysWordResult.value?._id
    })

    ok(res);
    
  } catch (error) {
    serverError(res);
  }
}

export async function deleteSkippedAttempDocument(req: Request, res: Response) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED)
      return;
    }

    const deleteDocResult = await SkippedAttemptRepository.delete(id)

    if(deleteDocResult.isSuccess() && !deleteDocResult.value?._id) {
      notFound(res)
      return;
    }

    if(deleteDocResult.isSuccess() && deleteDocResult.value?._id) {
      ok(res)
      return;
    }

    badRequest(res)
  } catch (error) {
    serverError(res)
  }
}