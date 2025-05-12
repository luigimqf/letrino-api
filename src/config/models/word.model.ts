import { ModelWithTimestamp } from ".";
import { ObjectID } from "../../types";

export interface IWord extends ModelWithTimestamp {
  word: string;
  isGolden: boolean;
}

export interface IWordRelatedDocument extends ModelWithTimestamp {
  wordId: ObjectID;
  deletedAt?: Date;
}

export interface ISkippedWord extends IWordRelatedDocument {
  userId: ObjectID;
}