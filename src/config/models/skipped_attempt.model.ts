import { ModelWithTimestamp } from "../../types";

export interface ISkippedAttempt extends ModelWithTimestamp {
  wordId: string;
  userId: string;
  deletedAt?: Date;
}