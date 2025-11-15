"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
const mongoose_1 = __importDefault(require("mongoose"));
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
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            statusCode = 400;
            message = 'Validation Error';
            code = 'VALIDATION_ERROR';
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            if (validationErrors.length > 0) {
                message = validationErrors.join(', ');
            }
        }
        if (error instanceof mongoose_1.default.Error.CastError || error.name === 'CastError') {
            statusCode = 400;
            message = `Invalid ${error.path || 'ID'} format`;
            code = 'INVALID_ID';
        }
        if (error.code === 11000 || error.name === 'MongoServerError') {
            statusCode = 409;
            const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';
            message = `Duplicate ${duplicateField} value`;
            code = 'DUPLICATE_FIELD';
        }
        if (error.name === 'DocumentNotFoundError' || error.name === 'DocumentNotFoundError') {
            statusCode = 404;
            message = 'Resource not found';
            code = 'NOT_FOUND';
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
        if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
            statusCode = 503;
            message = 'Database connection error';
            code = 'DATABASE_CONNECTION_ERROR';
        }
        if (error.name === 'MongoError' && !error.code) {
            statusCode = 500;
            message = 'Database error';
            code = 'DATABASE_ERROR';
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