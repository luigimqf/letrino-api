import { ObjectID } from "../../types";

export interface IUsedWord {
  wordId: ObjectID;
  deletedAt?: Date;
}