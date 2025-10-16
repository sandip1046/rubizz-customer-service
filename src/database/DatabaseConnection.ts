import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';
import { Logger } from '@sandip1046/rubizz-shared-libs';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private prisma: PrismaClient;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url,
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Log database connection
    this.logger.info('Database connection initialized');
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.logger.info('Database connected successfully');
    } catch (error) {
      this.logger.error('Database connection failed:', error as Error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.logger.info('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Database disconnection failed:', error as Error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // For MongoDB, we can use a simple findFirst operation to check connection
      await this.prisma.customer.findFirst();
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error as Error);
      return false;
    }
  }
}

export default DatabaseConnection;
