"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConnection = exports.redis = exports.redisConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config/config");
const rubizz_shared_libs_1 = require("rubizz-shared-libs");
class RedisConnection {
    constructor() {
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        let redisConfig;
        if (config_1.config.redis.url) {
            const url = new URL(config_1.config.redis.url);
            redisConfig = {
                host: url.hostname,
                port: parseInt(url.port),
                password: url.password,
                username: url.username,
                db: config_1.config.redis.db,
                tls: config_1.config.redis.tls ? {} : undefined,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
            };
        }
        else {
            redisConfig = {
                host: config_1.config.redis.host,
                port: config_1.config.redis.port,
                password: config_1.config.redis.password || undefined,
                username: config_1.config.redis.username || undefined,
                db: config_1.config.redis.db,
                tls: config_1.config.redis.tls ? {} : undefined,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
            };
        }
        const cleanConfig = {
            host: redisConfig.host,
            port: redisConfig.port,
            db: redisConfig.db,
            maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
            lazyConnect: redisConfig.lazyConnect,
        };
        if (redisConfig.password)
            cleanConfig.password = redisConfig.password;
        if (redisConfig.username)
            cleanConfig.username = redisConfig.username;
        if (redisConfig.tls)
            cleanConfig.tls = redisConfig.tls;
        this.redis = new ioredis_1.default(cleanConfig);
        this.redis.on('connect', () => {
            this.logger.info('Redis connected successfully');
        });
        this.redis.on('error', (error) => {
            this.logger.error('Redis connection error:', error);
        });
        this.redis.on('close', () => {
            this.logger.warn('Redis connection closed');
        });
        this.redis.on('reconnecting', () => {
            this.logger.info('Redis reconnecting...');
        });
    }
    static getInstance() {
        if (!RedisConnection.instance) {
            RedisConnection.instance = new RedisConnection();
        }
        return RedisConnection.instance;
    }
    getRedisClient() {
        return this.redis;
    }
    async connect() {
        try {
            await this.redis.connect();
            this.logger.info('Redis connected successfully');
        }
        catch (error) {
            this.logger.error('Redis connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.redis.disconnect();
            this.logger.info('Redis disconnected successfully');
        }
        catch (error) {
            this.logger.error('Redis disconnection failed:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            const result = await this.redis.ping();
            return result === 'PONG';
        }
        catch (error) {
            this.logger.error('Redis health check failed:', error);
            return false;
        }
    }
    async set(key, value, ttl) {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await this.redis.setex(key, ttl, serializedValue);
            }
            else {
                await this.redis.set(key, serializedValue);
            }
        }
        catch (error) {
            this.logger.error('Redis set error:', error);
            throw error;
        }
    }
    async get(key) {
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            this.logger.error('Redis get error:', error);
            throw error;
        }
    }
    async del(key) {
        try {
            await this.redis.del(key);
        }
        catch (error) {
            this.logger.error('Redis delete error:', error);
            throw error;
        }
    }
    async exists(key) {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        }
        catch (error) {
            this.logger.error('Redis exists error:', error);
            throw error;
        }
    }
    async expire(key, ttl) {
        try {
            await this.redis.expire(key, ttl);
        }
        catch (error) {
            this.logger.error('Redis expire error:', error);
            throw error;
        }
    }
    async ttl(key) {
        try {
            return await this.redis.ttl(key);
        }
        catch (error) {
            this.logger.error('Redis TTL error:', error);
            throw error;
        }
    }
    async hset(key, field, value) {
        try {
            const serializedValue = JSON.stringify(value);
            await this.redis.hset(key, field, serializedValue);
        }
        catch (error) {
            this.logger.error('Redis hset error:', error);
            throw error;
        }
    }
    async hget(key, field) {
        try {
            const value = await this.redis.hget(key, field);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            this.logger.error('Redis hget error:', error);
            throw error;
        }
    }
    async hgetall(key) {
        try {
            const result = await this.redis.hgetall(key);
            const parsed = {};
            for (const [field, value] of Object.entries(result)) {
                parsed[field] = JSON.parse(value);
            }
            return parsed;
        }
        catch (error) {
            this.logger.error('Redis hgetall error:', error);
            throw error;
        }
    }
    async hdel(key, field) {
        try {
            await this.redis.hdel(key, field);
        }
        catch (error) {
            this.logger.error('Redis hdel error:', error);
            throw error;
        }
    }
    async lpush(key, ...values) {
        try {
            const serializedValues = values.map(value => JSON.stringify(value));
            await this.redis.lpush(key, ...serializedValues);
        }
        catch (error) {
            this.logger.error('Redis lpush error:', error);
            throw error;
        }
    }
    async rpush(key, ...values) {
        try {
            const serializedValues = values.map(value => JSON.stringify(value));
            await this.redis.rpush(key, ...serializedValues);
        }
        catch (error) {
            this.logger.error('Redis rpush error:', error);
            throw error;
        }
    }
    async lpop(key) {
        try {
            const value = await this.redis.lpop(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            this.logger.error('Redis lpop error:', error);
            throw error;
        }
    }
    async rpop(key) {
        try {
            const value = await this.redis.rpop(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            this.logger.error('Redis rpop error:', error);
            throw error;
        }
    }
    async lrange(key, start, stop) {
        try {
            const values = await this.redis.lrange(key, start, stop);
            return values.map(value => JSON.parse(value));
        }
        catch (error) {
            this.logger.error('Redis lrange error:', error);
            throw error;
        }
    }
    async sadd(key, ...members) {
        try {
            const serializedMembers = members.map(member => JSON.stringify(member));
            await this.redis.sadd(key, ...serializedMembers);
        }
        catch (error) {
            this.logger.error('Redis sadd error:', error);
            throw error;
        }
    }
    async smembers(key) {
        try {
            const members = await this.redis.smembers(key);
            return members.map(member => JSON.parse(member));
        }
        catch (error) {
            this.logger.error('Redis smembers error:', error);
            throw error;
        }
    }
    async srem(key, ...members) {
        try {
            const serializedMembers = members.map(member => JSON.stringify(member));
            await this.redis.srem(key, ...serializedMembers);
        }
        catch (error) {
            this.logger.error('Redis srem error:', error);
            throw error;
        }
    }
    async sismember(key, member) {
        try {
            const serializedMember = JSON.stringify(member);
            const result = await this.redis.sismember(key, serializedMember);
            return result === 1;
        }
        catch (error) {
            this.logger.error('Redis sismember error:', error);
            throw error;
        }
    }
}
exports.RedisConnection = RedisConnection;
exports.redisConnection = RedisConnection.getInstance();
exports.redis = exports.redisConnection.getRedisClient();
exports.default = RedisConnection;
//# sourceMappingURL=RedisConnection.js.map