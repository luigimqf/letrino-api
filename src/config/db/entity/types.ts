import { EStatistics } from '../../../constants/statistic';

export interface IAttempt {
  userId: string;
  gamePlayedId: string;
  statisticId: string;
  wordId: string;
  userInput: string;
  result: EStatistics;
}
