"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class AuthMiddleware {
    static async verifyToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    message: 'Access token required',
                    code: 'MISSING_TOKEN',
                });
            }
            const token = authHeader.substring(7);
            try {
                const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
                if (!decoded.id || !decoded.email || !decoded.role) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid token structure',
                        code: 'INVALID_TOKEN',
                    });
                }
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role,
                    customerId: decoded.customerId,
                };
                AuthMiddleware.logger.debug('Token verified successfully', { userId: decoded.id, role: decoded.role });
                next();
            }
            catch (jwtError) {
                AuthMiddleware.logger.warn('Token verification failed', { error: jwtError.message });
                res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token',
                    code: 'INVALID_TOKEN',
                });
            }
        }
        catch (error) {
            AuthMiddleware.logger.error('Auth middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Authentication error',
                code: 'AUTH_ERROR',
            });
        }
    }
    static requireCustomer(req, res, next) {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }
        if (req.user.role !== 'CUSTOMER') {
            res.status(403).json({
                success: false,
                message: 'Customer access required',
                code: 'CUSTOMER_ACCESS_REQUIRED',
            });
        }
        next();
    }
    static requireAdmin(req, res, next) {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }
        if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Admin access required',
                code: 'ADMIN_ACCESS_REQUIRED',
            });
        }
        next();
    }
    static requireSuperAdmin(req, res, next) {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }
        if (req.user.role !== 'SUPER_ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Super admin access required',
                code: 'SUPER_ADMIN_ACCESS_REQUIRED',
            });
        }
        next();
    }
    static canAccessCustomer(req, res, next) {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
            return;
        }
        if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            next();
        }
        if (req.user.role === 'CUSTOMER') {
            const customerId = req.params['customerId'] || req.params['id'];
            if (!customerId) {
                res.status(400).json({
                    success: false,
                    message: 'Customer ID required',
                    code: 'CUSTOMER_ID_REQUIRED',
                });
            }
            if (req.user.customerId !== customerId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied to customer data',
                    code: 'CUSTOMER_ACCESS_DENIED',
                });
            }
        }
        next();
    }
    static optionalAuth(req, _res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
            if (decoded.id && decoded.email && decoded.role) {
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role,
                    customerId: decoded.customerId,
                };
            }
        }
        catch (error) {
            AuthMiddleware.logger.debug('Optional auth token verification failed', { error: error.message });
        }
        next();
    }
    static requireVerifiedCustomer(req, res, next) {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }
        if (req.user.role !== 'CUSTOMER') {
            res.status(403).json({
                success: false,
                message: 'Customer access required',
                code: 'CUSTOMER_ACCESS_REQUIRED',
            });
        }
        next();
    }
}
exports.AuthMiddleware = AuthMiddleware;
AuthMiddleware.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');
exports.default = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map