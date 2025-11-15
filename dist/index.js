"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const config_1 = require("./config/config");
const DatabaseConnection_1 = __importDefault(require("./database/DatabaseConnection"));
const RedisService_1 = __importDefault(require("./services/RedisService"));
const ErrorHandler_1 = require("./middleware/ErrorHandler");
const RateLimitMiddleware_1 = require("./middleware/RateLimitMiddleware");
const HealthController_1 = __importDefault(require("./controllers/HealthController"));
const CustomerController_1 = __importDefault(require("./controllers/CustomerController"));
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
const GrpcServer_1 = __importDefault(require("./grpc/GrpcServer"));
const GraphQLServer_1 = __importDefault(require("./graphql/GraphQLServer"));
const KafkaService_1 = __importDefault(require("./kafka/KafkaService"));
const CustomerBusinessService_1 = require("./services/CustomerBusinessService");
const WebSocketServer_1 = __importDefault(require("./websocket/WebSocketServer"));
class CustomerServiceApp {
    constructor() {
        this.app = (0, express_1.default)();
        this.httpServer = (0, http_1.createServer)(this.app);
        this.dbConnection = DatabaseConnection_1.default.getInstance();
        this.redisService = new RedisService_1.default();
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        this.initializeMiddlewares();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
            crossOriginEmbedderPolicy: false
        }));
        this.app.use((0, cors_1.default)({
            origin: config_1.config.cors.origins,
            credentials: config_1.config.cors.credentials,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        }));
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        if (config_1.config.nodeEnv === 'development') {
            this.app.use((0, morgan_1.default)('dev'));
        }
        else {
            this.app.use((0, morgan_1.default)('combined'));
        }
        this.app.use(RateLimitMiddleware_1.RateLimitMiddleware.general);
        this.app.use((req, res, next) => {
            req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            res.setHeader('X-Request-ID', req.requestId);
            this.logger.info('Incoming request', {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req.requestId,
            });
            next();
        });
    }
    async initializeServices() {
        try {
            this.healthController = new HealthController_1.default();
            if (config_1.config.kafka.enabled) {
                this.kafkaService = new KafkaService_1.default();
                await this.kafkaService.initialize();
                this.logger.info('Kafka service initialized successfully');
            }
            this.customerBusinessService = new CustomerBusinessService_1.CustomerBusinessService(this.kafkaService);
            this.customerController = new CustomerController_1.default(this.customerBusinessService);
            this.websocketServer = new WebSocketServer_1.default(this.httpServer, this.customerBusinessService);
            this.logger.info('WebSocket server initialized successfully');
            this.grpcServer = new GrpcServer_1.default(this.customerController, this.healthController);
            await this.grpcServer.initialize();
            this.logger.info('gRPC server initialized successfully');
            this.graphqlServer = new GraphQLServer_1.default(this.customerController, this.healthController, this.httpServer);
            await this.graphqlServer.start();
            this.logger.info('GraphQL server initialized successfully');
            this.logger.info('All services initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize services', error);
            throw error;
        }
    }
    initializeRoutes() {
        this.app.get('/health', this.healthController.healthCheck);
        this.app.get('/health/detailed', this.healthController.detailedHealthCheck);
        this.app.get('/health/ready', this.healthController.readinessCheck);
        this.app.get('/health/live', this.healthController.livenessCheck);
        this.app.get('/metrics', this.healthController.metrics);
        this.app.use('/graphql', this.graphqlServer.getMiddleware());
        this.app.use('/api/v1', this.createApiRoutes(this.customerController));
        this.app.get('/', (_req, res) => {
            res.json({
                success: true,
                message: 'Rubizz Customer Service API',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                endpoints: {
                    health: '/health',
                    api: '/api/v1',
                    graphql: '/graphql',
                    websocket: '/graphql-ws',
                },
                protocols: {
                    rest: 'HTTP/REST API',
                    graphql: 'GraphQL API with subscriptions',
                    grpc: `gRPC on port ${config_1.config.grpc.port}`,
                    websocket: 'WebSocket for real-time subscriptions',
                    kafka: config_1.config.kafka.enabled ? 'Kafka event streaming' : 'disabled',
                },
            });
        });
        this.app.use(ErrorHandler_1.ErrorHandler.notFound);
    }
    createApiRoutes(customerController) {
        const router = express_1.default.Router();
        router.post('/customers', RateLimitMiddleware_1.RateLimitMiddleware.customerCreation, customerController.createCustomer);
        router.get('/customers/search', RateLimitMiddleware_1.RateLimitMiddleware.search, customerController.searchCustomers);
        router.get('/customers/stats', customerController.getCustomerStats);
        router.get('/customers/email', customerController.getCustomerByEmail);
        router.get('/customers/:customerId', customerController.getCustomerById);
        router.put('/customers/:customerId', RateLimitMiddleware_1.RateLimitMiddleware.profileUpdate, customerController.updateCustomer);
        router.delete('/customers/:customerId', customerController.deleteCustomer);
        router.put('/customers/:customerId/profile', RateLimitMiddleware_1.RateLimitMiddleware.profileUpdate, customerController.updateCustomerProfile);
        router.put('/customers/:customerId/preferences', RateLimitMiddleware_1.RateLimitMiddleware.profileUpdate, customerController.updateCustomerPreferences);
        router.post('/customers/:customerId/addresses', customerController.addCustomerAddress);
        router.get('/customers/:customerId/addresses', customerController.getCustomerAddresses);
        router.put('/addresses/:addressId', customerController.updateCustomerAddress);
        router.delete('/addresses/:addressId', customerController.deleteCustomerAddress);
        router.post('/customers/:customerId/verify', customerController.verifyCustomer);
        router.post('/customers/:customerId/last-login', customerController.updateLastLogin);
        return router;
    }
    initializeErrorHandling() {
        this.app.use(ErrorHandler_1.ErrorHandler.handle);
    }
    async start() {
        try {
            await this.dbConnection.connect();
            this.logger.info('Database connected successfully');
            await this.redisService.connect();
            this.logger.info('Redis Service connected successfully');
            await this.initializeServices();
            this.initializeRoutes();
            this.httpServer.listen(config_1.config.port, () => {
                this.logger.info(`Customer service started on port ${config_1.config.port}`, {
                    port: config_1.config.port,
                    environment: config_1.config.nodeEnv,
                    service: config_1.config.serviceName,
                    protocols: {
                        rest: `http://localhost:${config_1.config.port}/api/v1`,
                        graphql: `http://localhost:${config_1.config.port}/graphql`,
                        websocket: `ws://localhost:${config_1.config.port}/graphql-ws`,
                        grpc: `localhost:${config_1.config.grpc.port}`,
                        kafka: config_1.config.kafka.enabled ? 'enabled' : 'disabled',
                    },
                });
            });
            await this.grpcServer.start();
            this.setupGracefulShutdown();
        }
        catch (error) {
            this.logger.error('Failed to start customer service:', error);
            process.exit(1);
        }
    }
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            this.logger.info(`Received ${signal}, shutting down gracefully...`);
            try {
                if (this.grpcServer) {
                    await this.grpcServer.stop();
                    this.logger.info('gRPC server stopped successfully');
                }
                if (this.graphqlServer) {
                    await this.graphqlServer.stop();
                    this.logger.info('GraphQL server stopped successfully');
                }
                if (this.websocketServer) {
                    this.websocketServer.stop();
                    this.logger.info('WebSocket server stopped successfully');
                }
                if (this.kafkaService) {
                    await this.kafkaService.disconnect();
                    this.logger.info('Kafka service disconnected successfully');
                }
                if (this.httpServer) {
                    this.httpServer.close(() => {
                        this.logger.info('HTTP server closed successfully');
                    });
                }
                await this.dbConnection.disconnect();
                this.logger.info('Database disconnected successfully');
                await this.redisService.disconnect();
                this.logger.info('Redis Service disconnected successfully');
                this.logger.info('Customer service shut down successfully');
                process.exit(0);
            }
            catch (error) {
                this.logger.error('Error during graceful shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason, _promise) => {
            this.logger.error('Unhandled Rejection:', reason);
            gracefulShutdown('unhandledRejection');
        });
    }
}
const app = new CustomerServiceApp();
app.start().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
exports.default = CustomerServiceApp;
//# sourceMappingURL=index.js.map