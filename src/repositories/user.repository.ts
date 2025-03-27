import { Document, UpdateQuery } from "mongoose";
import { User } from "../config/db/models/users";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";
import { IUser } from "../config/models/user.model";

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
      console.log(error)
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async find(id: string): Promise<Either<Errors, IUser>> {
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

  // static async findScore(id: string): Promise<Either<Errors, IUser>> {
  //   try {
  //     const user = await User.findById(id);
  //     if (!user) {
  //       return Failure.create(Errors.NOT_FOUND);
  //     }
  //     const usersOrdered = await User.find().sort({score: -1});
  //     const userScore = usersOrdered.findIndex((u) => u._id.toString() === id) + 1;
  //     return Success.create({...user.toObject(), rank: userScore});
  //   } catch (error) {
  //     return Failure.create(Errors.SERVER_ERROR);
  //   }
  // }

  static async delete(id: string): Promise<Either<Errors, void>> {
    try {
      await User.findByIdAndDelete(id);

      return Success.create(undefined);
    } catch (error: any) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findWhere(field: string, value: string): Promise<Either<Errors, IUser | null>> {
    try {
      const user: (IUser & Document) | null = await User.findOne().where(field).equals(value);

      return Success.create(user);
    } catch (error: any) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async update(id:string, update: Record<string, any>, options?: {new?: boolean; upsert?: boolean; runValidators?: boolean;}): Promise<Either<Errors, IUser | null>> {
    try {
      const result = await User.findByIdAndUpdate(id, update, options);

      return Success.create(result);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}