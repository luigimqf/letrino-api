import { FilterQuery, ObjectId } from "mongoose";
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
  wordId: ObjectId;
  attempt: string;
  userId: ObjectId;
  type: EStatistics;
}

export class StatisticRepository {

  static async create({wordId,attempt,userId,type}:IStatisticCreate): Promise<Either<Errors, undefined>> {
    try {
      const statistic = new Statistic({ wordId,attempt,userId, type });
      await statistic.save();
      return Success.create(undefined);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
  
  static async findOne(conditions: FilterQuery<IStatistic>): Promise<Either<Errors, IStatistic | null>> {
    try {
      const statistic = await Statistic.findOne(conditions);

      return Success.create(statistic);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }

  static async countDocuments(conditions: FilterQuery<IStatistic>): Promise<Either<Errors, number>> {
    try {
      const numberOfDocs = await Statistic.countDocuments(conditions);

      return Success.create(numberOfDocs)
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR)
    }
  }
}