/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "./either";
import { Request, Response, NextFunction } from "express";

interface ValidationSchema {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
}

export function Validate(schemas: ValidationSchema) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (req: Request, res: Response, next: NextFunction) {
      try {
        if(schemas.body) return schemas.body.parse(req.body);
        if(schemas.query) return schemas.query.parse(req.query);
        if(schemas.params) return schemas.params.parse(req.params);

        return originalMethod.call(this, req, res, next);
      } catch (error) {
        return res.status(400).json({
          error: error instanceof z.ZodError ? error.issues[0].message : Errors.SERVER_ERROR
        });
      }
    }
    return descriptor;
  }
}

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