import { ObjectID } from "../../types";

export interface ModelWithTimestamp {
  _id: ObjectID
  createdAt: Date;
  updatedAt: Date;
}

export type OmitedModelFields<T extends ModelWithTimestamp> = Omit<T,"_id" | "createdAt" | "updatedAt"> 