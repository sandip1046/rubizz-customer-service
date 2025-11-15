import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env['PORT'] || '3003', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  serviceName: process.env['SERVICE_NAME'] || 'customer-service',

  // Database Configuration
  database: {
    url: process.env['DATABASE_URL'] || 'mongodb://localhost:27017/rubizz_customer_db',
  },

  // Redis Service Configuration
  redisService: {
    url: process.env['REDIS_SERVICE_URL'] || 'https://rubizz-redis-service.onrender.com/api/v1/redis',
    timeout: parseInt(process.env['REDIS_SERVICE_TIMEOUT'] || '30000', 10),
    retries: parseInt(process.env['REDIS_SERVICE_RETRIES'] || '3', 10),
    retryDelay: parseInt(process.env['REDIS_SERVICE_RETRY_DELAY'] || '1000', 10),
  },

  // JWT Configuration
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-here',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  },


  // API Gateway Configuration
  services: {
    apiGateway: process.env['API_GATEWAY_URL'] || 'http://localhost:3000',
    auth: process.env['AUTH_SERVICE_URL'] || 'http://localhost:3001',
    user: process.env['USER_SERVICE_URL'] || 'http://localhost:3002',
    mailService: process.env['MAIL_SERVICE_URL'] || 'http://localhost:3010',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '5242880', 10), // 5MB
    uploadPath: process.env['UPLOAD_PATH'] || './uploads',
    allowedTypes: (process.env['ALLOWED_FILE_TYPES'] || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  },

  // Logging Configuration
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
    filePath: process.env['LOG_FILE_PATH'] || './logs/customer-service.log',
  },

  // Customer Service Specific
  customer: {
    verificationRequired: process.env['CUSTOMER_VERIFICATION_REQUIRED'] === 'true',
    profileImageRequired: process.env['CUSTOMER_PROFILE_IMAGE_REQUIRED'] === 'true',
    defaultAvatarUrl: process.env['CUSTOMER_DEFAULT_AVATAR_URL'] || 'https://via.placeholder.com/150x150?text=Customer',
  },

  // Notification Configuration
  notifications: {
    email: process.env['ENABLE_EMAIL_NOTIFICATIONS'] === 'true',
    sms: process.env['ENABLE_SMS_NOTIFICATIONS'] === 'true',
    smsApiKey: process.env['SMS_API_KEY'] || 'your-sms-api-key',
    smsApiSecret: process.env['SMS_API_SECRET'] || 'your-sms-api-secret',
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10),
    sessionSecret: process.env['SESSION_SECRET'] || 'your-session-secret-here',
    corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:4200',
  },

  // Monitoring Configuration
  monitoring: {
    enableMetrics: process.env['ENABLE_METRICS'] === 'true',
    metricsPort: parseInt(process.env['METRICS_PORT'] || '9090', 10),
    healthCheckInterval: parseInt(process.env['HEALTH_CHECK_INTERVAL'] || '30000', 10),
  },

  // gRPC Configuration
  grpc: {
    port: parseInt(process.env['GRPC_PORT'] || '50053', 10),
    host: process.env['GRPC_HOST'] || '0.0.0.0',
    maxReceiveMessageLength: parseInt(process.env['GRPC_MAX_RECEIVE_MESSAGE_LENGTH'] || '4194304', 10), // 4MB
    maxSendMessageLength: parseInt(process.env['GRPC_MAX_SEND_MESSAGE_LENGTH'] || '4194304', 10), // 4MB
    keepaliveTime: parseInt(process.env['GRPC_KEEPALIVE_TIME'] || '30000', 10),
    keepaliveTimeout: parseInt(process.env['GRPC_KEEPALIVE_TIMEOUT'] || '5000', 10),
    keepalivePermitWithoutCalls: process.env['GRPC_KEEPALIVE_PERMIT_WITHOUT_CALLS'] === 'true',
  },

  // GraphQL Configuration
  graphql: {
    introspection: process.env['GRAPHQL_INTROSPECTION'] !== 'false',
    playground: process.env['GRAPHQL_PLAYGROUND'] !== 'false',
    tracing: process.env['GRAPHQL_TRACING'] === 'true',
    caching: process.env['GRAPHQL_CACHING'] === 'true',
  },

  // WebSocket Configuration
  websocket: {
    enabled: process.env['WEBSOCKET_ENABLED'] !== 'false',
    path: process.env['WEBSOCKET_PATH'] || '/graphql-ws',
    pingInterval: parseInt(process.env['WEBSOCKET_PING_INTERVAL'] || '30000', 10),
    pongTimeout: parseInt(process.env['WEBSOCKET_PONG_TIMEOUT'] || '5000', 10),
  },

  // Kafka Configuration
  kafka: {
    enabled: process.env['KAFKA_ENABLED'] === 'true',
    brokers: (process.env['KAFKA_BROKERS'] || 'localhost:9092').split(','),
    clientId: process.env['KAFKA_CLIENT_ID'] || 'rubizz-customer-service',
    groupId: process.env['KAFKA_GROUP_ID'] || 'rubizz-customer-service-group',
    retryAttempts: parseInt(process.env['KAFKA_RETRY_ATTEMPTS'] || '3', 10),
    retryDelay: parseInt(process.env['KAFKA_RETRY_DELAY'] || '1000', 10),
    sessionTimeout: parseInt(process.env['KAFKA_SESSION_TIMEOUT'] || '30000', 10),
    heartbeatInterval: parseInt(process.env['KAFKA_HEARTBEAT_INTERVAL'] || '3000', 10),
    topics: {
      events: process.env['KAFKA_TOPICS_EVENTS'] || 'rubizz.events',
      notifications: process.env['KAFKA_TOPICS_NOTIFICATIONS'] || 'rubizz.notifications',
      analytics: process.env['KAFKA_TOPICS_ANALYTICS'] || 'rubizz.analytics',
    },
  },

  // CORS Configuration
  cors: {
    origins: (process.env['CORS_ORIGINS'] || 'http://localhost:4200,http://localhost:3000').split(','),
    credentials: process.env['CORS_CREDENTIALS'] === 'true',
  },
};

export default config;
