import { EStatistics } from "../../constants/statistic";
import { ModelWithTimestamp } from "../../types";

export interface IStatistic extends ModelWithTimestamp {
  wordId: string,
  attempt: string;
  userId: string,
  type: EStatistics
}