"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql) `
  # Common types
  type ApiResponse {
    success: Boolean!
    message: String
    timestamp: String!
    requestId: String
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
    hasNext: Boolean!
    hasPrev: Boolean!
  }

  # Customer types
  type Customer {
    id: ID!
    email: String!
    phone: String
    firstName: String!
    lastName: String!
    dateOfBirth: String
    gender: Gender
    isVerified: Boolean!
    isActive: Boolean!
    lastLoginAt: String
    createdAt: String!
    updatedAt: String!
    profile: CustomerProfile
    preferences: CustomerPreferences
    addresses: [CustomerAddress!]!
    loyaltyPoints: [CustomerLoyaltyPoint!]!
    activities: [CustomerActivity!]!
    notifications: [CustomerNotification!]!
  }

  type CustomerProfile {
    id: ID!
    customerId: ID!
    avatar: String
    bio: String
    preferences: String # JSON string
    emergencyContact: String
    dietaryRestrictions: String
    specialRequests: String
    createdAt: String!
    updatedAt: String!
  }

  type CustomerPreferences {
    id: ID!
    customerId: ID!
    language: String!
    currency: String!
    timezone: String!
    emailNotifications: Boolean!
    smsNotifications: Boolean!
    pushNotifications: Boolean!
    marketingEmails: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type CustomerAddress {
    id: ID!
    customerId: ID!
    type: AddressType!
    addressLine1: String!
    addressLine2: String
    city: String!
    state: String!
    postalCode: String!
    country: String!
    isDefault: Boolean!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type CustomerLoyaltyPoint {
    id: ID!
    customerId: ID!
    points: Int!
    type: LoyaltyPointType!
    description: String!
    referenceId: String
    expiresAt: String
    isRedeemed: Boolean!
    redeemedAt: String
    createdAt: String!
  }

  type CustomerActivity {
    id: ID!
    customerId: ID!
    activityType: ActivityType!
    description: String!
    metadata: String # JSON string
    ipAddress: String
    userAgent: String
    createdAt: String!
  }

  type CustomerNotification {
    id: ID!
    customerId: ID!
    type: NotificationType!
    title: String!
    message: String!
    isRead: Boolean!
    readAt: String
    metadata: String # JSON string
    createdAt: String!
  }

  type CustomerStats {
    totalCustomers: Int!
    verifiedCustomers: Int!
    activeCustomers: Int!
    newCustomersThisMonth: Int!
    newCustomersThisWeek: Int!
    newCustomersToday: Int!
  }

  # Enums
  enum Gender {
    MALE
    FEMALE
    OTHER
    PREFER_NOT_TO_SAY
  }

  enum AddressType {
    HOME
    WORK
    BILLING
    SHIPPING
    OTHER
  }

  enum LoyaltyPointType {
    EARNED
    REDEEMED
    EXPIRED
    BONUS
    REFERRAL
  }

  enum ActivityType {
    LOGIN
    LOGOUT
    PROFILE_UPDATE
    BOOKING_CREATED
    ORDER_PLACED
    REVIEW_POSTED
    PASSWORD_CHANGED
    EMAIL_VERIFIED
    PHONE_VERIFIED
  }

  enum NotificationType {
    BOOKING_CONFIRMATION
    ORDER_UPDATE
    PAYMENT_RECEIPT
    PROMOTION
    REMINDER
    SYSTEM_ALERT
    REVIEW_REQUEST
    LOYALTY_POINTS
  }

  # Input types
  input CreateCustomerInput {
    email: String!
    phone: String
    firstName: String!
    lastName: String!
    dateOfBirth: String
    gender: Gender
    emergencyContact: String
    dietaryRestrictions: String
    specialRequests: String
  }

  input UpdateCustomerInput {
    phone: String
    firstName: String
    lastName: String
    dateOfBirth: String
    gender: Gender
  }

  input UpdateCustomerProfileInput {
    avatar: String
    bio: String
    preferences: String
    emergencyContact: String
    dietaryRestrictions: String
    specialRequests: String
  }

  input UpdateCustomerPreferencesInput {
    language: String
    currency: String
    timezone: String
    emailNotifications: Boolean
    smsNotifications: Boolean
    pushNotifications: Boolean
    marketingEmails: Boolean
  }

  input AddCustomerAddressInput {
    type: AddressType!
    addressLine1: String!
    addressLine2: String
    city: String!
    state: String!
    postalCode: String!
    country: String!
    isDefault: Boolean
  }

  input UpdateCustomerAddressInput {
    type: AddressType
    addressLine1: String
    addressLine2: String
    city: String
    state: String
    postalCode: String
    country: String
    isDefault: Boolean
    isActive: Boolean
  }

  input CustomerSearchFilters {
    email: String
    phone: String
    firstName: String
    lastName: String
    isVerified: Boolean
    isActive: Boolean
  }

  input PaginationInput {
    page: Int
    limit: Int
    sortBy: String
    sortOrder: String
  }

  # Response types
  type CreateCustomerResponse {
    apiResponse: ApiResponse!
    customer: Customer
  }

  type GetCustomerResponse {
    apiResponse: ApiResponse!
    customer: Customer
  }

  type UpdateCustomerResponse {
    apiResponse: ApiResponse!
    customer: Customer
  }

  type DeleteCustomerResponse {
    apiResponse: ApiResponse!
  }

  type SearchCustomersResponse {
    apiResponse: ApiResponse!
    customers: [Customer!]!
    pagination: PaginationInfo!
  }

  type GetCustomerByEmailResponse {
    apiResponse: ApiResponse!
    customer: Customer
  }

  type GetCustomerStatsResponse {
    apiResponse: ApiResponse!
    stats: CustomerStats!
  }

  type UpdateCustomerProfileResponse {
    apiResponse: ApiResponse!
    profile: CustomerProfile
  }

  type UpdateCustomerPreferencesResponse {
    apiResponse: ApiResponse!
    preferences: CustomerPreferences
  }

  type AddCustomerAddressResponse {
    apiResponse: ApiResponse!
    address: CustomerAddress
  }

  type GetCustomerAddressesResponse {
    apiResponse: ApiResponse!
    addresses: [CustomerAddress!]!
  }

  type UpdateCustomerAddressResponse {
    apiResponse: ApiResponse!
    address: CustomerAddress
  }

  type DeleteCustomerAddressResponse {
    apiResponse: ApiResponse!
  }

  type VerifyCustomerResponse {
    apiResponse: ApiResponse!
    customer: Customer
  }

  type UpdateLastLoginResponse {
    apiResponse: ApiResponse!
  }

  # Subscription types
  type CustomerEvent {
    eventType: String!
    customer: Customer
    timestamp: String!
    metadata: String # JSON string
  }

  type CustomerCreatedEvent {
    eventType: String!
    customer: Customer!
    timestamp: String!
    metadata: String
  }

  type CustomerUpdatedEvent {
    eventType: String!
    customer: Customer!
    timestamp: String!
    metadata: String
  }

  type CustomerVerifiedEvent {
    eventType: String!
    customer: Customer!
    timestamp: String!
    metadata: String
  }

  type CustomerAddressAddedEvent {
    eventType: String!
    customerId: ID!
    address: CustomerAddress!
    timestamp: String!
    metadata: String
  }

  type CustomerNotificationSentEvent {
    eventType: String!
    customerId: ID!
    notification: CustomerNotification!
    timestamp: String!
    metadata: String
  }

  # Root types
  type Query {
    # Health check
    health: String!

    # Customer queries
    getCustomer(customerId: ID!): GetCustomerResponse!
    getCustomerByEmail(email: String!): GetCustomerByEmailResponse!
    searchCustomers(
      filters: CustomerSearchFilters
      pagination: PaginationInput
    ): SearchCustomersResponse!
    getCustomerStats: GetCustomerStatsResponse!

    # Customer profile queries
    getCustomerProfile(customerId: ID!): CustomerProfile
    getCustomerPreferences(customerId: ID!): CustomerPreferences
    getCustomerAddresses(customerId: ID!): GetCustomerAddressesResponse!
  }

  type Mutation {
    # Customer mutations
    createCustomer(input: CreateCustomerInput!): CreateCustomerResponse!
    updateCustomer(customerId: ID!, input: UpdateCustomerInput!): UpdateCustomerResponse!
    deleteCustomer(customerId: ID!): DeleteCustomerResponse!

    # Customer profile mutations
    updateCustomerProfile(
      customerId: ID!
      input: UpdateCustomerProfileInput!
    ): UpdateCustomerProfileResponse!
    updateCustomerPreferences(
      customerId: ID!
      input: UpdateCustomerPreferencesInput!
    ): UpdateCustomerPreferencesResponse!

    # Address mutations
    addCustomerAddress(
      customerId: ID!
      input: AddCustomerAddressInput!
    ): AddCustomerAddressResponse!
    updateCustomerAddress(
      addressId: ID!
      input: UpdateCustomerAddressInput!
    ): UpdateCustomerAddressResponse!
    deleteCustomerAddress(addressId: ID!): DeleteCustomerAddressResponse!

    # Verification mutations
    verifyCustomer(customerId: ID!): VerifyCustomerResponse!
    updateLastLogin(customerId: ID!): UpdateLastLoginResponse!
  }

  type Subscription {
    # Customer events
    customerCreated: CustomerCreatedEvent!
    customerUpdated(customerId: ID): CustomerUpdatedEvent!
    customerVerified(customerId: ID): CustomerVerifiedEvent!
    customerAddressAdded(customerId: ID): CustomerAddressAddedEvent!
    customerNotificationSent(customerId: ID): CustomerNotificationSentEvent!
  }
`;
//# sourceMappingURL=schema.js.map