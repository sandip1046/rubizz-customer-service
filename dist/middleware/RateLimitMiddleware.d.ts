export declare class RateLimitMiddleware {
    private static logger;
    static general: import("express-rate-limit").RateLimitRequestHandler;
    static strict: import("express-rate-limit").RateLimitRequestHandler;
    static auth: import("express-rate-limit").RateLimitRequestHandler;
    static passwordReset: import("express-rate-limit").RateLimitRequestHandler;
    static emailVerification: import("express-rate-limit").RateLimitRequestHandler;
    static customerCreation: import("express-rate-limit").RateLimitRequestHandler;
    static profileUpdate: import("express-rate-limit").RateLimitRequestHandler;
    static search: import("express-rate-limit").RateLimitRequestHandler;
}
export default RateLimitMiddleware;
//# sourceMappingURL=RateLimitMiddleware.d.ts.map