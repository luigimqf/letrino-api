import { FilterQuery, UpdateQuery } from "mongoose";
import { User } from "../config/db/models/user";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";
import { IUser } from "../config/models/user.model";
import { ObjectID } from "../types";

interface IFindAll {
  sort?: Sort;
  limit?: number;
}

type Sort = {
  [K in keyof IUser]?: -1 | 1;
}
export class UserRepository {

  static async create(data: Partial<IUser>): Promise<Either<Errors, IUser>> {
    try {
      const newUser = new User(data);
      await newUser.save();
      
      return Success.create(newUser);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findById(id: ObjectID | string): Promise<Either<Errors, IUser>> {
    try {
      const user = await User.findById(id);

      if (!user) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(user);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findAll({sort,limit = Infinity}:IFindAll): Promise<Either<Errors, IUser[]>> {
    try {
      const users = await User.find().sort(sort).limit(limit);
      return Success.create(users);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async delete(id: string): Promise<Either<Errors, void>> {
    try {
      await User.findByIdAndDelete(id);

      return Success.create(undefined);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findOneBy(conditions: FilterQuery<IUser>): Promise<Either<Errors, IUser | null>> {
    try {
      const user = await User.findOne(conditions)

      return Success.create(user);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async update(id:ObjectID | string, update: UpdateQuery<IUser>, options?: {new?: boolean; upsert?: boolean; runValidators?: boolean;}): Promise<Either<Errors, IUser | null>> {
    try {
      const result = await User.findByIdAndUpdate(id, update, options);

      return Success.create(result);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}