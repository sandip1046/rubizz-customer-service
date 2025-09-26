import { Request, Response } from 'express';
import DatabaseConnection from '../database/DatabaseConnection';
import RedisConnection from '../database/RedisConnection';
import { logger } from '@shared/logger';

export class HealthController {
  private dbConnection: DatabaseConnection;
  private redisConnection: RedisConnection;

  constructor() {
    this.dbConnection = DatabaseConnection.getInstance();
    this.redisConnection = RedisConnection.getInstance();
  }

  // Basic health check
  public healthCheck = async (req: Request, res: Response) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Customer service is healthy',
        timestamp: new Date().toISOString(),
        service: 'rubizz-customer-service',
        version: '1.0.0',
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Detailed health check with dependencies
  public detailedHealthCheck = async (req: Request, res: Response) => {
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
            error: null,
          },
          redis: {
            status: 'unknown',
            responseTime: 0,
            error: null,
          },
        },
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
        },
        environment: process.env.NODE_ENV || 'development',
      };

      // Check database connection
      const dbStartTime = Date.now();
      try {
        const dbHealthy = await this.dbConnection.healthCheck();
        const dbResponseTime = Date.now() - dbStartTime;
        
        healthStatus.dependencies.database = {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          responseTime: dbResponseTime,
          error: null,
        };
      } catch (error) {
        const dbResponseTime = Date.now() - dbStartTime;
        healthStatus.dependencies.database = {
          status: 'unhealthy',
          responseTime: dbResponseTime,
          error: error.message,
        };
      }

      // Check Redis connection
      const redisStartTime = Date.now();
      try {
        const redisHealthy = await this.redisConnection.healthCheck();
        const redisResponseTime = Date.now() - redisStartTime;
        
        healthStatus.dependencies.redis = {
          status: redisHealthy ? 'healthy' : 'unhealthy',
          responseTime: redisResponseTime,
          error: null,
        };
      } catch (error) {
        const redisResponseTime = Date.now() - redisStartTime;
        healthStatus.dependencies.redis = {
          status: 'unhealthy',
          responseTime: redisResponseTime,
          error: error.message,
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
      logger.error('Detailed health check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  };

  // Readiness check (for Kubernetes)
  public readinessCheck = async (req: Request, res: Response) => {
    try {
      const dbHealthy = await this.dbConnection.healthCheck();
      const redisHealthy = await this.redisConnection.healthCheck();

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
      logger.error('Readiness check failed:', error);
      res.status(503).json({
        success: false,
        message: 'Service is not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  };

  // Liveness check (for Kubernetes)
  public livenessCheck = async (req: Request, res: Response) => {
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
      logger.error('Liveness check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Service is not alive',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  };

  // Metrics endpoint
  public metrics = async (req: Request, res: Response) => {
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
        environment: process.env.NODE_ENV || 'development',
      };

      res.status(200).json(metrics);
    } catch (error) {
      logger.error('Metrics endpoint failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve metrics',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  };
}

export default HealthController;
