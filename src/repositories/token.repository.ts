import { Repository } from 'typeorm';
import { Errors } from '../constants/error';
import { Either, Failure, Success } from '../utils/either';
import { Token } from '../config/db/entity/Token';
import { ETokenStatus } from '../constants/token';

export interface ITokenRepository {
  create(token: string): Promise<Either<Errors, Token>>;
  update(token: Token): Promise<Either<Errors, Token>>;
  findActive(token: string): Promise<Either<Errors, Token>>;
  find(id: string): Promise<Either<Errors, Token>>;
}

export class TokenRepository implements ITokenRepository {
  constructor(private readonly repository: Repository<Token>) {}

  async create(token: string): Promise<Either<Errors, Token>> {
    try {
      const newToken = this.repository.create({
        token,
        status: ETokenStatus.ACTIVE,
      });
      const savedToken = await this.repository.save(newToken);
      return Success.create(savedToken);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async update(token: Token): Promise<Either<Errors, Token>> {
    try {
      const updatedToken = await this.repository.save(token);
      return Success.create(updatedToken);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async findActive(token: string): Promise<Either<Errors, Token>> {
    try {
      const tokenDoc = await this.repository.findOne({
        where: { token, status: ETokenStatus.ACTIVE },
      });

      if (!tokenDoc) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(tokenDoc);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }

  async find(token: string): Promise<Either<Errors, Token>> {
    try {
      const tokenDoc = await this.repository.findOne({ where: { token } });

      if (!tokenDoc) {
        return Failure.create(Errors.NOT_FOUND);
      }

      return Success.create(tokenDoc);
    } catch (error) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}
