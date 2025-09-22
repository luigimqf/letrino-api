import { IWord } from '../config/models/word.model';
import { ErrorCode } from '../constants/error';
import { IUsedWordRepository } from '../repositories/used_word.repository';
import { IWordRepository } from '../repositories/word.repository';
import { Either, Failure, Success } from '../utils/either';

export interface IGetRandomWordUseCase {
  execute(
    id: string | null
  ): Promise<Either<ErrorCode, Pick<IWord, 'word' | 'isGolden'>>>;
}

export class GetRandomWordUseCase implements IGetRandomWordUseCase {
  constructor(
    private wordRepository: IWordRepository,
    private usedWordRepository: IUsedWordRepository
  ) {}

  async execute(
    id: string | null
  ): Promise<Either<ErrorCode, Pick<IWord, 'word' | 'isGolden'>>> {
    if (id) {
      return this.handleId(id);
    }

    const randomWord = await this.wordRepository.findOneRandom();

    if (randomWord.isFailure() || !randomWord.value) {
      return Failure.create(ErrorCode.WORD_NOT_FOUND);
    }

    const { word, isGolden } = randomWord.value;
    return Success.create({ word, isGolden });
  }

  private async handleId(id: string) {
    const userWord = await this.usedWordRepository.findUserWord(id);

    if (userWord.isSuccess() && userWord.value) {
      const wordDoc = await this.wordRepository.find(userWord.value.wordId);

      if (wordDoc.isSuccess() && wordDoc.value) {
        const { word, isGolden } = wordDoc.value;

        return Success.create({ word, isGolden });
      }
    }

    const userUsedWords = await this.usedWordRepository.findUserUsedWords(id);

    if (userUsedWords.isFailure() || !userUsedWords.value) {
      return Failure.create(ErrorCode.SERVER_ERROR);
    }
    const usedWordIds = userUsedWords.value.map(usedWord => usedWord.wordId);

    const randomWord = await this.wordRepository.findOneRandom(usedWordIds);

    if (randomWord.isFailure() || !randomWord.value) {
      return Failure.create(ErrorCode.WORD_NOT_FOUND);
    }

    const { word, isGolden, id: wordId } = randomWord.value;

    const createdUsedWord = await this.usedWordRepository.createUsedWord({
      wordId,
      id,
    });

    if (createdUsedWord.isFailure() || !createdUsedWord.value) {
      return Failure.create(ErrorCode.CREATE_USED_WORD_FAILED);
    }

    return Success.create({ word, isGolden });
  }
}
