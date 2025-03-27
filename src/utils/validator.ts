import z from "zod";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "./either";

export function schemaValidator<T = unknown>(schema: z.ZodType<T, any, any>, body: T): Either<string, T> {
  try {
    const data = schema.parse(body);
    
    return Success.create<T>(data);
  } catch (error) {
    if(error instanceof z.ZodError) {
      return Failure.create(error.issues[0].message);
    }
    return Failure.create(Errors.SERVER_ERROR);
  }
}