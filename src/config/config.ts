import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'customer-service',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/rubizz_customer_db?schema=public',
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || 'your-email@example.com',
      pass: process.env.SMTP_PASS || 'your-smtp-password',
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@rubizzhotel.com',
      name: process.env.FROM_NAME || 'Rubizz Hotel Inn',
    },
  },

  // API Gateway Configuration
  services: {
    apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:3000',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/customer-service.log',
  },

  // Customer Service Specific
  customer: {
    verificationRequired: process.env.CUSTOMER_VERIFICATION_REQUIRED === 'true',
    profileImageRequired: process.env.CUSTOMER_PROFILE_IMAGE_REQUIRED === 'true',
    defaultAvatarUrl: process.env.CUSTOMER_DEFAULT_AVATAR_URL || 'https://via.placeholder.com/150x150?text=Customer',
  },

  // Notification Configuration
  notifications: {
    email: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    sms: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
    smsApiKey: process.env.SMS_API_KEY || 'your-sms-api-key',
    smsApiSecret: process.env.SMS_API_SECRET || 'your-sms-api-secret',
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-here',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  },

  // Monitoring Configuration
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
  },
};

export default config;
