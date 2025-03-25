import z from "zod";
import { Either, Failure, Success } from "../types/either";

export function schemaValidator<T, U = unknown>(schema: z.ZodType<any, any, any>, body: U): Either<z.ZodError, T> {
  try {
    const data = schema.parse(body);
    
    return Success.create(data);
  } catch (error) {
    return Failure.create(error as z.ZodError);
  }
}