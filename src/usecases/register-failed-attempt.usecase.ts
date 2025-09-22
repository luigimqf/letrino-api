import { ErrorCode } from '../constants/error';
import { EGameStatus } from '../constants/game';
import { EAttemptStatus } from '../constants/attempt';
import { IAttemptRepository } from '../repositories/attempt.repository';
import { IMatchRepository } from '../repositories/match.repository';
import { IUsedWordRepository } from '../repositories/used_word.repository';
import { IWordRepository } from '../repositories/word.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IRegisterFailedAttemptUseCase {
  execute({
    id,
    attempt,
  }: {
    id: string;
    attempt: string;
  }): Promise<Either<ErrorCode, ISuccessReturn>>;
}

interface ISuccessReturn {
  score?: number;
  attempt: number;
  correctWord?: string;
}

export class RegisterFailedAttemptUseCase
  implements IRegisterFailedAttemptUseCase
{
  constructor(
    private attemptRepository: IAttemptRepository,
    private matchRepository: IMatchRepository,
    private usedWordRepository: IUsedWordRepository,
    private wordRepository: IWordRepository
  ) {}

  async execute({
    id,
    attempt,
  }: {
    id: string;
    attempt: string;
  }): Promise<Either<ErrorCode, ISuccessReturn>> {
    const userUsedWord = await this.usedWordRepository.findUserWord(id);

    if (userUsedWord.isFailure() || !userUsedWord.value) {
      return Failure.create(ErrorCode.USER_WORD_NOT_FOUND);
    }

    const word = await this.wordRepository.find(
      userUsedWord?.value?.wordId || ''
    );

    if (word.isFailure() || !word.value) {
      return Failure.create(ErrorCode.WORD_NOT_FOUND);
    }

    let userMatchResult = await this.matchRepository.findByUserId(id);

    if (
      userMatchResult.isFailure() &&
      userMatchResult.error === ErrorCode.MATCH_NOT_FOUND
    ) {
      const newMatchResult = await this.matchRepository.create({
        userId: id,
        score: 0,
        result: EGameStatus.IN_PROGRESS,
        wordId: word.value.id,
      });

      if (newMatchResult.isFailure() || !newMatchResult.value) {
        return Failure.create(ErrorCode.MATCH_CREATE_FAILED);
      }

      userMatchResult = Success.create(newMatchResult.value);
    }

    if (userMatchResult.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    if (userMatchResult.value.result !== EGameStatus.IN_PROGRESS) {
      return Failure.create(ErrorCode.MATCH_NOT_IN_PROGRESS);
    }

    if (word.value.word === attempt) {
      return Failure.create(ErrorCode.BAD_REQUEST);
    }

    const incorrectAttemptResult =
      await this.attemptRepository.countIncorrectAttemptsToday(id);

    if (incorrectAttemptResult.isFailure()) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    const attemptResult = await this.attemptRepository.create({
      userId: id,
      matchId: userMatchResult.value.id,
      wordId: word.value.id,
      result: EAttemptStatus.INCORRECT,
      userInput: attempt,
    });

    if (attemptResult.isFailure() || !attemptResult.value) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }

    const totalIncorrectAttempts = incorrectAttemptResult.value!;

    if (totalIncorrectAttempts < 5) {
      return Success.create({
        attempt: totalIncorrectAttempts + 1,
      });
    }

    const attempts = await this.attemptRepository.findTodaysAttempts(id);

    if (attempts.isFailure()) {
      return Failure.create(ErrorCode.ATTEMPTS_NOT_FOUND);
    }

    const updateMatchResult = await this.matchRepository.update({
      id: userMatchResult.value.id,
      data: { result: EGameStatus.INCORRECT, score: 0 },
    });

    if (updateMatchResult.isFailure() || !updateMatchResult.value) {
      return Failure.create(ErrorCode.MATCH_UPDATE_FAILED);
    }

    return Success.create({
      score: 0,
      attempt: attempts.value.length,
      correctWord: word.value.word,
    });
  }
}
