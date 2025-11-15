import mongoose from 'mongoose';
import { config } from '../config/config';
import { Logger } from '@sandip1046/rubizz-shared-libs';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private logger: Logger;
  private isConnected: boolean = false;

  private constructor() {
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
    
    // Set up mongoose connection events
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.logger.info('MongoDB connection established');
    });

    mongoose.connection.on('error', (error: Error) => {
      this.isConnected = false;
      this.logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      this.logger.warn('MongoDB disconnected');
    });

    // Log database connection initialization
    this.logger.info('Database connection initialized');
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getMongoose(): typeof mongoose {
    return mongoose;
  }

  public async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        this.logger.info('Database already connected');
        return;
      }

      const connectionOptions = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(config.database.url, connectionOptions);
      this.isConnected = true;
      this.logger.info('Database connected successfully', {
        url: config.database.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Mask credentials
      });
    } catch (error) {
      this.isConnected = false;
      this.logger.error('Database connection failed:', error as Error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (!this.isConnected) {
        this.logger.info('Database already disconnected');
        return;
      }

      await mongoose.disconnect();
      this.isConnected = false;
      this.logger.info('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Database disconnection failed:', error as Error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Check if mongoose is connected and ping the database
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Database health check failed:', error as Error);
      return false;
    }
  }

  public isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export default DatabaseConnection;
