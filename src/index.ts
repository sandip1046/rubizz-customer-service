import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config';
import DatabaseConnection from './database/DatabaseConnection';
import RedisConnection from './database/RedisConnection';
import { ErrorHandler } from './middleware/ErrorHandler';
import { RateLimitMiddleware } from './middleware/RateLimitMiddleware';
import HealthController from './controllers/HealthController';
import CustomerController from './controllers/CustomerController';
import { logger } from '@shared/logger';

class CustomerServiceApp {
  private app: express.Application;
  private dbConnection: DatabaseConnection;
  private redisConnection: RedisConnection;

  constructor() {
    this.app = express();
    this.dbConnection = DatabaseConnection.getInstance();
    this.redisConnection = RedisConnection.getInstance();
    
    this.initializeMiddlewares();
    this.initializeRoutes();
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
    }));

    // CORS middleware
    this.app.use(cors({
      origin: config.security.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

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
      logger.info('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next();
    });
  }

  private initializeRoutes() {
    // Initialize controllers
    const healthController = new HealthController();
    const customerController = new CustomerController();

    // Health check routes
    this.app.get('/health', healthController.healthCheck);
    this.app.get('/health/detailed', healthController.detailedHealthCheck);
    this.app.get('/health/ready', healthController.readinessCheck);
    this.app.get('/health/live', healthController.livenessCheck);
    this.app.get('/metrics', healthController.metrics);

    // API routes
    this.app.use('/api/v1', this.createApiRoutes(customerController));

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Rubizz Customer Service API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          api: '/api/v1',
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
      logger.info('Database connected successfully');

      // Connect to Redis
      await this.redisConnection.connect();
      logger.info('Redis connected successfully');

      // Start server
      this.app.listen(config.port, () => {
        logger.info(`Customer service started on port ${config.port}`, {
          port: config.port,
          environment: config.nodeEnv,
          service: config.serviceName,
        });
      });

      // Graceful shutdown handlers
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start customer service:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown() {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      try {
        // Close database connection
        await this.dbConnection.disconnect();
        logger.info('Database disconnected successfully');

        // Close Redis connection
        await this.redisConnection.disconnect();
        logger.info('Redis disconnected successfully');

        logger.info('Customer service shut down successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }
}

// Start the application
const app = new CustomerServiceApp();
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default CustomerServiceApp;
