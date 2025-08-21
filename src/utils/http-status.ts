import {Response} from 'express';
import { ErrorCode, Errors } from '../constants/error';

interface ErrorResponse {
  message?: string;
  code?: string;
}

export function ok(res: Response, data: unknown  = null) {
    return res.status(200).json({
      success: true,
      data,
      error: null,
    })
}

export function created(res: Response, data: unknown  = null) {
  return res.status(201).json({
    success: true,
    data,
    error: null,
  });
}

export function noContent(res: Response) {
  return res.status(204);
}

export function badRequest(res: Response, error: ErrorResponse | null = null) {
  return res.status(400).json({
    success: false,
    data: null,
    error: {
      message: error?.message || Errors.BAD_REQUEST,
      code: error?.code || ErrorCode.BAD_REQUEST,
    }
  })
}

export function unauthorized(res: Response, error: ErrorResponse | null = null) {
  return res.status(401).json({
    success: false,
    data: null,
    error: {
      message: error?.message || Errors.UNAUTHORIZED,
      code: error?.code || ErrorCode.UNAUTHORIZED,
    }
  })
}

export function forbidden(res: Response, error: ErrorResponse | null = null) {
  return res.status(403).json({
    success: false,
    data: null,
    error: {
      message: error?.message || Errors.FORBIDDEN,
      code: error?.code || ErrorCode.FORBIDDEN,
    }
  })
}

export function notFound(res: Response, error: ErrorResponse | null = null) {
  return res.status(404).json({
    success: false,
    data: null,
    error: {
      message: error?.message || Errors.NOT_FOUND,
      code: error?.code || ErrorCode.NOT_FOUND,
    }
  })
}

export function found(res: Response, error: ErrorResponse | null = null) {
  return res.status(409).json({
    success: false,
    data: null,
    error: {
      message: error?.message || Errors.CONFLICT,
      code: error?.code || ErrorCode.CONFLICT,
    }
  })
}

export function serverError(res: Response, error: ErrorResponse | null = null) {
  return res.status(500).json({
    success: false,
    data: null,
    error: {
      message: error?.message || Errors.SERVER_ERROR,
      code: error?.code || ErrorCode.SERVER_ERROR,
    }
  })
}