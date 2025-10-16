import { PubSub } from 'graphql-subscriptions';
import { GraphQLScalarType, Kind } from 'graphql';

export const pubsub = new PubSub();

// Event topics for subscriptions
export const CUSTOMER_CREATED = 'CUSTOMER_CREATED';
export const CUSTOMER_UPDATED = 'CUSTOMER_UPDATED';
export const CUSTOMER_DELETED = 'CUSTOMER_DELETED';
export const CUSTOMER_ACTIVITY_LOGGED = 'CUSTOMER_ACTIVITY_LOGGED';
export const CUSTOMER_NOTIFICATION_SENT = 'CUSTOMER_NOTIFICATION_SENT';
export const CUSTOMER_LOYALTY_POINTS_UPDATED = 'CUSTOMER_LOYALTY_POINTS_UPDATED';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.getTime(); // Convert outgoing Date to integer timestamp
    }
    return null;
  },
  parseValue(value: any) {
    if (typeof value === 'number') {
      return new Date(value); // Convert incoming integer to Date
    }
    return null;
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST object to integer and then to Date
    }
    return null;
  },
});

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast: any) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        return ast.fields.reduce((acc: any, field: any) => ({
          ...acc,
          [field.name.value]: jsonScalar.parseLiteral(field.value),
        }), {});
      case Kind.LIST:
        return ast.values.map((value: any) => jsonScalar.parseLiteral(value));
      default:
        return null;
    }
  },
});

const resolvers: any = {
  Date: dateScalar,
  JSON: jsonScalar,
  Query: {
    health: async (_: any, __: any, { dataSources }: any) => {
      const health = await dataSources.healthController.getHealthStatus();
      return {
        status: health.status,
        timestamp: new Date(health.timestamp),
        uptime: health.uptime,
        database: health.database,
        redis: health.redis,
        services: health.services,
      };
    },
    customer: async (_: any, { id }: any, { dataSources }: any) => {
      const customer = await dataSources.customerController.getCustomerByIdGraphQL(id);
      return customer;
    },
    customerByEmail: async (_: any, { email }: any, { dataSources }: any) => {
      const customer = await dataSources.customerController.getCustomerByEmailGraphQL(email);
      return customer;
    },
    customers: async (_: any, { query, email, phone, isVerified, isActive, page, limit, sortBy, sortOrder }: any, { dataSources }: any) => {
      const filters = { query, email, phone, isVerified, isActive };
      const pagination = { page, limit, sortBy, sortOrder };
      const result = await dataSources.customerController.searchCustomersGraphQL(filters, pagination);
      return result;
    },
    customerAddresses: async (_: any, { customerId }: any, { dataSources }: any) => {
      const addresses = await dataSources.customerController.getCustomerAddressesGraphQL(customerId);
      return addresses;
    },
    customerStats: async (_: any, __: any, { dataSources }: any) => {
      const stats = await dataSources.customerController.getCustomerStatsGraphQL();
      return stats;
    },
  },
  Mutation: {
    createCustomer: async (_: any, { input }: any, { dataSources }: any) => {
      const customer = await dataSources.customerController.createCustomerGraphQL(input);
      pubsub.publish(CUSTOMER_CREATED, { customerCreated: customer });
      return customer;
    },
    updateCustomer: async (_: any, { id, input }: any, { dataSources }: any) => {
      const customer = await dataSources.customerController.updateCustomerGraphQL(id, input);
      pubsub.publish(CUSTOMER_UPDATED, { customerUpdated: customer, customerId: id });
      return customer;
    },
    deleteCustomer: async (_: any, { id }: any, { dataSources }: any) => {
      await dataSources.customerController.deleteCustomerGraphQL(id);
      pubsub.publish(CUSTOMER_DELETED, { customerDeleted: id });
      return true;
    },
    updateCustomerProfile: async (_: any, { customerId, input }: any, { dataSources }: any) => {
      const profile = await dataSources.customerController.updateCustomerProfileGraphQL(customerId, input);
      pubsub.publish(CUSTOMER_UPDATED, { customerUpdated: { id: customerId, profile }, customerId });
      return profile;
    },
    updateCustomerPreferences: async (_: any, { customerId, input }: any, { dataSources }: any) => {
      const preferences = await dataSources.customerController.updateCustomerPreferencesGraphQL(customerId, input);
      pubsub.publish(CUSTOMER_UPDATED, { customerUpdated: { id: customerId, preferences }, customerId });
      return preferences;
    },
    addCustomerAddress: async (_: any, { customerId, input }: any, { dataSources }: any) => {
      const address = await dataSources.customerController.addCustomerAddressGraphQL(customerId, input);
      pubsub.publish(CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'ADDRESS_ADDED', description: 'New address added', metadata: input } });
      return address;
    },
    updateCustomerAddress: async (_: any, { addressId, input }: any, { dataSources }: any) => {
      const address = await dataSources.customerController.updateCustomerAddressGraphQL(addressId, input);
      pubsub.publish(CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId: address.customerId, activityType: 'ADDRESS_UPDATED', description: 'Address updated', metadata: input } });
      return address;
    },
    deleteCustomerAddress: async (_: any, { addressId }: any, { dataSources }: any) => {
      const customerId = await dataSources.customerController.deleteCustomerAddressGraphQL(addressId);
      pubsub.publish(CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'ADDRESS_DELETED', description: 'Address deleted', metadata: { addressId } } });
      return true;
    },
    verifyCustomer: async (_: any, { customerId }: any, { dataSources }: any) => {
      const customer = await dataSources.customerController.verifyCustomerGraphQL(customerId);
      pubsub.publish(CUSTOMER_UPDATED, { customerUpdated: customer, customerId });
      pubsub.publish(CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'EMAIL_VERIFIED', description: 'Customer email verified' } });
      return customer;
    },
    updateLastLogin: async (_: any, { customerId, ipAddress, userAgent }: any, { dataSources }: any) => {
      await dataSources.customerController.updateLastLoginGraphQL(customerId, ipAddress, userAgent);
      pubsub.publish(CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'LOGIN', description: 'Customer logged in', metadata: { ipAddress, userAgent } } });
      return true;
    },
    addLoyaltyPoints: async (_: any, { customerId, input }: any, { dataSources }: any) => {
      const loyaltyPoint = await dataSources.customerController.addLoyaltyPointsGraphQL(customerId, input);
      pubsub.publish(CUSTOMER_LOYALTY_POINTS_UPDATED, { customerLoyaltyPointsUpdated: loyaltyPoint, customerId });
      pubsub.publish(CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'LOYALTY_POINTS_EARNED', description: `Earned ${input.points} loyalty points`, metadata: input } });
      return loyaltyPoint;
    },
    redeemLoyaltyPoints: async (_: any, { customerId, input }: any, { dataSources }: any) => {
      const loyaltyPoint = await dataSources.customerController.redeemLoyaltyPointsGraphQL(customerId, input);
      pubsub.publish(CUSTOMER_LOYALTY_POINTS_UPDATED, { customerLoyaltyPointsUpdated: loyaltyPoint, customerId });
      pubsub.publish(CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'LOYALTY_POINTS_REDEEMED', description: `Redeemed ${input.points} loyalty points`, metadata: input } });
      return loyaltyPoint;
    },
    logCustomerActivity: async (_: any, { customerId, input }: any, { dataSources }: any) => {
      await dataSources.customerController.logCustomerActivityGraphQL(customerId, input);
      pubsub.publish(CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, ...input } });
      return true;
    },
    sendCustomerNotification: async (_: any, { customerId, input }: any, { dataSources }: any) => {
      const notification = await dataSources.customerController.sendCustomerNotificationGraphQL(customerId, input);
      pubsub.publish(CUSTOMER_NOTIFICATION_SENT, { customerNotificationSent: notification, customerId });
      return notification;
    },
  },
  Subscription: {
    customerCreated: {
      subscribe: () => pubsub.asyncIterator([CUSTOMER_CREATED]),
    },
    customerUpdated: {
      subscribe: (_: any, { customerId: _customerId }: any) => pubsub.asyncIterator([CUSTOMER_UPDATED]),
      resolve: (payload: any, { customerId }: any) => {
        if (payload.customerId === customerId) {
          return payload.customerUpdated;
        }
        return null;
      },
    },
    customerDeleted: {
      subscribe: () => pubsub.asyncIterator([CUSTOMER_DELETED]),
    },
    customerActivityLogged: {
      subscribe: (_: any, { customerId: _customerId }: any) => pubsub.asyncIterator([CUSTOMER_ACTIVITY_LOGGED]),
      resolve: (payload: any, { customerId }: any) => {
        if (payload.customerId === customerId) {
          return payload.customerActivityLogged;
        }
        return null;
      },
    },
    customerNotificationSent: {
      subscribe: (_: any, { customerId: _customerId }: any) => pubsub.asyncIterator([CUSTOMER_NOTIFICATION_SENT]),
      resolve: (payload: any, { customerId }: any) => {
        if (payload.customerId === customerId) {
          return payload.customerNotificationSent;
        }
        return null;
      },
    },
    customerLoyaltyPointsUpdated: {
      subscribe: (_: any, { customerId: _customerId }: any) => pubsub.asyncIterator([CUSTOMER_LOYALTY_POINTS_UPDATED]),
      resolve: (payload: any, { customerId }: any) => {
        if (payload.customerId === customerId) {
          return payload.customerLoyaltyPointsUpdated;
        }
        return null;
      },
    },
  },
};

export default resolvers;