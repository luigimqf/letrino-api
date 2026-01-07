import { Errors } from '../constants/error';
import { Either, Failure, Success } from '../utils/either';
import { IUser } from '../config/models/user.model';
import { User } from '../config/db/entity';
import { Between, FindOneOptions, Repository } from 'typeorm';
import { DateUtils } from '../utils/date';

interface IFindAll {
  sort?: { [key: string]: 'ASC' | 'DESC' };
  limit?: number;
}

export interface IUserRepository {
  create(data: Partial<IUser>): Promise<Either<Errors, User>>;
  findById(id: string): Promise<Either<Errors, User>>;
  findUserCreatedToday(): Promise<Either<Errors, User>>;
  findWithRelation({
    findBy,
    relations,
    select,
  }: {
    findBy: { email?: string; username?: string };
    relations: string[];
    select?: FindOneOptions<User>['select'];
  }): Promise<Either<Errors, User>>;
  findAll(options?: IFindAll): Promise<Either<Errors, User[]>>;
  delete(id: string): Promise<Either<Errors, void>>;
  findOneBy({
    email,
    username,
  }: {
    email?: string;
    username?: string;
  }): Promise<Either<Errors, User | null>>;
  update(
    id: string,
    updateData: Partial<User>
  ): Promise<Either<Errors, User | null>>;
  updateScore(
    id: string,
    scoreIncrement: number
  ): Promise<Either<Errors, User | null>>;
}
export class UserRepository implements IUserRepository {
  constructor(private readonly repository: Repository<User>) {}

  async create(data: Partial<IUser>): Promise<Either<Errors, User>> {
    try {
      const newUser = this.repository.create(data);
      const savedUser = await this.repository.save(newUser);

      return Success.create(savedUser);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async findUserCreatedToday(): Promise<Either<Errors, User>> {
    try {
      const startOfDay = DateUtils.startOfDay();
      const endOfDay = DateUtils.endOfDay();

      const user = await this.repository.findOne({
        where: {
          createdAt: Between(startOfDay, endOfDay),
        },
      });

      if (!user) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(user);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<Either<Errors, User>> {
    try {
      const user = await this.repository.findOne({
        where: { id },
        relations: ['matches'],
      });

      if (!user) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(user);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async findWithRelation({
    findBy,
    relations,
    select,
  }: {
    findBy: { email?: string; username?: string };
    relations: string[];
    select?: FindOneOptions<User>['select'];
  }): Promise<Either<Errors, User>> {
    try {
      const user = await this.repository.findOne({
        where: { ...findBy },
        relations,
        select,
      });

      if (!user) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(user);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async findAll({ sort, limit }: IFindAll = {}): Promise<
    Either<Errors, User[]>
  > {
    try {
      const queryBuilder = this.repository.createQueryBuilder('user');

      if (sort) {
        Object.entries(sort).forEach(([key, direction]) => {
          queryBuilder.addOrderBy(`user.${key}`, direction);
        });
      }

      if (limit) {
        queryBuilder.limit(limit);
      }

      const users = await queryBuilder.getMany();
      return Success.create(users);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async delete(id: string): Promise<Either<Errors, void>> {
    try {
      const result = await this.repository.delete(id);

      if (result.affected === 0) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(undefined);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async findOneBy({
    email,
    username,
  }: {
    email?: string;
    username?: string;
  }): Promise<Either<Errors, User | null>> {
    try {
      const user = await this.repository.findOne({
        where: { email, username },
      });
      return Success.create(user);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async update(
    id: string,
    updateData: Partial<User>
  ): Promise<Either<Errors, User | null>> {
    try {
      const result = await this.repository.update(id, updateData);

      if (result.affected === 0) {
        return Success.create(null);
      }

      const updatedUser = await this.repository.findOne({ where: { id } });
      return Success.create(updatedUser);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async updateScore(
    id: string,
    scoreIncrement: number
  ): Promise<Either<Errors, User | null>> {
    try {
      const user = await this.repository.findOne({ where: { id } });
      return Success.create(user);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}
