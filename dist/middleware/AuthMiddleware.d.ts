import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        customerId?: string;
    };
}
export declare class AuthMiddleware {
    private static logger;
    static verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static requireCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
    static requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
    static requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
    static canAccessCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
    static optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void;
    static requireVerifiedCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
}
export default AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.d.ts.map