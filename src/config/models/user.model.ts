import { ModelWithTimestamp } from "../../types";
import { IStatistic } from "./statistic";

export interface IUser extends ModelWithTimestamp {
  id: string;
  username: string;
  avatar?: string;
  email: string;
  score: number;
  password: string;
  statistics: IStatistic[];
}