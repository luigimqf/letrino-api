import { Session } from "../config/db/models/session";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "../utils/either";


export class SessionRepository {
  static async delete(id: string): Promise<Either<Errors, void>> {
    try {
      await Session.findOneAndDelete().where('user_id').equals(id);

      return Success.create(undefined);
    } catch (error: any) {
      return Failure.create(Errors.SERVER_ERROR);
    }
  }
}