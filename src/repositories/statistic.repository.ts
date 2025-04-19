import { ObjectId } from "mongoose";
import { Statistic } from "../config/db/models/statistic";
import { Errors } from "../constants/error";
import { EStatistics } from "../constants/statistic";
import { Either, Failure, Success } from "../utils/either";
import { IStatistic } from "../config/models/statistic";

interface IStatisticBase {
  type: EStatistics;
  userId: ObjectId
}

interface IStatisticCreate extends IStatisticBase {
  word: ObjectId;
  attempt: string;
  userId: ObjectId;
  type: EStatistics;
}

export class StatisticRepository {

  static async create({word,attempt,userId,type}:IStatisticCreate): Promise<Either<Errors, undefined>> {
    try {
      const statistic = new Statistic({ word,attempt,userId, type });
      await statistic.save();
      return Success.create(undefined);
    } catch (error) {
      console.log(error)
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
  
  static async find({type,userId}:IStatisticBase): Promise<Either<Errors, IStatistic | null>> {
    try {
      const statistic = await Statistic.findOne({
        userId,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        type,
      });

      return Success.create(statistic);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }
}