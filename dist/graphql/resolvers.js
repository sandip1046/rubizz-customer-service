"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOMER_LOYALTY_POINTS_UPDATED = exports.CUSTOMER_NOTIFICATION_SENT = exports.CUSTOMER_ACTIVITY_LOGGED = exports.CUSTOMER_DELETED = exports.CUSTOMER_UPDATED = exports.CUSTOMER_CREATED = exports.pubsub = void 0;
const graphql_subscriptions_1 = require("graphql-subscriptions");
const graphql_1 = require("graphql");
exports.pubsub = new graphql_subscriptions_1.PubSub();
exports.CUSTOMER_CREATED = 'CUSTOMER_CREATED';
exports.CUSTOMER_UPDATED = 'CUSTOMER_UPDATED';
exports.CUSTOMER_DELETED = 'CUSTOMER_DELETED';
exports.CUSTOMER_ACTIVITY_LOGGED = 'CUSTOMER_ACTIVITY_LOGGED';
exports.CUSTOMER_NOTIFICATION_SENT = 'CUSTOMER_NOTIFICATION_SENT';
exports.CUSTOMER_LOYALTY_POINTS_UPDATED = 'CUSTOMER_LOYALTY_POINTS_UPDATED';
const dateScalar = new graphql_1.GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
        if (value instanceof Date) {
            return value.getTime();
        }
        return null;
    },
    parseValue(value) {
        if (typeof value === 'number') {
            return new Date(value);
        }
        return null;
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.INT) {
            return new Date(parseInt(ast.value, 10));
        }
        return null;
    },
});
const jsonScalar = new graphql_1.GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value) {
        return value;
    },
    parseValue(value) {
        return value;
    },
    parseLiteral(ast) {
        switch (ast.kind) {
            case graphql_1.Kind.STRING:
                return JSON.parse(ast.value);
            case graphql_1.Kind.OBJECT:
                return ast.fields.reduce((acc, field) => ({
                    ...acc,
                    [field.name.value]: jsonScalar.parseLiteral(field.value),
                }), {});
            case graphql_1.Kind.LIST:
                return ast.values.map((value) => jsonScalar.parseLiteral(value));
            default:
                return null;
        }
    },
});
const resolvers = {
    Date: dateScalar,
    JSON: jsonScalar,
    Query: {
        health: async (_, __, { dataSources }) => {
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
        customer: async (_, { id }, { dataSources }) => {
            const customer = await dataSources.customerController.getCustomerByIdGraphQL(id);
            return customer;
        },
        customerByEmail: async (_, { email }, { dataSources }) => {
            const customer = await dataSources.customerController.getCustomerByEmailGraphQL(email);
            return customer;
        },
        customers: async (_, { query, email, phone, isVerified, isActive, page, limit, sortBy, sortOrder }, { dataSources }) => {
            const filters = { query, email, phone, isVerified, isActive };
            const pagination = { page, limit, sortBy, sortOrder };
            const result = await dataSources.customerController.searchCustomersGraphQL(filters, pagination);
            return result;
        },
        customerAddresses: async (_, { customerId }, { dataSources }) => {
            const addresses = await dataSources.customerController.getCustomerAddressesGraphQL(customerId);
            return addresses;
        },
        customerStats: async (_, __, { dataSources }) => {
            const stats = await dataSources.customerController.getCustomerStatsGraphQL();
            return stats;
        },
    },
    Mutation: {
        createCustomer: async (_, { input }, { dataSources }) => {
            const customer = await dataSources.customerController.createCustomerGraphQL(input);
            exports.pubsub.publish(exports.CUSTOMER_CREATED, { customerCreated: customer });
            return customer;
        },
        updateCustomer: async (_, { id, input }, { dataSources }) => {
            const customer = await dataSources.customerController.updateCustomerGraphQL(id, input);
            exports.pubsub.publish(exports.CUSTOMER_UPDATED, { customerUpdated: customer, customerId: id });
            return customer;
        },
        deleteCustomer: async (_, { id }, { dataSources }) => {
            await dataSources.customerController.deleteCustomerGraphQL(id);
            exports.pubsub.publish(exports.CUSTOMER_DELETED, { customerDeleted: id });
            return true;
        },
        updateCustomerProfile: async (_, { customerId, input }, { dataSources }) => {
            const profile = await dataSources.customerController.updateCustomerProfileGraphQL(customerId, input);
            exports.pubsub.publish(exports.CUSTOMER_UPDATED, { customerUpdated: { id: customerId, profile }, customerId });
            return profile;
        },
        updateCustomerPreferences: async (_, { customerId, input }, { dataSources }) => {
            const preferences = await dataSources.customerController.updateCustomerPreferencesGraphQL(customerId, input);
            exports.pubsub.publish(exports.CUSTOMER_UPDATED, { customerUpdated: { id: customerId, preferences }, customerId });
            return preferences;
        },
        addCustomerAddress: async (_, { customerId, input }, { dataSources }) => {
            const address = await dataSources.customerController.addCustomerAddressGraphQL(customerId, input);
            exports.pubsub.publish(exports.CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'ADDRESS_ADDED', description: 'New address added', metadata: input } });
            return address;
        },
        updateCustomerAddress: async (_, { addressId, input }, { dataSources }) => {
            const address = await dataSources.customerController.updateCustomerAddressGraphQL(addressId, input);
            exports.pubsub.publish(exports.CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId: address.customerId, activityType: 'ADDRESS_UPDATED', description: 'Address updated', metadata: input } });
            return address;
        },
        deleteCustomerAddress: async (_, { addressId }, { dataSources }) => {
            const customerId = await dataSources.customerController.deleteCustomerAddressGraphQL(addressId);
            exports.pubsub.publish(exports.CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'ADDRESS_DELETED', description: 'Address deleted', metadata: { addressId } } });
            return true;
        },
        verifyCustomer: async (_, { customerId }, { dataSources }) => {
            const customer = await dataSources.customerController.verifyCustomerGraphQL(customerId);
            exports.pubsub.publish(exports.CUSTOMER_UPDATED, { customerUpdated: customer, customerId });
            exports.pubsub.publish(exports.CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'EMAIL_VERIFIED', description: 'Customer email verified' } });
            return customer;
        },
        updateLastLogin: async (_, { customerId, ipAddress, userAgent }, { dataSources }) => {
            await dataSources.customerController.updateLastLoginGraphQL(customerId, ipAddress, userAgent);
            exports.pubsub.publish(exports.CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'LOGIN', description: 'Customer logged in', metadata: { ipAddress, userAgent } } });
            return true;
        },
        addLoyaltyPoints: async (_, { customerId, input }, { dataSources }) => {
            const loyaltyPoint = await dataSources.customerController.addLoyaltyPointsGraphQL(customerId, input);
            exports.pubsub.publish(exports.CUSTOMER_LOYALTY_POINTS_UPDATED, { customerLoyaltyPointsUpdated: loyaltyPoint, customerId });
            exports.pubsub.publish(exports.CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'LOYALTY_POINTS_EARNED', description: `Earned ${input.points} loyalty points`, metadata: input } });
            return loyaltyPoint;
        },
        redeemLoyaltyPoints: async (_, { customerId, input }, { dataSources }) => {
            const loyaltyPoint = await dataSources.customerController.redeemLoyaltyPointsGraphQL(customerId, input);
            exports.pubsub.publish(exports.CUSTOMER_LOYALTY_POINTS_UPDATED, { customerLoyaltyPointsUpdated: loyaltyPoint, customerId });
            exports.pubsub.publish(exports.CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, activityType: 'LOYALTY_POINTS_REDEEMED', description: `Redeemed ${input.points} loyalty points`, metadata: input } });
            return loyaltyPoint;
        },
        logCustomerActivity: async (_, { customerId, input }, { dataSources }) => {
            await dataSources.customerController.logCustomerActivityGraphQL(customerId, input);
            exports.pubsub.publish(exports.CUSTOMER_ACTIVITY_LOGGED, { customerActivityLogged: { customerId, ...input } });
            return true;
        },
        sendCustomerNotification: async (_, { customerId, input }, { dataSources }) => {
            const notification = await dataSources.customerController.sendCustomerNotificationGraphQL(customerId, input);
            exports.pubsub.publish(exports.CUSTOMER_NOTIFICATION_SENT, { customerNotificationSent: notification, customerId });
            return notification;
        },
    },
    Subscription: {
        customerCreated: {
            subscribe: () => exports.pubsub.asyncIterator([exports.CUSTOMER_CREATED]),
        },
        customerUpdated: {
            subscribe: (_, { customerId: _customerId }) => exports.pubsub.asyncIterator([exports.CUSTOMER_UPDATED]),
            resolve: (payload, { customerId }) => {
                if (payload.customerId === customerId) {
                    return payload.customerUpdated;
                }
                return null;
            },
        },
        customerDeleted: {
            subscribe: () => exports.pubsub.asyncIterator([exports.CUSTOMER_DELETED]),
        },
        customerActivityLogged: {
            subscribe: (_, { customerId: _customerId }) => exports.pubsub.asyncIterator([exports.CUSTOMER_ACTIVITY_LOGGED]),
            resolve: (payload, { customerId }) => {
                if (payload.customerId === customerId) {
                    return payload.customerActivityLogged;
                }
                return null;
            },
        },
        customerNotificationSent: {
            subscribe: (_, { customerId: _customerId }) => exports.pubsub.asyncIterator([exports.CUSTOMER_NOTIFICATION_SENT]),
            resolve: (payload, { customerId }) => {
                if (payload.customerId === customerId) {
                    return payload.customerNotificationSent;
                }
                return null;
            },
        },
        customerLoyaltyPointsUpdated: {
            subscribe: (_, { customerId: _customerId }) => exports.pubsub.asyncIterator([exports.CUSTOMER_LOYALTY_POINTS_UPDATED]),
            resolve: (payload, { customerId }) => {
                if (payload.customerId === customerId) {
                    return payload.customerLoyaltyPointsUpdated;
                }
                return null;
            },
        },
    },
};
exports.default = resolvers;
//# sourceMappingURL=resolvers.js.map