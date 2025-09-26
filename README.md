# Rubizz Customer Service

Customer management microservice for the Rubizz Hotel Inn platform.

## Overview

This service handles all customer-related operations including:
- Customer registration and profile management
- Customer preferences and settings
- Address management
- Loyalty points system
- Customer activity tracking
- Email notifications
- Customer search and analytics

## Features

### Core Functionality
- **Customer Management**: Create, read, update, delete customer profiles
- **Profile Management**: Avatar, bio, preferences, emergency contacts
- **Address Management**: Multiple addresses per customer with default selection
- **Loyalty System**: Earn and redeem loyalty points
- **Activity Tracking**: Comprehensive audit trail of customer actions
- **Email Notifications**: Welcome emails, verification, booking confirmations

### Security & Performance
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Configurable rate limits for different operations
- **Input Validation**: Comprehensive request validation using Joi
- **Error Handling**: Centralized error handling with detailed logging
- **Caching**: Redis-based caching for improved performance
- **Database Optimization**: Efficient queries with proper indexing

## API Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with dependencies
- `GET /health/ready` - Kubernetes readiness check
- `GET /health/live` - Kubernetes liveness check
- `GET /metrics` - Service metrics

### Customer Management
- `POST /api/v1/customers` - Create new customer
- `GET /api/v1/customers/:customerId` - Get customer by ID
- `PUT /api/v1/customers/:customerId` - Update customer
- `DELETE /api/v1/customers/:customerId` - Delete customer (soft delete)
- `GET /api/v1/customers/search` - Search customers with filters
- `GET /api/v1/customers/stats` - Get customer statistics

### Customer Profile
- `PUT /api/v1/customers/:customerId/profile` - Update customer profile
- `PUT /api/v1/customers/:customerId/preferences` - Update preferences

### Address Management
- `POST /api/v1/customers/:customerId/addresses` - Add address
- `GET /api/v1/customers/:customerId/addresses` - Get customer addresses
- `PUT /api/v1/addresses/:addressId` - Update address
- `DELETE /api/v1/addresses/:addressId` - Delete address

### Verification & Login
- `POST /api/v1/customers/:customerId/verify` - Verify customer
- `POST /api/v1/customers/:customerId/last-login` - Update last login

## Database Schema

### Core Tables
- `customers` - Main customer information
- `customer_profiles` - Extended profile data
- `customer_preferences` - User preferences and settings
- `customer_addresses` - Customer addresses
- `customer_activities` - Activity audit trail
- `customer_notifications` - Notification records
- `customer_loyalty_points` - Loyalty points tracking

### Enums
- `Gender` - MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
- `AddressType` - HOME, WORK, BILLING, SHIPPING, OTHER
- `ActivityType` - Various customer activities
- `NotificationType` - Different notification types
- `LoyaltyPointType` - EARNED, REDEEMED, EXPIRED, BONUS, REFERRAL

## Configuration

### Environment Variables
```bash
# Server Configuration
PORT=3003
NODE_ENV=development
SERVICE_NAME=customer-service

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/rubizz_customer_db?schema=public"
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@rubizzhotel.com
FROM_NAME=Rubizz Hotel Inn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Customer Service Specific
CUSTOMER_VERIFICATION_REQUIRED=true
CUSTOMER_PROFILE_IMAGE_REQUIRED=false
CUSTOMER_DEFAULT_AVATAR_URL=https://via.placeholder.com/150x150?text=Customer
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update environment variables
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### Production Setup
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Reset database
npx prisma db reset

# View database in Prisma Studio
npx prisma studio
```

## Architecture

### Microservice Design
- **Independent Service**: Can be deployed and scaled independently
- **Database per Service**: Own PostgreSQL database
- **Event-Driven**: Communicates via events and API calls
- **Stateless**: No session state stored in service

### Dependencies
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session and data caching
- **Email**: Nodemailer with SMTP support
- **Validation**: Joi for request validation
- **Logging**: Winston for structured logging

### Security
- **Authentication**: JWT token validation
- **Authorization**: Role-based access control
- **Rate Limiting**: Multiple rate limit strategies
- **Input Validation**: Comprehensive request validation
- **CORS**: Configurable cross-origin resource sharing

## Monitoring & Logging

### Health Checks
- Basic health check endpoint
- Detailed health check with dependency status
- Kubernetes-ready liveness and readiness probes
- Metrics endpoint for monitoring

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking and alerting
- Performance metrics

### Metrics
- Service uptime and performance
- Database connection status
- Redis connection status
- Memory and CPU usage
- Request counts and response times

## Error Handling

### Error Types
- **Validation Errors**: Input validation failures
- **Authentication Errors**: Invalid or missing tokens
- **Authorization Errors**: Insufficient permissions
- **Not Found Errors**: Resource not found
- **Conflict Errors**: Duplicate resources
- **Database Errors**: Database operation failures

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing

### Test Structure
- Unit tests for individual functions
- Integration tests for API endpoints
- Database tests for data operations
- Error handling tests

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "CustomerController"
```

## Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]
```

### Kubernetes
- Health check endpoints configured
- Resource limits and requests
- Horizontal pod autoscaling
- Service discovery and load balancing

## Contributing

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for git messages

### Pull Request Process
1. Create feature branch
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki
