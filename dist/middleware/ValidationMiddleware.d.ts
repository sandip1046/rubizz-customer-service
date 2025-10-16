import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare class ValidationMiddleware {
    private static logger;
    static validate(schema: Joi.ObjectSchema, property?: 'body' | 'query' | 'params'): (req: Request, res: Response, next: NextFunction) => void;
    static validateCustomerCreation: (req: Request, res: Response, next: NextFunction) => void;
    static validateCustomerUpdate: (req: Request, res: Response, next: NextFunction) => void;
    static validateCustomerProfile: (req: Request, res: Response, next: NextFunction) => void;
    static validateCustomerPreferences: (req: Request, res: Response, next: NextFunction) => void;
    static validateCustomerAddress: (req: Request, res: Response, next: NextFunction) => void;
    static validateCustomerSearch: (req: Request, res: Response, next: NextFunction) => void;
    static validatePagination: (req: Request, res: Response, next: NextFunction) => void;
    static validateCustomerId: (req: Request, res: Response, next: NextFunction) => void;
    static validateAddressId: (req: Request, res: Response, next: NextFunction) => void;
}
export default ValidationMiddleware;
//# sourceMappingURL=ValidationMiddleware.d.ts.map