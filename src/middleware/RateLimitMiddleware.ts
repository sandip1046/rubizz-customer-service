import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/config';
import { Logger } from '@sandip1046/rubizz-shared-libs';

export class RateLimitMiddleware {
  private static logger = Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');

  // General rate limiter
  static general = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      RateLimitMiddleware.logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    },
  });

  // Strict rate limiter for sensitive operations
  static strict = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
      success: false,
      message: 'Too many sensitive requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      RateLimitMiddleware.logger.warn('Strict rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many sensitive requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    },
  });

  // Auth rate limiter
  static auth = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per window
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req: Request, res: Response) => {
      RateLimitMiddleware.logger.warn('Auth rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts, please try again later',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
      });
    },
  });

  // Password reset rate limiter
  static passwordReset = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: {
      success: false,
      message: 'Too many password reset attempts, please try again later',
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      RateLimitMiddleware.logger.warn('Password reset rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many password reset attempts, please try again later',
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
      });
    },
  });

  // Email verification rate limiter
  static emailVerification = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 email verification attempts per 5 minutes
    message: {
      success: false,
      message: 'Too many email verification attempts, please try again later',
      code: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      RateLimitMiddleware.logger.warn('Email verification rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many email verification attempts, please try again later',
        code: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED',
      });
    },
  });

  // Customer creation rate limiter
  static customerCreation = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 customer registrations per hour per IP
    message: {
      success: false,
      message: 'Too many customer registrations, please try again later',
      code: 'CUSTOMER_CREATION_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      RateLimitMiddleware.logger.warn('Customer creation rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many customer registrations, please try again later',
        code: 'CUSTOMER_CREATION_RATE_LIMIT_EXCEEDED',
      });
    },
  });

  // Profile update rate limiter
  static profileUpdate = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 profile updates per 15 minutes
    message: {
      success: false,
      message: 'Too many profile updates, please try again later',
      code: 'PROFILE_UPDATE_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      RateLimitMiddleware.logger.warn('Profile update rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many profile updates, please try again later',
        code: 'PROFILE_UPDATE_RATE_LIMIT_EXCEEDED',
      });
    },
  });

  // Search rate limiter
  static search = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 search requests per minute
    message: {
      success: false,
      message: 'Too many search requests, please try again later',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      RateLimitMiddleware.logger.warn('Search rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many search requests, please try again later',
        code: 'SEARCH_RATE_LIMIT_EXCEEDED',
      });
    },
  });
}

export default RateLimitMiddleware;
