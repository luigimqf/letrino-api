import { ModelWithTimestamp } from "../../types";

export interface IWord extends ModelWithTimestamp {
  word: string;
  isGolden: boolean;
}

export interface IWordRelatedDocument extends ModelWithTimestamp {
  wordId: string;
  deletedAt?: Date;
}

export interface ISkippedWord extends IWordRelatedDocument {
  userId: string;
}