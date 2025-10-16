import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { Logger } from '@sandip1046/rubizz-shared-libs';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    customerId?: string;
  };
}

export class AuthMiddleware {
  private static logger = Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');

  // Verify JWT token
  static async verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access token required',
          code: 'MISSING_TOKEN',
        });
      }

      const token = authHeader!.substring(7); // Remove 'Bearer ' prefix

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        
        // Validate token structure
        if (!decoded.id || !decoded.email || !decoded.role) {
          res.status(401).json({
            success: false,
            message: 'Invalid token structure',
            code: 'INVALID_TOKEN',
          });
        }

        // Set user information in request
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          customerId: decoded.customerId,
        };

        AuthMiddleware.logger.debug('Token verified successfully', { userId: decoded.id, role: decoded.role });
        next();
      } catch (jwtError) {
        AuthMiddleware.logger.warn('Token verification failed', { error: (jwtError as Error).message });
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        });
      }
    } catch (error) {
      AuthMiddleware.logger.error('Auth middleware error:', error as Error);
        res.status(500).json({
        success: false,
        message: 'Authentication error',
        code: 'AUTH_ERROR',
      });
    }
  }

  // Check if user is customer
  static requireCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (req.user!.role !== 'CUSTOMER') {
      res.status(403).json({
        success: false,
        message: 'Customer access required',
        code: 'CUSTOMER_ACCESS_REQUIRED',
      });
    }

    next();
  }

  // Check if user is admin
  static requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED',
      });
    }

    next();
  }

  // Check if user is super admin
  static requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (req.user!.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Super admin access required',
        code: 'SUPER_ADMIN_ACCESS_REQUIRED',
      });
    }

    next();
  }

  // Check if user can access customer data
  static canAccessCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Admin and super admin can access any customer data
    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      next();
    }

    // Customer can only access their own data
    if (req.user!.role === 'CUSTOMER') {
      const customerId = req.params['customerId'] || req.params['id'];
      
      if (!customerId) {
        res.status(400).json({
          success: false,
          message: 'Customer ID required',
          code: 'CUSTOMER_ID_REQUIRED',
        });
      }

      if (req.user!.customerId !== customerId) {
        res.status(403).json({
          success: false,
          message: 'Access denied to customer data',
          code: 'CUSTOMER_ACCESS_DENIED',
        });
      }
    }

    next();
  }

  // Optional authentication (doesn't fail if no token)
  static optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
    }

    const token = authHeader!.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      if (decoded.id && decoded.email && decoded.role) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          customerId: decoded.customerId,
        };
      }
    } catch (error) {
      // Ignore token errors for optional auth
      AuthMiddleware.logger.debug('Optional auth token verification failed', { error: (error as Error).message });
    }

    next();
  }

  // Check if customer is verified
  static requireVerifiedCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (req.user!.role !== 'CUSTOMER') {
      res.status(403).json({
        success: false,
        message: 'Customer access required',
        code: 'CUSTOMER_ACCESS_REQUIRED',
      });
    }

    // Note: Customer verification status should be checked against the database
    // This is a placeholder - implement actual verification check
    next();
  }
}

export default AuthMiddleware;
