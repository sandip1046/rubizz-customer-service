import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '@shared/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    customerId?: string;
  };
}

export class AuthMiddleware {
  // Verify JWT token
  static async verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access token required',
          code: 'MISSING_TOKEN',
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        
        // Validate token structure
        if (!decoded.id || !decoded.email || !decoded.role) {
          return res.status(401).json({
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

        logger.debug('Token verified successfully', { userId: decoded.id, role: decoded.role });
        next();
      } catch (jwtError) {
        logger.warn('Token verification failed', { error: jwtError.message });
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        });
      }
    } catch (error) {
      logger.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        code: 'AUTH_ERROR',
      });
    }
  }

  // Check if user is customer
  static requireCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({
        success: false,
        message: 'Customer access required',
        code: 'CUSTOMER_ACCESS_REQUIRED',
      });
    }

    next();
  }

  // Check if user is admin
  static requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED',
      });
    }

    next();
  }

  // Check if user is super admin
  static requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required',
        code: 'SUPER_ADMIN_ACCESS_REQUIRED',
      });
    }

    next();
  }

  // Check if user can access customer data
  static canAccessCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Admin and super admin can access any customer data
    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return next();
    }

    // Customer can only access their own data
    if (req.user.role === 'CUSTOMER') {
      const customerId = req.params.customerId || req.params.id;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'Customer ID required',
          code: 'CUSTOMER_ID_REQUIRED',
        });
      }

      if (req.user.customerId !== customerId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to customer data',
          code: 'CUSTOMER_ACCESS_DENIED',
        });
      }
    }

    next();
  }

  // Optional authentication (doesn't fail if no token)
  static optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

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
      logger.debug('Optional auth token verification failed', { error: error.message });
    }

    next();
  }

  // Check if customer is verified
  static requireVerifiedCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({
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
