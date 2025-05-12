import { ModelWithTimestamp } from ".";
import { IStatistic } from "./statistic";
import { ObjectID } from "../../types";

export interface IUser extends ModelWithTimestamp {
  _id: ObjectID;
  name: string;
  email: string;
  score: number;
  password: string;
  statistics: IStatistic;
}