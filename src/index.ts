import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { config } from './config/config';
import DatabaseConnection from './database/DatabaseConnection';
import RedisService from './services/RedisService';
import { ErrorHandler } from './middleware/ErrorHandler';
import { RateLimitMiddleware } from './middleware/RateLimitMiddleware';
import HealthController from './controllers/HealthController';
import CustomerController from './controllers/CustomerController';
import { Logger } from '@sandip1046/rubizz-shared-libs';
import GrpcServer from './grpc/GrpcServer';
import GraphQLServer from './graphql/GraphQLServer';
import KafkaService from './kafka/KafkaService';

class CustomerServiceApp {
  private app: express.Application;
  private httpServer: any;
  private dbConnection: DatabaseConnection;
  private redisService: RedisService;
  private grpcServer!: GrpcServer;
  private graphqlServer!: GraphQLServer;
  private kafkaService!: KafkaService;
  private customerController!: CustomerController;
  private healthController!: HealthController;
  private logger: Logger;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.dbConnection = DatabaseConnection.getInstance();
    this.redisService = new RedisService();
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
    
    this.initializeMiddlewares();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet({
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

    // CORS middleware
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Rate limiting
    this.app.use(RateLimitMiddleware.general);

    // Request logging
    this.app.use((req, res, next) => {
      req.requestId = req.headers['x-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  private async initializeServices(): Promise<void> {
    try {
      // Initialize controllers
      this.healthController = new HealthController();
      this.customerController = new CustomerController();

      // Initialize Kafka service if enabled
      if (config.kafka.enabled) {
        this.kafkaService = new KafkaService();
        await this.kafkaService.initialize();
        this.logger.info('Kafka service initialized successfully');
      }

      // Initialize gRPC server
      this.grpcServer = new GrpcServer(this.customerController, this.healthController);
      await this.grpcServer.initialize();
      this.logger.info('gRPC server initialized successfully');

      // Initialize GraphQL server
      this.graphqlServer = new GraphQLServer(this.customerController, this.healthController, this.httpServer);
      await this.graphqlServer.start();
      this.logger.info('GraphQL server initialized successfully');

      this.logger.info('All services initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize services', error as Error);
      throw error;
    }
  }

  private initializeRoutes() {
    // Health check routes
    this.app.get('/health', this.healthController.healthCheck);
    this.app.get('/health/detailed', this.healthController.detailedHealthCheck);
    this.app.get('/health/ready', this.healthController.readinessCheck);
    this.app.get('/health/live', this.healthController.livenessCheck);
    this.app.get('/metrics', this.healthController.metrics);

    // GraphQL endpoint
    this.app.use('/graphql', this.graphqlServer.getMiddleware());

    // API routes
    this.app.use('/api/v1', this.createApiRoutes(this.customerController));

    // Root route
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
          grpc: `gRPC on port ${config.grpc.port}`,
          websocket: 'WebSocket for real-time subscriptions',
          kafka: config.kafka.enabled ? 'Kafka event streaming' : 'disabled',
        },
      });
    });

    // 404 handler
    this.app.use(ErrorHandler.notFound);
  }

  private createApiRoutes(customerController: CustomerController) {
    const router = express.Router();

    // Customer routes
    router.post('/customers', 
      RateLimitMiddleware.customerCreation,
      customerController.createCustomer
    );

    router.get('/customers/search', 
      RateLimitMiddleware.search,
      customerController.searchCustomers
    );

    router.get('/customers/stats', 
      customerController.getCustomerStats
    );

    router.get('/customers/email', 
      customerController.getCustomerByEmail
    );

    router.get('/customers/:customerId', 
      customerController.getCustomerById
    );

    router.put('/customers/:customerId', 
      RateLimitMiddleware.profileUpdate,
      customerController.updateCustomer
    );

    router.delete('/customers/:customerId', 
      customerController.deleteCustomer
    );

    // Customer profile routes
    router.put('/customers/:customerId/profile', 
      RateLimitMiddleware.profileUpdate,
      customerController.updateCustomerProfile
    );

    router.put('/customers/:customerId/preferences', 
      RateLimitMiddleware.profileUpdate,
      customerController.updateCustomerPreferences
    );

    // Customer address routes
    router.post('/customers/:customerId/addresses', 
      customerController.addCustomerAddress
    );

    router.get('/customers/:customerId/addresses', 
      customerController.getCustomerAddresses
    );

    router.put('/addresses/:addressId', 
      customerController.updateCustomerAddress
    );

    router.delete('/addresses/:addressId', 
      customerController.deleteCustomerAddress
    );

    // Customer verification routes
    router.post('/customers/:customerId/verify', 
      customerController.verifyCustomer
    );

    router.post('/customers/:customerId/last-login', 
      customerController.updateLastLogin
    );

    return router;
  }

  private initializeErrorHandling() {
    // Global error handler
    this.app.use(ErrorHandler.handle);
  }

  public async start() {
    try {
      // Connect to database
      await this.dbConnection.connect();
      this.logger.info('Database connected successfully');

      // Connect to Redis Service
      await this.redisService.connect();
      this.logger.info('Redis Service connected successfully');

      // Initialize all services (gRPC, GraphQL, Kafka)
      await this.initializeServices();

      // Setup routes after services are initialized
      this.initializeRoutes();

      // Start HTTP server
      this.httpServer.listen(config.port, () => {
        this.logger.info(`Customer service started on port ${config.port}`, {
          port: config.port,
          environment: config.nodeEnv,
          service: config.serviceName,
          protocols: {
            rest: `http://localhost:${config.port}/api/v1`,
            graphql: `http://localhost:${config.port}/graphql`,
            websocket: `ws://localhost:${config.port}/graphql-ws`,
            grpc: `localhost:${config.grpc.port}`,
            kafka: config.kafka.enabled ? 'enabled' : 'disabled',
          },
        });
      });

      // Start gRPC server
      await this.grpcServer.start();

      // Graceful shutdown handlers
      this.setupGracefulShutdown();
    } catch (error) {
      this.logger.error('Failed to start customer service:', error as Error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown() {
    const gracefulShutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}, shutting down gracefully...`);

      try {
        // Stop gRPC server
        if (this.grpcServer) {
          await this.grpcServer.stop();
          this.logger.info('gRPC server stopped successfully');
        }

        // Stop GraphQL server
        if (this.graphqlServer) {
          await this.graphqlServer.stop();
          this.logger.info('GraphQL server stopped successfully');
        }

        // Disconnect Kafka service
        if (this.kafkaService) {
          await this.kafkaService.disconnect();
          this.logger.info('Kafka service disconnected successfully');
        }

        // Close HTTP server
        if (this.httpServer) {
          this.httpServer.close(() => {
            this.logger.info('HTTP server closed successfully');
          });
        }

        // Close database connection
        await this.dbConnection.disconnect();
        this.logger.info('Database disconnected successfully');

        // Close Redis Service connection
        await this.redisService.disconnect();
        this.logger.info('Redis Service disconnected successfully');

        this.logger.info('Customer service shut down successfully');
        process.exit(0);
      } catch (error) {
        this.logger.error('Error during graceful shutdown:', error as Error);
        process.exit(1);
      }
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception:', error as Error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, _promise) => {
      this.logger.error('Unhandled Rejection:', reason as Error);
      gracefulShutdown('unhandledRejection');
    });
  }
}

// Start the application
const app = new CustomerServiceApp();
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

export default CustomerServiceApp;
