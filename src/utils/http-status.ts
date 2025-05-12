import {Response} from 'express';

export function ok(res: Response, data: unknown  = null, message: string | null = null) {
    return res.status(200).json({
      success: true,
      data,
      message
    })
}

export function created(res: Response, data: unknown  = null, message: string | null = null) {
  return res.status(201).json({
    success: true,
    data,
    message
  });
}

export function noContent(res: Response) {
  return res.status(204);
}

export function badRequest(res: Response, message = 'Bad Request') {
  return res.status(400).json({
    success: false,
    error: message
  })
}

export function unauthorized(res: Response, message = 'Unauthorized') {
  return res.status(401).json({
    success: false,
    error: message
  })
}

export function forbidden(res: Response, message = 'Forbidden') {
  return res.status(403).json({
    success: false,
    error: message
  })
}

export function notFound(res: Response, message = 'Not Found') {
  return res.status(404).json({
    success: false,
    error: message
  })
}

export function serverError(res: Response, message = 'Server Error') {
  return res.status(500).json({
    success: false,
    error: message
  })
}