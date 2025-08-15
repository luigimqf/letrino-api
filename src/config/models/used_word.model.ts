import { ModelWithTimestamp } from "../../types";

export interface IUsedWord extends ModelWithTimestamp {
  wordId: string;
  deletedAt?: Date;
}