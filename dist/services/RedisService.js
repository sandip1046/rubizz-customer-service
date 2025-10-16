"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
const config_1 = require("../config/config");
class RedisService {
    constructor() {
        this.isConnected = false;
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        this.client = new rubizz_shared_libs_1.RedisClient({
            baseUrl: config_1.config.redisService.url,
            timeout: config_1.config.redisService.timeout,
            retries: config_1.config.redisService.retries,
            retryDelay: config_1.config.redisService.retryDelay,
        });
    }
    async connect() {
        try {
            const health = await this.client.healthCheck();
            this.isConnected = health.success;
            if (this.isConnected) {
                this.logger.info('Connected to Redis service successfully');
            }
            else {
                throw new Error('Redis service health check failed');
            }
        }
        catch (error) {
            this.logger.error('Failed to connect to Redis service:', error);
            this.isConnected = false;
            throw error;
        }
    }
    async disconnect() {
        this.isConnected = false;
        this.logger.info('Disconnected from Redis service');
    }
    isServiceConnected() {
        return this.isConnected;
    }
    async setSession(sessionId, data, ttl = 3600) {
        try {
            return await this.client.set('session', `session:${sessionId}`, JSON.stringify(data), ttl);
        }
        catch (error) {
            this.logger.error('Failed to set session:', error);
            return false;
        }
    }
    async getSession(sessionId) {
        try {
            const data = await this.client.get('session', `session:${sessionId}`);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            this.logger.error('Failed to get session:', error);
            return null;
        }
    }
    async deleteSession(sessionId) {
        try {
            return await this.client.del('session', `session:${sessionId}`);
        }
        catch (error) {
            this.logger.error('Failed to delete session:', error);
            return false;
        }
    }
    async setCache(key, data, ttl = 3600) {
        try {
            return await this.client.set('cache', `customer:${key}`, JSON.stringify(data), ttl);
        }
        catch (error) {
            this.logger.error('Failed to set cache:', error);
            return false;
        }
    }
    async getCache(key) {
        try {
            const data = await this.client.get('cache', `customer:${key}`);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            this.logger.error('Failed to get cache:', error);
            return null;
        }
    }
    async deleteCache(key) {
        try {
            return await this.client.del('cache', `customer:${key}`);
        }
        catch (error) {
            this.logger.error('Failed to delete cache:', error);
            return false;
        }
    }
    async pushToQueue(queueName, data) {
        try {
            return await this.client.lpush('queue', `customer:queue:${queueName}`, JSON.stringify(data));
        }
        catch (error) {
            this.logger.error('Failed to push to queue:', error);
            return 0;
        }
    }
    async popFromQueue(queueName) {
        try {
            const data = await this.client.rpop('queue', `customer:queue:${queueName}`);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            this.logger.error('Failed to pop from queue:', error);
            return null;
        }
    }
    async getQueueLength(queueName) {
        try {
            return await this.client.llen('queue', `customer:queue:${queueName}`);
        }
        catch (error) {
            this.logger.error('Failed to get queue length:', error);
            return 0;
        }
    }
    async hset(key, field, value) {
        try {
            return await this.client.hset('cache', `customer:hash:${key}`, field, JSON.stringify(value));
        }
        catch (error) {
            this.logger.error('Failed to hset:', error);
            return false;
        }
    }
    async hget(key, field) {
        try {
            const data = await this.client.hget('cache', `customer:hash:${key}`, field);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            this.logger.error('Failed to hget:', error);
            return null;
        }
    }
    async hgetall(key) {
        try {
            const data = await this.client.hgetall('cache', `customer:hash:${key}`);
            const parsed = {};
            for (const [field, value] of Object.entries(data)) {
                parsed[field] = JSON.parse(value);
            }
            return parsed;
        }
        catch (error) {
            this.logger.error('Failed to hgetall:', error);
            return {};
        }
    }
    async hdel(key, field) {
        try {
            return await this.client.hdel('cache', `customer:hash:${key}`, field);
        }
        catch (error) {
            this.logger.error('Failed to hdel:', error);
            return false;
        }
    }
    async lpush(key, ...values) {
        try {
            const serializedValues = values.map(value => JSON.stringify(value));
            return await this.client.lpush('queue', `customer:list:${key}`, ...serializedValues);
        }
        catch (error) {
            this.logger.error('Failed to lpush:', error);
            return 0;
        }
    }
    async rpush(key, ...values) {
        try {
            const serializedValues = values.map(value => JSON.stringify(value));
            return await this.client.lpush('queue', `customer:list:${key}`, ...serializedValues);
        }
        catch (error) {
            this.logger.error('Failed to rpush:', error);
            return 0;
        }
    }
    async lpop(key) {
        try {
            const data = await this.client.rpop('queue', `customer:list:${key}`);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            this.logger.error('Failed to lpop:', error);
            return null;
        }
    }
    async rpop(key) {
        try {
            const data = await this.client.rpop('queue', `customer:list:${key}`);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            this.logger.error('Failed to rpop:', error);
            return null;
        }
    }
    async lrange(key, start, stop) {
        try {
            const result = await this.client.execute('queue', {
                operation: 'lrange',
                key: `customer:list:${key}`,
                start,
                stop
            });
            return result.success ? result.data.map((value) => JSON.parse(value)) : [];
        }
        catch (error) {
            this.logger.error('Failed to lrange:', error);
            return [];
        }
    }
    async sadd(key, ...members) {
        try {
            const serializedMembers = members.map(member => JSON.stringify(member));
            return await this.client.sadd('cache', `customer:set:${key}`, ...serializedMembers);
        }
        catch (error) {
            this.logger.error('Failed to sadd:', error);
            return 0;
        }
    }
    async smembers(key) {
        try {
            const data = await this.client.smembers('cache', `customer:set:${key}`);
            return data.map(value => JSON.parse(value));
        }
        catch (error) {
            this.logger.error('Failed to smembers:', error);
            return [];
        }
    }
    async srem(key, ...members) {
        try {
            const serializedMembers = members.map(member => JSON.stringify(member));
            return await this.client.srem('cache', `customer:set:${key}`, ...serializedMembers);
        }
        catch (error) {
            this.logger.error('Failed to srem:', error);
            return 0;
        }
    }
    async sismember(key, member) {
        try {
            return await this.client.sismember('cache', `customer:set:${key}`, JSON.stringify(member));
        }
        catch (error) {
            this.logger.error('Failed to sismember:', error);
            return false;
        }
    }
    async exists(key) {
        try {
            return await this.client.exists('cache', `customer:${key}`);
        }
        catch (error) {
            this.logger.error('Failed to check existence:', error);
            return false;
        }
    }
    async expire(key, ttl) {
        try {
            return await this.client.expire('cache', `customer:${key}`, ttl);
        }
        catch (error) {
            this.logger.error('Failed to set expiration:', error);
            return false;
        }
    }
    async ttl(key) {
        try {
            const result = await this.client.execute('cache', {
                operation: 'ttl',
                key: `customer:${key}`
            });
            return result.success ? result.data : -1;
        }
        catch (error) {
            this.logger.error('Failed to get TTL:', error);
            return -1;
        }
    }
    async healthCheck() {
        try {
            const health = await this.client.healthCheck();
            if (health.success && health.data) {
                return health.data.redis;
            }
            return { session: false, cache: false, queue: false };
        }
        catch (error) {
            this.logger.error('Redis service health check failed:', error);
            return { session: false, cache: false, queue: false };
        }
    }
}
exports.RedisService = RedisService;
exports.default = RedisService;
//# sourceMappingURL=RedisService.js.map