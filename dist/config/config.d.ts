export declare const config: {
    port: number;
    nodeEnv: string;
    serviceName: string;
    database: {
        url: string;
    };
    redisService: {
        url: string;
        timeout: number;
        retries: number;
        retryDelay: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    email: {
        smtp: {
            host: string;
            port: number;
            user: string;
            pass: string;
        };
        from: {
            email: string;
            name: string;
        };
    };
    services: {
        apiGateway: string;
        auth: string;
        user: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    upload: {
        maxFileSize: number;
        uploadPath: string;
        allowedTypes: string[];
    };
    logging: {
        level: string;
        filePath: string;
    };
    customer: {
        verificationRequired: boolean;
        profileImageRequired: boolean;
        defaultAvatarUrl: string;
    };
    notifications: {
        email: boolean;
        sms: boolean;
        smsApiKey: string;
        smsApiSecret: string;
    };
    security: {
        bcryptRounds: number;
        sessionSecret: string;
        corsOrigin: string;
    };
    monitoring: {
        enableMetrics: boolean;
        metricsPort: number;
        healthCheckInterval: number;
    };
    grpc: {
        port: number;
        host: string;
        maxReceiveMessageLength: number;
        maxSendMessageLength: number;
        keepaliveTime: number;
        keepaliveTimeout: number;
        keepalivePermitWithoutCalls: boolean;
    };
    graphql: {
        introspection: boolean;
        playground: boolean;
        tracing: boolean;
        caching: boolean;
    };
    websocket: {
        enabled: boolean;
        path: string;
        pingInterval: number;
        pongTimeout: number;
    };
    kafka: {
        enabled: boolean;
        brokers: string[];
        clientId: string;
        groupId: string;
        retryAttempts: number;
        retryDelay: number;
        sessionTimeout: number;
        heartbeatInterval: number;
        topics: {
            events: string;
            notifications: string;
            analytics: string;
        };
    };
    cors: {
        origins: string[];
        credentials: boolean;
    };
};
export default config;
//# sourceMappingURL=config.d.ts.map