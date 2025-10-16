import Redis from 'ioredis';
declare class RedisConnection {
    private static instance;
    private redis;
    private logger;
    private constructor();
    static getInstance(): RedisConnection;
    getRedisClient(): Redis;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    get(key: string): Promise<any>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    expire(key: string, ttl: number): Promise<void>;
    ttl(key: string): Promise<number>;
    hset(key: string, field: string, value: any): Promise<void>;
    hget(key: string, field: string): Promise<any>;
    hgetall(key: string): Promise<Record<string, any>>;
    hdel(key: string, field: string): Promise<void>;
    lpush(key: string, ...values: any[]): Promise<void>;
    rpush(key: string, ...values: any[]): Promise<void>;
    lpop(key: string): Promise<any>;
    rpop(key: string): Promise<any>;
    lrange(key: string, start: number, stop: number): Promise<any[]>;
    sadd(key: string, ...members: any[]): Promise<void>;
    smembers(key: string): Promise<any[]>;
    srem(key: string, ...members: any[]): Promise<void>;
    sismember(key: string, member: any): Promise<boolean>;
}
export declare const redisConnection: RedisConnection;
export declare const redis: Redis;
export { RedisConnection };
export default RedisConnection;
//# sourceMappingURL=RedisConnection.d.ts.map