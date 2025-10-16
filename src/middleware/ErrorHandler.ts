import { Request, Response, NextFunction } from 'express';
import { Logger } from '@sandip1046/rubizz-shared-libs';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export class ErrorHandler {
  private static logger = Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');

  // Handle 404 errors
  static notFound(req: Request, _res: Response, next: NextFunction): void {
    const error = new Error(`Not Found - ${req.originalUrl}`) as AppError;
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    next(error);
  }

  // Main error handler
  static handle(error: AppError, _req: Request, res: Response, _next: NextFunction): void {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let code = error.code || 'INTERNAL_ERROR';

    // Log error
    ErrorHandler.logger.error('Error occurred:', error as Error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
      code = 'VALIDATION_ERROR';
    }

    if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
      code = 'INVALID_ID';
    }

    if (error.name === 'MongoError' && (error as any).code === 11000) {
      statusCode = 400;
      message = 'Duplicate field value';
      code = 'DUPLICATE_FIELD';
    }

    if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
      code = 'INVALID_TOKEN';
    }

    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
      code = 'TOKEN_EXPIRED';
    }

    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as any;
      
      switch (prismaError.code) {
        case 'P2002':
          statusCode = 400;
          message = 'Unique constraint violation';
          code = 'UNIQUE_CONSTRAINT_VIOLATION';
          break;
        case 'P2025':
          statusCode = 404;
          message = 'Record not found';
          code = 'RECORD_NOT_FOUND';
          break;
        case 'P2003':
          statusCode = 400;
          message = 'Foreign key constraint violation';
          code = 'FOREIGN_KEY_CONSTRAINT_VIOLATION';
          break;
        default:
          statusCode = 400;
          message = 'Database error';
          code = 'DATABASE_ERROR';
      }
    }

    if (error.name === 'PrismaClientValidationError') {
      statusCode = 400;
      message = 'Database validation error';
      code = 'DATABASE_VALIDATION_ERROR';
    }

    // Don't leak error details in production
    if (process.env['NODE_ENV'] === 'production' && !error.isOperational) {
      message = 'Something went wrong';
      code = 'INTERNAL_ERROR';
    }

    // Send error response
    res.status(statusCode).json({
      success: false,
      message,
      code,
      ...(process.env['NODE_ENV'] === 'development' && {
        stack: error.stack,
        details: error,
      }),
    });
  }

  // Async error wrapper
  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Create custom error
  static createError(message: string, statusCode: number = 500, code?: string): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    (error as any).code = code;
    error.isOperational = true;
    return error;
  }

  // Validation error
  static validationError(message: string, _field?: string): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.isOperational = true;
    return error;
  }

  // Not found error
  static notFoundError(message: string = 'Resource not found'): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    error.isOperational = true;
    return error;
  }

  // Unauthorized error
  static unauthorizedError(message: string = 'Unauthorized'): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    error.isOperational = true;
    return error;
  }

  // Forbidden error
  static forbiddenError(message: string = 'Forbidden'): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    error.isOperational = true;
    return error;
  }

  // Conflict error
  static conflictError(message: string = 'Conflict'): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = 409;
    error.code = 'CONFLICT';
    error.isOperational = true;
    return error;
  }

  // Bad request error
  static badRequestError(message: string = 'Bad request'): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    error.isOperational = true;
    return error;
  }
}

export default ErrorHandler;
