# Rubizz Customer Service - API Documentation

**Service**: rubizz-customer-service  
**Port**: 3006  
**Version**: 1.0.0  
**Base URL**: `http://localhost:3006` (Development) | `https://rubizz-customer-service.onrender.com` (Production)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Health Checks](#health-checks)
3. [REST API Endpoints](#rest-api-endpoints)
4. [GraphQL API](#graphql-api)
5. [gRPC API](#grpc-api)
6. [WebSocket API](#websocket-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## 🎯 Overview

The Customer Service manages customer profiles, preferences, addresses, loyalty points, and customer-related data for the Rubizz Hotel Inn platform. It provides:

- **Customer Management**: Create, read, update, and manage customer profiles
- **Profile Management**: Customer profile information and preferences
- **Address Management**: Multiple addresses per customer
- **Loyalty Points**: Earn and redeem loyalty points
- **Customer Search**: Search and filter customers with pagination
- **Customer Statistics**: Analytics and statistics
- **Activity Tracking**: Track customer activities

### Supported Protocols

- ✅ **REST API**: HTTP/HTTPS requests
- ✅ **GraphQL**: GraphQL queries and mutations
- ✅ **gRPC**: Internal service-to-service communication
- ✅ **WebSocket**: Real-time subscriptions (via GraphQL)
- ✅ **Kafka**: Event publishing and consumption

---

## 🏥 Health Checks

### Check Service Health

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-11T10:30:00Z",
  "service": "rubizz-customer-service",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Detailed Health Check

```http
GET /health/detailed
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "kafka": "connected",
  "timestamp": "2025-11-11T10:30:00Z"
}
```

### Check Readiness

```http
GET /health/ready
```

### Check Liveness

```http
GET /health/live
```

### Get Metrics

```http
GET /metrics
```

---

## 📡 REST API Endpoints

### Customer Management Endpoints

#### Create Customer

Create a new customer profile.

```http
POST /api/v1/customers
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "userId": "user123"
}
```

**Field Validation:**
- `email`: Required, valid email format
- `phone`: Required, valid phone number format
- `firstName`: Required, string (1-50 characters)
- `lastName`: Required, string (1-50 characters)
- `dateOfBirth`: Optional, valid date format (YYYY-MM-DD)
- `gender`: Optional, enum: "MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"
- `userId`: Optional, reference to user account

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "customer": {
      "id": "customer123",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "gender": "MALE",
      "isVerified": false,
      "isActive": true,
      "loyaltyPoints": 0,
      "createdAt": "2025-11-11T10:30:00Z"
    }
  }
}
```

---

#### Get Customer by ID

Get customer details by ID.

```http
GET /api/v1/customers/:customerId
```

**Path Parameters:**
- `customerId`: Customer ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "customer": {
      "id": "customer123",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "gender": "MALE",
      "isVerified": true,
      "isActive": true,
      "loyaltyPoints": 500,
      "lastLoginAt": "2025-11-11T10:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-11-11T10:30:00Z"
    }
  }
}
```

---

#### Get Customer by Email

Get customer details by email address.

```http
GET /api/v1/customers/email?email=customer@example.com
```

**Query Parameters:**
- `email`: Required, customer email address

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "customer": {
      "id": "customer123",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

#### Update Customer

Update customer information.

```http
PUT /api/v1/customers/:customerId
Content-Type: application/json
```

**Path Parameters:**
- `customerId`: Customer ID

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321",
  "dateOfBirth": "1990-01-01"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "customer": {
      "id": "customer123",
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "+1987654321",
      "updatedAt": "2025-11-11T11:00:00Z"
    }
  }
}
```

---

#### Delete Customer

Soft delete a customer (marks as inactive).

```http
DELETE /api/v1/customers/:customerId
```

**Path Parameters:**
- `customerId`: Customer ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

#### Search Customers

Search and filter customers with pagination.

```http
GET /api/v1/customers/search?page=1&limit=10&q=john&isActive=true&isVerified=true
```

**Query Parameters:**
- `page`: Optional, page number (default: 1)
- `limit`: Optional, items per page (default: 10, max: 100)
- `sortBy`: Optional, field to sort by (default: "createdAt")
- `sortOrder`: Optional, "asc" or "desc" (default: "desc")
- `q`: Optional, search query (searches email, firstName, lastName, phone)
- `isActive`: Optional, filter by active status (true/false)
- `isVerified`: Optional, filter by verified status (true/false)
- `gender`: Optional, filter by gender
- `minLoyaltyPoints`: Optional, minimum loyalty points
- `maxLoyaltyPoints`: Optional, maximum loyalty points

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "customers": [
      {
        "id": "customer123",
        "email": "customer@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "loyaltyPoints": 500,
        "isActive": true,
        "isVerified": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

#### Get Customer Statistics

Get overall customer statistics.

```http
GET /api/v1/customers/stats
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer statistics retrieved successfully",
  "data": {
    "stats": {
      "totalCustomers": 1000,
      "verifiedCustomers": 850,
      "activeCustomers": 900,
      "newCustomersThisMonth": 50,
      "newCustomersThisWeek": 15,
      "newCustomersToday": 3,
      "averageLoyaltyPoints": 250,
      "topCustomersByPoints": [
        {
          "customerId": "customer123",
          "points": 5000
        }
      ]
    }
  }
}
```

---

### Customer Profile Endpoints

#### Update Customer Profile

Update customer profile information.

```http
PUT /api/v1/customers/:customerId/profile
Content-Type: application/json
```

**Path Parameters:**
- `customerId`: Customer ID

**Request Body:**
```json
{
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Frequent traveler and food enthusiast",
  "dietaryRestrictions": "vegetarian",
  "specialRequests": "Prefer quiet rooms",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567890",
    "relationship": "Spouse"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer profile updated successfully",
  "data": {
    "profile": {
      "customerId": "customer123",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Frequent traveler and food enthusiast",
      "dietaryRestrictions": "vegetarian",
      "specialRequests": "Prefer quiet rooms",
      "updatedAt": "2025-11-11T11:00:00Z"
    }
  }
}
```

---

#### Update Customer Preferences

Update customer preferences.

```http
PUT /api/v1/customers/:customerId/preferences
Content-Type: application/json
```

**Path Parameters:**
- `customerId`: Customer ID

**Request Body:**
```json
{
  "language": "en",
  "currency": "USD",
  "timezone": "America/New_York",
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "marketingEmails": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer preferences updated successfully",
  "data": {
    "preferences": {
      "customerId": "customer123",
      "language": "en",
      "currency": "USD",
      "timezone": "America/New_York",
      "emailNotifications": true,
      "smsNotifications": false,
      "pushNotifications": true,
      "marketingEmails": true,
      "updatedAt": "2025-11-11T11:00:00Z"
    }
  }
}
```

---

### Customer Address Endpoints

#### Add Customer Address

Add a new address for a customer.

```http
POST /api/v1/customers/:customerId/addresses
Content-Type: application/json
```

**Path Parameters:**
- `customerId`: Customer ID

**Request Body:**
```json
{
  "type": "HOME",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

**Field Validation:**
- `type`: Required, enum: "HOME", "WORK", "OTHER"
- `addressLine1`: Required, string
- `addressLine2`: Optional, string
- `city`: Required, string
- `state`: Required, string
- `postalCode`: Required, string
- `country`: Required, string
- `isDefault`: Optional, boolean (default: false)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Customer address added successfully",
  "data": {
    "address": {
      "id": "address123",
      "customerId": "customer123",
      "type": "HOME",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2025-11-11T10:30:00Z"
    }
  }
}
```

---

#### Get Customer Addresses

Get all addresses for a customer.

```http
GET /api/v1/customers/:customerId/addresses
```

**Path Parameters:**
- `customerId`: Customer ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer addresses retrieved successfully",
  "data": {
    "addresses": [
      {
        "id": "address123",
        "customerId": "customer123",
        "type": "HOME",
        "addressLine1": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA",
        "isDefault": true,
        "isActive": true
      }
    ]
  }
}
```

---

#### Update Customer Address

Update an existing customer address.

```http
PUT /api/v1/addresses/:addressId
Content-Type: application/json
```

**Path Parameters:**
- `addressId`: Address ID

**Request Body:**
```json
{
  "addressLine1": "456 New Street",
  "city": "Boston",
  "state": "MA",
  "postalCode": "02101"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer address updated successfully",
  "data": {
    "address": {
      "id": "address123",
      "addressLine1": "456 New Street",
      "city": "Boston",
      "state": "MA",
      "postalCode": "02101",
      "updatedAt": "2025-11-11T11:00:00Z"
    }
  }
}
```

---

#### Delete Customer Address

Delete a customer address.

```http
DELETE /api/v1/addresses/:addressId
```

**Path Parameters:**
- `addressId`: Address ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer address deleted successfully"
}
```

---

### Customer Verification Endpoints

#### Verify Customer

Verify a customer account.

```http
POST /api/v1/customers/:customerId/verify
```

**Path Parameters:**
- `customerId`: Customer ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer verified successfully",
  "data": {
    "customer": {
      "id": "customer123",
      "isVerified": true,
      "verifiedAt": "2025-11-11T11:00:00Z"
    }
  }
}
```

---

#### Update Last Login

Update customer's last login timestamp.

```http
POST /api/v1/customers/:customerId/last-login
Content-Type: application/json
```

**Path Parameters:**
- `customerId`: Customer ID

**Request Body:**
```json
{
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Last login updated successfully"
}
```

---

## 🔍 GraphQL API

### Endpoint

```
POST /graphql
```

### Queries

#### Get Customer

```graphql
query {
  customer(id: "customer123") {
    id
    email
    firstName
    lastName
    phone
    dateOfBirth
    gender
    isVerified
    isActive
    loyaltyPoints
    profile {
      avatar
      bio
      dietaryRestrictions
    }
    preferences {
      language
      currency
      timezone
      emailNotifications
    }
    addresses {
      id
      type
      addressLine1
      city
      state
      postalCode
      country
      isDefault
    }
    createdAt
  }
}
```

#### Get Customer by Email

```graphql
query {
  customerByEmail(email: "customer@example.com") {
    id
    email
    firstName
    lastName
    loyaltyPoints
  }
}
```

#### Search Customers

```graphql
query {
  searchCustomers(
    filters: {
      q: "john"
      isActive: true
      isVerified: true
    }
    pagination: {
      page: 1
      limit: 10
      sortBy: "createdAt"
      sortOrder: DESC
    }
  ) {
    customers {
      id
      email
      firstName
      lastName
      loyaltyPoints
    }
    pagination {
      page
      limit
      total
      pages
      hasNext
      hasPrev
    }
  }
}
```

#### Get Customer Statistics

```graphql
query {
  customerStats {
    totalCustomers
    verifiedCustomers
    activeCustomers
    newCustomersThisMonth
    averageLoyaltyPoints
  }
}
```

### Mutations

#### Create Customer

```graphql
mutation {
  createCustomer(input: {
    email: "customer@example.com"
    phone: "+1234567890"
    firstName: "John"
    lastName: "Doe"
    dateOfBirth: "1990-01-01"
    gender: MALE
    userId: "user123"
  }) {
    id
    email
    firstName
    lastName
    createdAt
  }
}
```

#### Update Customer

```graphql
mutation {
  updateCustomer(id: "customer123", input: {
    firstName: "Jane"
    lastName: "Smith"
  }) {
    id
    firstName
    lastName
    updatedAt
  }
}
```

#### Update Customer Profile

```graphql
mutation {
  updateCustomerProfile(customerId: "customer123", input: {
    avatar: "https://example.com/avatar.jpg"
    bio: "Updated bio"
    dietaryRestrictions: "vegetarian"
  }) {
    customerId
    avatar
    bio
    updatedAt
  }
}
```

#### Update Customer Preferences

```graphql
mutation {
  updateCustomerPreferences(customerId: "customer123", input: {
    language: "es"
    currency: "EUR"
    emailNotifications: true
  }) {
    customerId
    language
    currency
    updatedAt
  }
}
```

#### Add Customer Address

```graphql
mutation {
  addCustomerAddress(customerId: "customer123", input: {
    type: HOME
    addressLine1: "123 Main Street"
    city: "New York"
    state: "NY"
    postalCode: "10001"
    country: "USA"
    isDefault: true
  }) {
    id
    type
    addressLine1
    city
    isDefault
  }
}
```

#### Add Loyalty Points

```graphql
mutation {
  addLoyaltyPoints(customerId: "customer123", input: {
    points: 100
    type: EARNED
    description: "Booking reward"
    referenceId: "booking123"
  }) {
    id
    points
    type
    totalPoints
  }
}
```

#### Redeem Loyalty Points

```graphql
mutation {
  redeemLoyaltyPoints(customerId: "customer123", input: {
    points: 50
    description: "Discount applied"
    referenceId: "order123"
  }) {
    id
    points
    totalPoints
  }
}
```

### Subscriptions

#### Customer Updates

```graphql
subscription {
  customerUpdated(customerId: "customer123") {
    id
    firstName
    lastName
    loyaltyPoints
    updatedAt
  }
}
```

#### Loyalty Points Updates

```graphql
subscription {
  loyaltyPointsUpdated(customerId: "customer123") {
    customerId
    points
    type
    totalPoints
    createdAt
  }
}
```

---

## 🔌 gRPC API

### Service Definition

The Customer Service exposes gRPC endpoints for internal service-to-service communication.

**Proto File**: `proto/customer.proto`

### Methods

#### CreateCustomer

```protobuf
rpc CreateCustomer(CreateCustomerRequest) returns (CreateCustomerResponse);
```

#### GetCustomerById

```protobuf
rpc GetCustomerById(GetCustomerByIdRequest) returns (GetCustomerByIdResponse);
```

#### GetCustomerByEmail

```protobuf
rpc GetCustomerByEmail(GetCustomerByEmailRequest) returns (GetCustomerByEmailResponse);
```

#### UpdateCustomer

```protobuf
rpc UpdateCustomer(UpdateCustomerRequest) returns (UpdateCustomerResponse);
```

#### SearchCustomers

```protobuf
rpc SearchCustomers(SearchCustomersRequest) returns (SearchCustomersResponse);
```

#### AddLoyaltyPoints

```protobuf
rpc AddLoyaltyPoints(AddLoyaltyPointsRequest) returns (AddLoyaltyPointsResponse);
```

#### RedeemLoyaltyPoints

```protobuf
rpc RedeemLoyaltyPoints(RedeemLoyaltyPointsRequest) returns (RedeemLoyaltyPointsResponse);
```

### gRPC Endpoint

```
localhost:50053
```

---

## 🔌 WebSocket API

WebSocket support is provided via GraphQL subscriptions and native WebSocket.

### Connection

```
ws://localhost:3006/graphql-ws
```

### Real-Time Events

- `customer.created` - New customer created
- `customer.updated` - Customer information updated
- `customer.verified` - Customer verified
- `loyalty.points.added` - Loyalty points added
- `loyalty.points.redeemed` - Loyalty points redeemed
- `address.added` - New address added
- `address.updated` - Address updated

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-11-11T10:30:00Z",
  "requestId": "req_1234567890"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication failed)
- `403` - Forbidden (authorization failed)
- `404` - Not Found
- `409` - Conflict (customer already exists)
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `CUSTOMER_NOT_FOUND` - Customer not found
- `CUSTOMER_ALREADY_EXISTS` - Customer already exists
- `ADDRESS_NOT_FOUND` - Address not found
- `INSUFFICIENT_LOYALTY_POINTS` - Not enough loyalty points to redeem
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 🚦 Rate Limiting

### Rate Limit Configuration

Different endpoints have different rate limits:

- **Customer Creation**: 10 requests per 15 minutes per IP
- **Profile Updates**: 20 requests per 15 minutes per user
- **Search**: 100 requests per 15 minutes per IP
- **General Endpoints**: 100 requests per 15 minutes per IP

### Rate Limit Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1636632000
```

---

## 🔒 Loyalty Points System

### Earning Points

Points can be earned through:
- Hotel bookings
- Restaurant orders
- Hall bookings
- Food delivery orders
- Special promotions

### Redeeming Points

Points can be redeemed for:
- Discounts on bookings
- Free items
- Special offers

### Point Expiry

- Points expire after 1 year of inactivity
- Expiry dates are tracked per point transaction

---

## 📝 Request/Response Format

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <access_token> (for protected endpoints)
X-Request-ID: req_1234567890 (optional, auto-generated)
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful" (optional),
  "timestamp": "2025-11-11T10:30:00Z",
  "requestId": "req_1234567890"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE" (optional),
  "timestamp": "2025-11-11T10:30:00Z",
  "requestId": "req_1234567890"
}
```

---

## 🔗 Related Documentation

- [API Gateway Documentation](../rubizz-api-gateway/API_DOCUMENTATION.md)
- [Auth Service Documentation](../rubizz-auth-service/API_DOCUMENTATION.md)
- [User Service Documentation](../rubizz-user-service/API_DOCUMENTATION.md)
- [Development and Production Guide](../DEVELOPMENT_AND_PRODUCTION_GUIDE.md)

---

## 📊 Integration Examples

### Frontend Integration (React/Next.js)

```typescript
// Get customer profile
const getCustomerProfile = async (customerId: string, token: string) => {
  const response = await fetch(`http://localhost:3006/api/v1/customers/${customerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.data.customer;
  } else {
    throw new Error(data.message);
  }
};

// Add loyalty points
const addLoyaltyPoints = async (customerId: string, points: number, token: string) => {
  const response = await fetch(`http://localhost:3006/api/v1/customers/${customerId}/loyalty/points`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      points,
      type: 'EARNED',
      description: 'Booking reward',
    }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
```

### Frontend Integration (Angular)

```typescript
// Get customer profile
getCustomerProfile(customerId: string): Observable<Customer> {
  return this.http.get<CustomerResponse>(
    `http://localhost:3006/api/v1/customers/${customerId}`
  ).pipe(
    map(response => response.data.customer)
  );
}

// Update customer preferences
updateCustomerPreferences(customerId: string, preferences: any): Observable<CustomerPreferences> {
  return this.http.put<CustomerPreferencesResponse>(
    `http://localhost:3006/api/v1/customers/${customerId}/preferences`,
    preferences
  ).pipe(
    map(response => response.data.preferences)
  );
}
```

---

**Last Updated**: November 2025  
**Version**: 1.0.0

