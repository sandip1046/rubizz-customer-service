"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../config/config");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class RateLimitMiddleware {
}
exports.RateLimitMiddleware = RateLimitMiddleware;
RateLimitMiddleware.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');
RateLimitMiddleware.general = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.maxRequests,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
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
RateLimitMiddleware.strict = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many sensitive requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
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
RateLimitMiddleware.auth = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
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
RateLimitMiddleware.passwordReset = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later',
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
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
RateLimitMiddleware.emailVerification = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'Too many email verification attempts, please try again later',
        code: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
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
RateLimitMiddleware.customerCreation = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many customer registrations, please try again later',
        code: 'CUSTOMER_CREATION_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
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
RateLimitMiddleware.profileUpdate = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many profile updates, please try again later',
        code: 'PROFILE_UPDATE_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
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
RateLimitMiddleware.search = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Too many search requests, please try again later',
        code: 'SEARCH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
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
exports.default = RateLimitMiddleware;
//# sourceMappingURL=RateLimitMiddleware.js.map