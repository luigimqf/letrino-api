import { AppDataSource } from "../config/db";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";
import { IUser } from "../config/models/user.model";
import { User } from "../config/db/entity";

interface IFindAll {
  sort?: { [key: string]: 'ASC' | 'DESC' };
  limit?: number;
}

export class UserRepository {
  private static repository = AppDataSource.getRepository(User);

  static async create(data: Partial<IUser>): Promise<Either<Errors, User>> {
    try {
      const newUser = this.repository.create(data);
      const savedUser = await this.repository.save(newUser);
      
      return Success.create(savedUser);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findById(id: string): Promise<Either<Errors, User>> {
    try {
      const user = await this.repository.findOne({ where: { id } });

      if (!user) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(user);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findAll({ sort, limit = 999999 }: IFindAll = {}): Promise<Either<Errors, User[]>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('user');
      
      if (sort) {
        Object.entries(sort).forEach(([key, direction]) => {
          queryBuilder.addOrderBy(`user.${key}`, direction);
        });
      }
      
      if (limit !== 999999) {
        queryBuilder.limit(limit);
      }
      
      const users = await queryBuilder.getMany();
      return Success.create(users);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async delete(id: string): Promise<Either<Errors, void>> {
    try {
      await this.repository.delete(id);
      return Success.create(undefined);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async findOneBy(conditions: Partial<User>): Promise<Either<Errors, User | null>> {
    try {
      const user = await this.repository.findOne({ where: conditions });
      return Success.create(user);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async update(id: string, update: Partial<User>): Promise<Either<Errors, User | null>> {
    try {
      await this.repository.update(id, update);
      const updatedUser = await this.repository.findOne({ where: { id } });
      return Success.create(updatedUser);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  static async updateScore(id: string, scoreIncrement: number): Promise<Either<Errors, User | null>> {
    try {
      await this.repository.increment({ id }, 'score', scoreIncrement);
      const updatedUser = await this.repository.findOne({ where: { id } });
      return Success.create(updatedUser);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}