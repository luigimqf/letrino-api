/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";
import { Errors } from "../constants/error";
import { Either, Failure, Success } from "./either";
import { Request, Response, NextFunction } from "express";
import { badRequest } from "./http-status";

interface ValidationSchema {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
}

export function Validate(schemas: ValidationSchema) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next?: NextFunction) {
      try {
        if (schemas.body) {
          const bodyValidation = schemas.body.safeParse(req.body);
          if (!bodyValidation.success) {
            return badRequest(res, {
              message: bodyValidation.error.issues[0].message,
            });
          }
          req.body = bodyValidation.data;
        }

        if (schemas.query) {
          const queryValidation = schemas.query.safeParse(req.query);
          if (!queryValidation.success) {
            return badRequest(res, {
              message: queryValidation.error.issues[0].message,
            });
          }
          req.query = queryValidation.data;
        }

        if (schemas.params) {
          const paramsValidation = schemas.params.safeParse(req.params);
          if (!paramsValidation.success) {
            return badRequest(res, {
              message: paramsValidation.error.issues[0].message,
            });
          }
          req.params = paramsValidation.data;
        }

        return await originalMethod.call(this, req, res, next);
      } catch (error) {
        return badRequest(res, {
          message: error instanceof Error ? error.message : Errors.SERVER_ERROR,
        });
      }
    };

    return descriptor;
  };
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