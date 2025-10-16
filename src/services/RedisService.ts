import { RedisClient, RedisInstanceType, Logger } from '@sandip1046/rubizz-shared-libs';
import { config } from '../config/config';

export class RedisService {
  private client: RedisClient;
  private isConnected: boolean = false;
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
    this.client = new RedisClient({
      baseUrl: config.redisService.url,
      timeout: config.redisService.timeout,
      retries: config.redisService.retries,
      retryDelay: config.redisService.retryDelay,
    });
  }

  public async connect(): Promise<void> {
    try {
      const health = await this.client.healthCheck();
      this.isConnected = health.success;
      
      if (this.isConnected) {
        this.logger.info('Connected to Redis service successfully');
      } else {
        throw new Error('Redis service health check failed');
      }
    } catch (error) {
      this.logger.error('Failed to connect to Redis service:', error as Error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.logger.info('Disconnected from Redis service');
  }

  public isServiceConnected(): boolean {
    return this.isConnected;
  }

  // Session operations
  public async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<boolean> {
    try {
      return await this.client.set(
        'session' as RedisInstanceType,
        `session:${sessionId}`,
        JSON.stringify(data),
        ttl
      );
    } catch (error) {
      this.logger.error('Failed to set session:', error as Error);
      return false;
    }
  }

  public async getSession(sessionId: string): Promise<any | null> {
    try {
      const data = await this.client.get(
        'session' as RedisInstanceType,
        `session:${sessionId}`
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Failed to get session:', error as Error);
      return null;
    }
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    try {
      return await this.client.del(
        'session' as RedisInstanceType,
        `session:${sessionId}`
      );
    } catch (error) {
      this.logger.error('Failed to delete session:', error as Error);
      return false;
    }
  }

  // Cache operations
  public async setCache(key: string, data: any, ttl: number = 3600): Promise<boolean> {
    try {
      return await this.client.set(
        'cache' as RedisInstanceType,
        `customer:${key}`,
        JSON.stringify(data),
        ttl
      );
    } catch (error) {
      this.logger.error('Failed to set cache:', error as Error);
      return false;
    }
  }

  public async getCache(key: string): Promise<any | null> {
    try {
      const data = await this.client.get(
        'cache' as RedisInstanceType,
        `customer:${key}`
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Failed to get cache:', error as Error);
      return null;
    }
  }

  public async deleteCache(key: string): Promise<boolean> {
    try {
      return await this.client.del(
        'cache' as RedisInstanceType,
        `customer:${key}`
      );
    } catch (error) {
      this.logger.error('Failed to delete cache:', error as Error);
      return false;
    }
  }

  // Queue operations
  public async pushToQueue(queueName: string, data: any): Promise<number> {
    try {
      return await this.client.lpush(
        'queue' as RedisInstanceType,
        `customer:queue:${queueName}`,
        JSON.stringify(data)
      );
    } catch (error) {
      this.logger.error('Failed to push to queue:', error as Error);
      return 0;
    }
  }

  public async popFromQueue(queueName: string): Promise<any | null> {
    try {
      const data = await this.client.rpop(
        'queue' as RedisInstanceType,
        `customer:queue:${queueName}`
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Failed to pop from queue:', error as Error);
      return null;
    }
  }

  public async getQueueLength(queueName: string): Promise<number> {
    try {
      return await this.client.llen(
        'queue' as RedisInstanceType,
        `customer:queue:${queueName}`
      );
    } catch (error) {
      this.logger.error('Failed to get queue length:', error as Error);
      return 0;
    }
  }

  // Hash operations
  public async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      return await this.client.hset(
        'cache' as RedisInstanceType,
        `customer:hash:${key}`,
        field,
        JSON.stringify(value)
      );
    } catch (error) {
      this.logger.error('Failed to hset:', error as Error);
      return false;
    }
  }

  public async hget(key: string, field: string): Promise<any | null> {
    try {
      const data = await this.client.hget(
        'cache' as RedisInstanceType,
        `customer:hash:${key}`,
        field
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Failed to hget:', error as Error);
      return null;
    }
  }

  public async hgetall(key: string): Promise<Record<string, any>> {
    try {
      const data = await this.client.hgetall(
        'cache' as RedisInstanceType,
        `customer:hash:${key}`
      );
      const parsed: Record<string, any> = {};
      for (const [field, value] of Object.entries(data)) {
        parsed[field] = JSON.parse(value as string);
      }
      return parsed;
    } catch (error) {
      this.logger.error('Failed to hgetall:', error as Error);
      return {};
    }
  }

  public async hdel(key: string, field: string): Promise<boolean> {
    try {
      return await this.client.hdel(
        'cache' as RedisInstanceType,
        `customer:hash:${key}`,
        field
      );
    } catch (error) {
      this.logger.error('Failed to hdel:', error as Error);
      return false;
    }
  }

  // List operations
  public async lpush(key: string, ...values: any[]): Promise<number> {
    try {
      const serializedValues = values.map(value => JSON.stringify(value));
      return await this.client.lpush(
        'queue' as RedisInstanceType,
        `customer:list:${key}`,
        ...serializedValues
      );
    } catch (error) {
      this.logger.error('Failed to lpush:', error as Error);
      return 0;
    }
  }

  public async rpush(key: string, ...values: any[]): Promise<number> {
    try {
      const serializedValues = values.map(value => JSON.stringify(value));
      return await this.client.lpush(
        'queue' as RedisInstanceType,
        `customer:list:${key}`,
        ...serializedValues
      );
    } catch (error) {
      this.logger.error('Failed to rpush:', error as Error);
      return 0;
    }
  }

  public async lpop(key: string): Promise<any | null> {
    try {
      const data = await this.client.rpop(
        'queue' as RedisInstanceType,
        `customer:list:${key}`
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Failed to lpop:', error as Error);
      return null;
    }
  }

  public async rpop(key: string): Promise<any | null> {
    try {
      const data = await this.client.rpop(
        'queue' as RedisInstanceType,
        `customer:list:${key}`
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Failed to rpop:', error as Error);
      return null;
    }
  }

  public async lrange(key: string, start: number, stop: number): Promise<any[]> {
    try {
      // Use execute method for lrange operation
      const result = await this.client.execute('queue' as RedisInstanceType, {
        operation: 'lrange',
        key: `customer:list:${key}`,
        start,
        stop
      });
      return result.success ? result.data.map((value: string) => JSON.parse(value)) : [];
    } catch (error) {
      this.logger.error('Failed to lrange:', error as Error);
      return [];
    }
  }

  // Set operations
  public async sadd(key: string, ...members: any[]): Promise<number> {
    try {
      const serializedMembers = members.map(member => JSON.stringify(member));
      return await this.client.sadd(
        'cache' as RedisInstanceType,
        `customer:set:${key}`,
        ...serializedMembers
      );
    } catch (error) {
      this.logger.error('Failed to sadd:', error as Error);
      return 0;
    }
  }

  public async smembers(key: string): Promise<any[]> {
    try {
      const data = await this.client.smembers(
        'cache' as RedisInstanceType,
        `customer:set:${key}`
      );
      return data.map(value => JSON.parse(value));
    } catch (error) {
      this.logger.error('Failed to smembers:', error as Error);
      return [];
    }
  }

  public async srem(key: string, ...members: any[]): Promise<number> {
    try {
      const serializedMembers = members.map(member => JSON.stringify(member));
      return await this.client.srem(
        'cache' as RedisInstanceType,
        `customer:set:${key}`,
        ...serializedMembers
      );
    } catch (error) {
      this.logger.error('Failed to srem:', error as Error);
      return 0;
    }
  }

  public async sismember(key: string, member: any): Promise<boolean> {
    try {
      return await this.client.sismember(
        'cache' as RedisInstanceType,
        `customer:set:${key}`,
        JSON.stringify(member)
      );
    } catch (error) {
      this.logger.error('Failed to sismember:', error as Error);
      return false;
    }
  }

  // Utility operations
  public async exists(key: string): Promise<boolean> {
    try {
      return await this.client.exists(
        'cache' as RedisInstanceType,
        `customer:${key}`
      );
    } catch (error) {
      this.logger.error('Failed to check existence:', error as Error);
      return false;
    }
  }

  public async expire(key: string, ttl: number): Promise<boolean> {
    try {
      return await this.client.expire(
        'cache' as RedisInstanceType,
        `customer:${key}`,
        ttl
      );
    } catch (error) {
      this.logger.error('Failed to set expiration:', error as Error);
      return false;
    }
  }

  public async ttl(key: string): Promise<number> {
    try {
      // Use execute method for ttl operation
      const result = await this.client.execute('cache' as RedisInstanceType, {
        operation: 'ttl',
        key: `customer:${key}`
      });
      return result.success ? result.data : -1;
    } catch (error) {
      this.logger.error('Failed to get TTL:', error as Error);
      return -1;
    }
  }

  // Health check
  public async healthCheck(): Promise<{ session: boolean; cache: boolean; queue: boolean }> {
    try {
      const health = await this.client.healthCheck();
      if (health.success && health.data) {
        return health.data.redis;
      }
      return { session: false, cache: false, queue: false };
    } catch (error) {
      this.logger.error('Redis service health check failed:', error as Error);
      return { session: false, cache: false, queue: false };
    }
  }
}

export default RedisService;
