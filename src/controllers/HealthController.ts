import { Request, Response } from 'express';
import DatabaseConnection from '../database/DatabaseConnection';
import RedisService from '../services/RedisService';
import { Logger } from '@sandip1046/rubizz-shared-libs';

export class HealthController {
  private dbConnection: DatabaseConnection;
  private redisService: RedisService;
  private logger: Logger;

  constructor() {
    this.dbConnection = DatabaseConnection.getInstance();
    this.redisService = new RedisService();
    this.logger = Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');
  }

  // Basic health check
  public healthCheck = async (_req: Request, res: Response) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Customer service is healthy',
        timestamp: new Date().toISOString(),
        service: 'rubizz-customer-service',
        version: '1.0.0',
      });
    } catch (error) {
      this.logger.error('Health check failed:', error as Error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Detailed health check with dependencies
  public detailedHealthCheck = async (_req: Request, res: Response) => {
    try {
      const healthStatus = {
        success: true,
        message: 'Customer service is healthy',
        timestamp: new Date().toISOString(),
        service: 'rubizz-customer-service',
        version: '1.0.0',
        dependencies: {
          database: {
            status: 'unknown',
            responseTime: 0,
            error: null as string | null,
          },
          redis: {
            status: 'unknown',
            responseTime: 0,
            error: null as string | null,
          },
        },
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
        },
        environment: process.env['NODE_ENV'] || 'development',
      };

      // Check database connection
      const dbStartTime = Date.now();
      try {
        const dbHealthy = await this.dbConnection.healthCheck();
        const dbResponseTime = Date.now() - dbStartTime;
        
        healthStatus.dependencies.database = {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          responseTime: dbResponseTime,
          error: null as string | null,
        };
      } catch (error) {
        const dbResponseTime = Date.now() - dbStartTime;
        healthStatus.dependencies.database = {
          status: 'unhealthy',
          responseTime: dbResponseTime,
          error: (error as Error).message || 'Unknown error',
        };
      }

      // Check Redis Service connection
      const redisStartTime = Date.now();
      try {
        const redisHealth = await this.redisService.healthCheck();
        const redisResponseTime = Date.now() - redisStartTime;
        
        healthStatus.dependencies.redis = {
          status: redisHealth.session && redisHealth.cache && redisHealth.queue ? 'healthy' : 'unhealthy',
          responseTime: redisResponseTime,
          error: null as string | null,
        };
      } catch (error) {
        const redisResponseTime = Date.now() - redisStartTime;
        healthStatus.dependencies.redis = {
          status: 'unhealthy',
          responseTime: redisResponseTime,
          error: (error as Error).message || 'Unknown error',
        };
      }

      // Determine overall health status
      const allDependenciesHealthy = 
        healthStatus.dependencies.database.status === 'healthy' &&
        healthStatus.dependencies.redis.status === 'healthy';

      if (!allDependenciesHealthy) {
        healthStatus.success = false;
        healthStatus.message = 'Service has unhealthy dependencies';
      }

      const statusCode = allDependenciesHealthy ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      this.logger.error('Detailed health check failed:', error as Error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: (error as Error).message || 'Unknown error' || null,
      });
    }
  };

  // Readiness check (for Kubernetes)
  public readinessCheck = async (_req: Request, res: Response) => {
    try {
      const dbHealthy = await this.dbConnection.healthCheck();
      const redisHealthy = await this.redisService.healthCheck();

      if (dbHealthy && redisHealthy) {
        res.status(200).json({
          success: true,
          message: 'Service is ready',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          success: false,
          message: 'Service is not ready',
          timestamp: new Date().toISOString(),
          dependencies: {
            database: dbHealthy ? 'ready' : 'not ready',
            redis: redisHealthy ? 'ready' : 'not ready',
          },
        });
      }
    } catch (error) {
      this.logger.error('Readiness check failed:', error as Error);
      res.status(503).json({
        success: false,
        message: 'Service is not ready',
        timestamp: new Date().toISOString(),
        error: (error as Error).message || 'Unknown error' || null,
      });
    }
  };

  // Liveness check (for Kubernetes)
  public livenessCheck = async (_req: Request, res: Response) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Service is alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
        },
      });
    } catch (error) {
      this.logger.error('Liveness check failed:', error as Error);
      res.status(500).json({
        success: false,
        message: 'Service is not alive',
        timestamp: new Date().toISOString(),
        error: (error as Error).message || 'Unknown error' || null,
      });
    }
  };

  // Metrics endpoint
  public metrics = async (_req: Request, res: Response) => {
    try {
      const metrics = {
        service: 'rubizz-customer-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          rss: process.memoryUsage().rss,
        },
        cpu: {
          usage: process.cpuUsage(),
        },
        process: {
          pid: process.pid,
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        environment: process.env['NODE_ENV'] || 'development',
      };

      res.status(200).json(metrics);
    } catch (error) {
      this.logger.error('Metrics endpoint failed:', error as Error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve metrics',
        timestamp: new Date().toISOString(),
        error: (error as Error).message || 'Unknown error' || null,
      });
    }
  };

  // GraphQL-specific method
  public async getHealthStatus() {
    try {
      const dbHealthy = await this.dbConnection.healthCheck();
      const redisHealthy = await this.redisService.healthCheck();

      return {
        status: dbHealthy && redisHealthy ? 'healthy' : 'unhealthy',
        message: dbHealthy && redisHealthy ? 'Service is healthy' : 'Service is unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbHealthy,
        redis: redisHealthy,
        services: {
          database: dbHealthy ? 'connected' : 'disconnected',
          redis: redisHealthy ? 'connected' : 'disconnected',
        },
      };
    } catch (error) {
      this.logger.error('Failed to get health status:', error as Error);
      throw error;
    }
  }

  // gRPC-specific method
  public async healthCheckGrpc(_call: any, callback: any) {
    try {
      const health = await this.getHealthStatus();
      callback(null, {
        status: health.status === 'healthy' ? 'healthy' : 'unhealthy',
        message: health.message || 'Service is running',
        timestamp: health.timestamp,
        uptime: health.uptime,
        database: health.database,
        redis: health.redis,
        services: health.services,
      });
    } catch (error) {
      this.logger.error('Failed to get health status via gRPC:', error as Error);
      callback({
        code: 500,
        message: 'Failed to get health status',
      });
    }
  }
}

export default HealthController;
