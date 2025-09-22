import { EAttemptStatus } from '../../constants/attempt';
import { ModelWithTimestamp } from '../../types';

export interface IStatistic extends ModelWithTimestamp {
  wordId: string;
  attempt: string;
  userId: string;
  type: EAttemptStatus;
}
