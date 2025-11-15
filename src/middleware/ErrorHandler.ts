import { Request, Response, NextFunction } from 'express';
import { Logger } from '@sandip1046/rubizz-shared-libs';
import mongoose from 'mongoose';

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

    // Handle Mongoose ValidationError
    if (error instanceof mongoose.Error.ValidationError) {
      statusCode = 400;
      message = 'Validation Error';
      code = 'VALIDATION_ERROR';
      
      // Extract validation error details
      const validationErrors = Object.values((error as mongoose.Error.ValidationError).errors).map(
        (err: any) => err.message
      );
      if (validationErrors.length > 0) {
        message = validationErrors.join(', ');
      }
    }

    // Handle Mongoose CastError (Invalid ID format)
    if (error instanceof mongoose.Error.CastError || error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid ${(error as mongoose.Error.CastError).path || 'ID'} format`;
      code = 'INVALID_ID';
    }

    // Handle MongoDB duplicate key error
    if ((error as any).code === 11000 || error.name === 'MongoServerError') {
      statusCode = 409;
      const duplicateField = Object.keys((error as any).keyPattern || {})[0] || 'field';
      message = `Duplicate ${duplicateField} value`;
      code = 'DUPLICATE_FIELD';
    }

    // Handle Mongoose DocumentNotFoundError
    if (error.name === 'DocumentNotFoundError' || (error as any).name === 'DocumentNotFoundError') {
      statusCode = 404;
      message = 'Resource not found';
      code = 'NOT_FOUND';
    }

    // Handle JWT errors
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

    // Handle MongoDB connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      statusCode = 503;
      message = 'Database connection error';
      code = 'DATABASE_CONNECTION_ERROR';
    }

    // Handle general MongoDB errors
    if (error.name === 'MongoError' && !(error as any).code) {
      statusCode = 500;
      message = 'Database error';
      code = 'DATABASE_ERROR';
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
