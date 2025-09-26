import { createClient, RedisClientType } from 'redis';
import { config } from '../config/config';
import { logger } from '@shared/logger';

class RedisConnection {
  private static instance: RedisConnection;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient({
      url: config.database.redis.url,
    });

    // Event listeners
    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    this.client.on('end', () => {
      logger.info('Redis client disconnected');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
  }

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      logger.info('Redis disconnected successfully');
    } catch (error) {
      logger.error('Redis disconnection failed:', error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Cache operations
  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET operation failed:', error);
      throw error;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET operation failed:', error);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL operation failed:', error);
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS operation failed:', error);
      throw error;
    }
  }

  public async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      logger.error('Redis EXPIRE operation failed:', error);
      throw error;
    }
  }

  // Hash operations
  public async hSet(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hSet(key, field, value);
    } catch (error) {
      logger.error('Redis HSET operation failed:', error);
      throw error;
    }
  }

  public async hGet(key: string, field: string): Promise<string | undefined> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      logger.error('Redis HGET operation failed:', error);
      throw error;
    }
  }

  public async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      logger.error('Redis HGETALL operation failed:', error);
      throw error;
    }
  }

  public async hDel(key: string, field: string): Promise<void> {
    try {
      await this.client.hDel(key, field);
    } catch (error) {
      logger.error('Redis HDEL operation failed:', error);
      throw error;
    }
  }

  // List operations
  public async lPush(key: string, ...values: string[]): Promise<void> {
    try {
      await this.client.lPush(key, values);
    } catch (error) {
      logger.error('Redis LPUSH operation failed:', error);
      throw error;
    }
  }

  public async rPush(key: string, ...values: string[]): Promise<void> {
    try {
      await this.client.rPush(key, values);
    } catch (error) {
      logger.error('Redis RPUSH operation failed:', error);
      throw error;
    }
  }

  public async lPop(key: string): Promise<string | null> {
    try {
      return await this.client.lPop(key);
    } catch (error) {
      logger.error('Redis LPOP operation failed:', error);
      throw error;
    }
  }

  public async rPop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      logger.error('Redis RPOP operation failed:', error);
      throw error;
    }
  }

  public async lRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      logger.error('Redis LRANGE operation failed:', error);
      throw error;
    }
  }
}

export default RedisConnection;
