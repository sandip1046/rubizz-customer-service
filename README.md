# Rubizz Customer Service

Enterprise-grade customer management microservice for the Rubizz Hotel Inn platform with optimized multi-protocol communication architecture.

## 🏗️ Architecture Overview

This service implements a **clean architecture** with proper separation of concerns:

- **Business Service Layer** - Core business logic with caching and event publishing
- **Controller Layer** - Protocol-specific controllers (REST, GraphQL, gRPC)
- **WebSocket Server** - Real-time bidirectional communication
- **Event-Driven Architecture** - Kafka integration for reliable event streaming

## 🚀 Multi-Protocol Support

This service supports multiple communication protocols optimized for different use cases:

- **REST API** - Traditional HTTP/REST endpoints for web applications (10-50ms)
- **GraphQL API** - Flexible queries with real-time subscriptions (10-50ms)
- **gRPC Server** - High-performance internal service communication (1-5ms)
- **WebSocket Server** - Real-time bidirectional communication (1-5ms)
- **Kafka Integration** - Event-driven architecture for reliable messaging (5-20ms)

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

### GraphQL Endpoint
- `POST /graphql` - GraphQL queries and mutations
- `GET /graphql` - GraphQL playground (development)
- `WebSocket /graphql-ws` - GraphQL subscriptions for real-time features

### WebSocket Endpoint
- `WebSocket /ws` - Real-time bidirectional communication
- Supports customer updates, notifications, and live data

### gRPC Endpoint
- `localhost:50053` - gRPC service for high-performance communication

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

### MongoDB Collections
- `customers` - Main customer information
- `customer_profiles` - Extended profile data
- `customer_preferences` - User preferences and settings
- `customer_addresses` - Customer addresses
- `customer_bookings` - Customer booking records
- `customer_orders` - Customer order records
- `customer_reviews` - Customer review records
- `customer_activities` - Activity audit trail
- `customer_notifications` - Notification records
- `customer_loyalty_points` - Loyalty points tracking

### Mongoose Schemas
All models are defined using Mongoose schemas with proper TypeScript interfaces, validation, and indexing for optimal performance.

### Enums
- `Gender` - MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
- `AddressType` - HOME, WORK, BILLING, SHIPPING, OTHER
- `BookingType` - HOTEL_ROOM, RESTAURANT_TABLE, HALL_EVENT
- `BookingStatus` - PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW
- `OrderType` - FOOD_DELIVERY, RESTAURANT_DINE_IN, ROOM_SERVICE
- `OrderStatus` - PENDING, CONFIRMED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED
- `ReviewType` - HOTEL_ROOM, RESTAURANT, FOOD_ITEM, SERVICE, DELIVERY
- `ActivityType` - LOGIN, LOGOUT, PROFILE_UPDATE, BOOKING_CREATED, ORDER_PLACED, REVIEW_POSTED, PASSWORD_CHANGED, EMAIL_VERIFIED, PHONE_VERIFIED
- `NotificationType` - BOOKING_CONFIRMATION, ORDER_UPDATE, PAYMENT_RECEIPT, PROMOTION, REMINDER, SYSTEM_ALERT, REVIEW_REQUEST, LOYALTY_POINTS
- `LoyaltyPointType` - EARNED, REDEEMED, EXPIRED, BONUS, REFERRAL

## GraphQL API Usage

### GraphQL Playground
Access the interactive GraphQL playground at `http://localhost:3003/graphql` in development mode.

### Example Queries

#### Get Customer
```graphql
query GetCustomer($customerId: ID!) {
  getCustomer(customerId: $customerId) {
    apiResponse {
      success
      message
      timestamp
    }
    customer {
      id
      email
      firstName
      lastName
      isVerified
      isActive
      profile {
        avatar
        bio
        emergencyContact
      }
      preferences {
        language
        currency
        emailNotifications
      }
      addresses {
        id
        type
        addressLine1
        city
        isDefault
      }
    }
  }
}
```

#### Create Customer
```graphql
mutation CreateCustomer($input: CreateCustomerInput!) {
  createCustomer(input: $input) {
    apiResponse {
      success
      message
      timestamp
    }
    customer {
      id
      email
      firstName
      lastName
      isVerified
    }
  }
}
```

#### Real-time Subscriptions
```graphql
# Customer created events
subscription {
  customerCreated {
    eventType
    customer {
      id
      email
      firstName
      lastName
    }
    timestamp
  }
}

# Customer updated events
subscription {
  customerUpdated(customerId: "customer_123") {
    eventType
    customer {
      id
      email
      firstName
      lastName
    }
    timestamp
  }
}
```

## WebSocket API Usage

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3003/ws');

// Authenticate connection
ws.send(JSON.stringify({
  type: 'authenticate',
  data: {
    token: 'jwt-token',
    customerId: 'customer_123'
  }
}));

// Subscribe to customer events
ws.send(JSON.stringify({
  type: 'subscribe',
  data: {
    topic: 'customer_updated',
    customerId: 'customer_123'
  }
}));

// Handle incoming messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### WebSocket Message Types
- `authenticate` - Authenticate with JWT token
- `subscribe` - Subscribe to specific events
- `unsubscribe` - Unsubscribe from events
- `ping` - Keep connection alive
- `customer_update` - Update customer data

### Real-time Events
- `customer_created` - New customer registered
- `customer_updated` - Customer profile updated
- `customer_verified` - Customer email verified
- `customer_address_added` - New address added
- `customer_notification_sent` - Notification sent

## gRPC API Usage

### gRPC Endpoint
```
localhost:50053
```

### Available Services
- `CustomerService` - Complete customer management service
- `HealthCheck` - Service health monitoring

### Example gRPC Calls

#### Create Customer Request
```protobuf
message CreateCustomerRequest {
  string email = 1;
  string phone = 2;
  string first_name = 3;
  string last_name = 4;
  int64 date_of_birth = 5;
  string gender = 6;
}
```

#### Create Customer Response
```protobuf
message CreateCustomerResponse {
  rubizz.common.ApiResponse api_response = 1;
  Customer customer = 2;
}
```

## Configuration

### Environment Variables
```bash
# Server Configuration
PORT=3003
NODE_ENV=development
SERVICE_NAME=customer-service

# Database Configuration (MongoDB Atlas connection string)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/rubizz_customer_db?retryWrites=true&w=majority"
# Or for local MongoDB:
# DATABASE_URL="mongodb://localhost:27017/rubizz_customer_db"

# Redis Service Configuration
REDIS_SERVICE_URL=https://rubizz-redis-service.onrender.com/api/v1/redis

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

# gRPC Configuration
GRPC_PORT=50053
GRPC_HOST=0.0.0.0

# GraphQL Configuration
GRAPHQL_INTROSPECTION=true
GRAPHQL_PLAYGROUND=true

# WebSocket Configuration
WEBSOCKET_ENABLED=true
WEBSOCKET_PATH=/graphql-ws

# Kafka Configuration
KAFKA_ENABLED=false
KAFKA_BROKERS=localhost:9092
KAFKA_TOPICS_EVENTS=rubizz.events

# Customer Service Specific
CUSTOMER_VERIFICATION_REQUIRED=true
CUSTOMER_PROFILE_IMAGE_REQUIRED=false
CUSTOMER_DEFAULT_AVATAR_URL=https://via.placeholder.com/150x150?text=Customer
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- Redis Service (rubizz-redis-service)
- SMTP server (for email notifications)
- Kafka (optional, for event streaming)

### Installation
```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update environment variables
# Edit .env with your MongoDB Atlas connection string
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/rubizz_customer_db?retryWrites=true&w=majority"

# Start development server
npm run dev
```

**Note**: The service uses Mongoose ODM with MongoDB. The database schema is automatically created when you first run the application. No migration scripts are required. Ensure your `DATABASE_URL` is correctly configured in the `.env` file.

### Production Setup
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🏛️ Clean Architecture Implementation

This service implements a **clean architecture** pattern with proper separation of concerns:

### Architecture Layers

#### 1. Business Service Layer (`CustomerBusinessService`)
- **Single Source of Truth** - All business logic centralized
- **Caching Integration** - Redis caching for performance
- **Event Publishing** - Kafka events for decoupled communication
- **Email Integration** - Welcome emails and notifications
- **Activity Logging** - Comprehensive audit trail

#### 2. Controller Layer
- **REST Controller** - HTTP/REST endpoints for web clients
- **GraphQL Controller** - Flexible API for mobile/web clients  
- **gRPC Controller** - High-performance internal communication
- **Protocol Mapping** - Clean data transformation between protocols

#### 3. WebSocket Server
- **Real-time Communication** - Bidirectional WebSocket connections
- **Event Broadcasting** - Publish events to subscribed clients
- **Connection Management** - Handle client connections and subscriptions
- **Authentication** - Customer-specific access control

#### 4. Event-Driven Architecture
- **Kafka Integration** - Reliable event streaming
- **Event Publishing** - Customer events (created, updated, verified)
- **Event Consumption** - Process events from other services
- **Event Sourcing** - Complete audit trail of customer changes

### Service Integration
- **API Gateway** - Routes external requests to appropriate protocols
- **Shared Libraries** - Common utilities and types across services
- **Event Streaming** - Kafka for reliable event propagation
- **Caching** - Redis service for performance optimization

## Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Database Management

The service uses **Mongoose ODM** for MongoDB. Schema definitions are in `src/schemas/CustomerSchema.ts`.

#### MongoDB Connection
- Connection is handled automatically via Mongoose
- Ensure `DATABASE_URL` is set in your `.env` file
- Supports MongoDB Atlas and local MongoDB instances

#### Schema Management
- All Mongoose schemas are defined in `src/schemas/CustomerSchema.ts`
- Models are automatically registered when the application starts
- Indexes are created automatically based on schema definitions

#### Manual Database Operations
```bash
# Connect to MongoDB (using mongosh)
mongosh "your-connection-string"

# View collections
show collections

# View customer data
db.customers.find().pretty()

# Drop a collection (use with caution)
db.customers.drop()
```

## Architecture

### Microservice Design
- **Independent Service**: Can be deployed and scaled independently
- **Database per Service**: Own MongoDB database with Mongoose ODM
- **Multi-Protocol**: Supports REST, GraphQL, gRPC, WebSocket, and Kafka
- **Event-Driven**: Communicates via Kafka events and API calls
- **Stateless**: No session state stored in service

### Dependencies
- **Database**: MongoDB with Mongoose ODM (Object Document Mapper)
- **Cache**: Redis Service for session and data caching
- **Email**: Nodemailer with SMTP support
- **Validation**: Joi for request validation, Mongoose schema validation
- **Logging**: Winston for structured logging
- **gRPC**: High-performance internal communication
- **GraphQL**: Flexible API with real-time subscriptions
- **Kafka**: Event streaming and messaging

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
- gRPC health check service

### Logging
- Structured JSON logging with shared libraries
- Request/response logging across all protocols
- Error tracking and alerting
- Performance metrics for all communication protocols

### Metrics
- Service uptime and performance
- Database connection status
- Redis Service connection status
- gRPC server metrics
- GraphQL query performance
- WebSocket connection metrics
- Kafka producer/consumer metrics
- Memory and CPU usage
- Request counts and response times

## Protocol Benefits

### REST API
- **Universal Support**: Works with any HTTP client
- **Simple Integration**: Easy to implement and test
- **Caching**: HTTP caching mechanisms
- **Stateless**: No server-side session management

### GraphQL API
- **Flexible Queries**: Request only needed data
- **Real-time Subscriptions**: Live updates via WebSocket
- **Type Safety**: Strong typing with schema validation
- **Single Endpoint**: One endpoint for all operations

### gRPC Server
- **High Performance**: Binary protocol with HTTP/2
- **Type Safety**: Protocol buffers for data serialization
- **Streaming**: Bidirectional streaming support
- **Internal Communication**: Optimized for service-to-service calls

### WebSocket
- **Real-time**: Instant bidirectional communication
- **Low Latency**: No HTTP overhead
- **Persistent Connection**: Maintains connection state
- **GraphQL Subscriptions**: Real-time data updates

### Kafka Integration
- **Reliable Messaging**: Guaranteed message delivery
- **Event Sourcing**: Complete audit trail
- **Scalability**: Horizontal scaling support
- **Decoupling**: Loose coupling between services

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
- Integration tests for REST API endpoints
- GraphQL query and mutation tests
- gRPC service tests
- WebSocket connection tests
- Kafka producer/consumer tests
- Database tests for data operations
- Error handling tests across all protocols

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
EXPOSE 3003 50053
CMD ["npm", "start"]
```

### Kubernetes
- Health check endpoints configured for all protocols
- Resource limits and requests
- Horizontal pod autoscaling
- Service discovery for REST, GraphQL, and gRPC
- Multi-port service configuration (HTTP: 3003, gRPC: 50053)
- ConfigMap and Secret management

## Contributing

### Code Standards
- TypeScript for type safety across all protocols
- ESLint for code quality
- Prettier for code formatting
- Protocol buffer definitions for gRPC
- GraphQL schema validation
- Conventional commits for git messages

### Pull Request Process
1. Create feature branch
2. Write tests for new functionality across all protocols
3. Ensure all tests pass (REST, GraphQL, gRPC, WebSocket, Kafka)
4. Update documentation and API examples
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki
