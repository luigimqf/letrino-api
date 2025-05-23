import { ModelWithTimestamp } from ".";
import { EStatistics } from "../../constants/statistic";
import { ObjectID } from "../../types";

export interface IStatistic extends ModelWithTimestamp {
  wordId: ObjectID,
  attempt: string;
  userId: ObjectID,
  type: EStatistics
}