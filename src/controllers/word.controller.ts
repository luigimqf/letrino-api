/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import z from "zod";
import { schemaValidator } from "../utils/validator";
import { Response } from "express";
import { badRequest, notFound, ok, serverError } from "../utils/http-status";
import { StatisticRepository } from "../repositories/statistic.repository";
import { ATTEMPT_PENALTY, BASE_SCORE, EStatistics } from "../constants/statistic";
import { WordRepository } from "../repositories/word.repository";
import { UsedWordRepository } from "../repositories/used_word.repository";
import { Errors } from "../constants/error";
import { UserRepository } from "../repositories/user.repository";
import { SkippedAttemptRepository } from "../repositories/skipped_attempt.repository";
import { AuthenticateRequest } from "../types";

const wordSchema = z.string({
  message: 'Attempt must be a string'
}).nonempty('Attempt is required')

export async function getWord(_: AuthenticateRequest, res: Response) {
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
      const randomWord = await WordRepository.findUnexistedWordIn(usedWords.value as string[], 1, {
          isGolden: Math.random() < 0.01 ? true : false
        }) 

      if(randomWord.isSuccess()) {
        const {word,isGolden} = randomWord.value!;
        await UsedWordRepository.createUsedWord({
          wordId: randomWord.value!.id
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

export async function attemptSuccess(req: AuthenticateRequest, res: Response) {
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

    const todaysWord = await WordRepository.find(wordIdResult.value?.wordId!);

    if(todaysWord.isFailure() || (todaysWord.isSuccess() && !todaysWord.value.id)){
      notFound(res, Errors.NOT_FOUND_WORD)
      return;
    }

    if(todaysWord.isSuccess() && todaysWord.value?.word === attemptResult.value) {
      await StatisticRepository.create({
        wordId: todaysWord.value.id,
        attempt: attemptResult.value,
        userId: id,
        type: EStatistics.CORRECT
      });
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const incorrectAttemptsResult = await StatisticRepository.countDocuments({
        userId: id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        type: EStatistics.INCORRECT
      })
  
      if(incorrectAttemptsResult.isFailure()) {
        badRequest(res, "Error calculating new score")
        return;
      }

      const score = BASE_SCORE - (ATTEMPT_PENALTY * incorrectAttemptsResult.value)

      const updateUserResult = await UserRepository.updateScore(id, score);

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

export async function attemptFail(req: AuthenticateRequest, res: Response) {
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

    const todaysWordResult = await WordRepository.find(todaysWordId.value?.wordId!);

    if(todaysWordResult.isFailure() || (todaysWordResult.isSuccess() && !todaysWordResult.value.id)){
      notFound(res, Errors.NOT_FOUND_WORD)
      return;
    }

    if(todaysWordResult.isSuccess() && todaysWordResult.value.word !== attemptResult.value) {
      await StatisticRepository.create({
        attempt: attemptResult.value,
        wordId: todaysWordResult.value.id,
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

export async function registerSkippedAttemp(req: AuthenticateRequest, res: Response) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED)
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySkippedResult = await SkippedAttemptRepository.findOne({
      userId: id,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    })

    if(todaySkippedResult.isSuccess() && todaySkippedResult.value?.id) {
      badRequest(res,"Skipped Document found")
      return;
    }

    const todaysWordResult = await UsedWordRepository.findTodaysWord();

    if(todaysWordResult.isFailure() || !todaysWordResult.value?.id) {
      notFound(res, Errors.NOT_FOUND_WORD)
      return;
    }

    await SkippedAttemptRepository.create({
      userId: id,
      wordId: todaysWordResult.value?.wordId!
    })

    ok(res);
    
  } catch (error) {
    serverError(res);
  }
}

export async function deleteSkippedAttempDocument(req: AuthenticateRequest, res: Response) {
  try {
    const id = req.userId;

    if(!id) {
      badRequest(res, Errors.UNAUTHORIZED)
      return;
    }

    const deleteDocResult = await SkippedAttemptRepository.delete({
      userId: id
    })

    if(deleteDocResult.isFailure() || (deleteDocResult.isSuccess() && !deleteDocResult.value?.id)) {
      notFound(res, Errors.NOT_FOUND_DOCUMENT)
      return;
    }

    ok(res)

  } catch (error) {
    serverError(res)
  }
}