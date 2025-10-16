import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
}
export declare class ErrorHandler {
    private static logger;
    static notFound(req: Request, _res: Response, next: NextFunction): void;
    static handle(error: AppError, _req: Request, res: Response, _next: NextFunction): void;
    static asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
    static createError(message: string, statusCode?: number, code?: string): AppError;
    static validationError(message: string, _field?: string): AppError;
    static notFoundError(message?: string): AppError;
    static unauthorizedError(message?: string): AppError;
    static forbiddenError(message?: string): AppError;
    static conflictError(message?: string): AppError;
    static badRequestError(message?: string): AppError;
}
export default ErrorHandler;
//# sourceMappingURL=ErrorHandler.d.ts.map