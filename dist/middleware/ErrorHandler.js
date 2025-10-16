"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class ErrorHandler {
    static notFound(req, _res, next) {
        const error = new Error(`Not Found - ${req.originalUrl}`);
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        next(error);
    }
    static handle(error, _req, res, _next) {
        let statusCode = error.statusCode || 500;
        let message = error.message || 'Internal Server Error';
        let code = error.code || 'INTERNAL_ERROR';
        ErrorHandler.logger.error('Error occurred:', error);
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
        if (error.name === 'MongoError' && error.code === 11000) {
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
            const prismaError = error;
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
        if (process.env['NODE_ENV'] === 'production' && !error.isOperational) {
            message = 'Something went wrong';
            code = 'INTERNAL_ERROR';
        }
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
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
    static createError(message, statusCode = 500, code) {
        const error = new Error(message);
        error.statusCode = statusCode;
        error.code = code;
        error.isOperational = true;
        return error;
    }
    static validationError(message, _field) {
        const error = new Error(message);
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        error.isOperational = true;
        return error;
    }
    static notFoundError(message = 'Resource not found') {
        const error = new Error(message);
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        error.isOperational = true;
        return error;
    }
    static unauthorizedError(message = 'Unauthorized') {
        const error = new Error(message);
        error.statusCode = 401;
        error.code = 'UNAUTHORIZED';
        error.isOperational = true;
        return error;
    }
    static forbiddenError(message = 'Forbidden') {
        const error = new Error(message);
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        error.isOperational = true;
        return error;
    }
    static conflictError(message = 'Conflict') {
        const error = new Error(message);
        error.statusCode = 409;
        error.code = 'CONFLICT';
        error.isOperational = true;
        return error;
    }
    static badRequestError(message = 'Bad request') {
        const error = new Error(message);
        error.statusCode = 400;
        error.code = 'BAD_REQUEST';
        error.isOperational = true;
        return error;
    }
}
exports.ErrorHandler = ErrorHandler;
ErrorHandler.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');
exports.default = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map