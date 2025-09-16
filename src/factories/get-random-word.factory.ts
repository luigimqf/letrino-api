import { AppDataSource } from '../config/db/data-source';
import { Match, UsedWord, Word } from '../config/db/entity';
import { IController } from '../controllers/create-user.controller';
import { GetRandomWordController } from '../controllers/get-random-word.controller';
import { MatchRepository } from '../repositories/match.repository';
import { UsedWordRepository } from '../repositories/used_word.repository';
import { WordRepository } from '../repositories/word.repository';
import { GetRandomWordUseCase } from '../usecases/get-random-word.usecase';

export const getRandomWordFactory = (): IController => {
  const matchRepository = new MatchRepository(
    AppDataSource.getRepository(Match)
  );
  const wordRepository = new WordRepository(AppDataSource.getRepository(Word));
  const usedWordRepository = new UsedWordRepository(
    AppDataSource.getRepository(UsedWord)
  );
  const getRandomWordUsecase = new GetRandomWordUseCase(
    matchRepository,
    wordRepository,
    usedWordRepository
  );
  const getRandomWordController = new GetRandomWordController(
    getRandomWordUsecase
  );
  return getRandomWordController;
};
