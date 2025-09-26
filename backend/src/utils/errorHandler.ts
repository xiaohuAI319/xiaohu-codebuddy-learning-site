import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';

export class AppError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function createValidationError(message: string, errors: ValidationError[]): AppError {
  return new AppError(400, 'VALIDATION_ERROR', message, { errors });
}

export function createDuplicateError(message: string): AppError {
  return new AppError(409, 'USER_ALREADY_EXISTS', message);
}

export function createAuthError(message: string): AppError {
  return new AppError(401, 'AUTHENTICATION_ERROR', message);
}

export function createNotFoundError(message: string): AppError {
  return new AppError(404, 'NOT_FOUND', message);
}

export function createForbiddenError(message: string): AppError {
  return new AppError(403, 'FORBIDDEN', message);
}

export function createInternalError(message: string): AppError {
  return new AppError(500, 'INTERNAL_SERVER_ERROR', message);
}

// Async handler wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  let status = err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal server error';

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    code = 'USER_ALREADY_EXISTS';
    message = 'Username or email already exists';
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
  }

  const payload: any = {
    code,
    message: process.env.NODE_ENV === 'production' && status === 500 ? 'Internal server error' : message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Add details in development
  if (process.env.NODE_ENV !== 'production' && err.details) {
    payload.details = err.details;
  }

  // Add stack trace in development for 500 errors
  if (process.env.NODE_ENV !== 'production' && status === 500 && err.stack) {
    payload.stack = err.stack;
  }

  console.error(`[${new Date().toISOString()}] ${status} ${code}: ${message}`, {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack
  });

  res.status(status).json(payload);
}