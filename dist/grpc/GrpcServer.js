"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcServer = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
const config_1 = require("../config/config");
const path_1 = __importDefault(require("path"));
class GrpcServer {
    constructor(customerController, healthController) {
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        this.server = new grpc.Server();
        this.customerController = customerController;
        this.healthController = healthController;
    }
    async initialize() {
        try {
            const protoDefinition = await this.loadProtoDefinition();
            const serviceDefinition = protoDefinition['rubizz.customer']['CustomerService'];
            this.server.addService(serviceDefinition.service, {
                CreateCustomer: this.handleCreateCustomer.bind(this),
                GetCustomer: this.handleGetCustomer.bind(this),
                UpdateCustomer: this.handleUpdateCustomer.bind(this),
                DeleteCustomer: this.handleDeleteCustomer.bind(this),
                SearchCustomers: this.handleSearchCustomers.bind(this),
                GetCustomerByEmail: this.handleGetCustomerByEmail.bind(this),
                GetCustomerStats: this.handleGetCustomerStats.bind(this),
                UpdateCustomerProfile: this.handleUpdateCustomerProfile.bind(this),
                UpdateCustomerPreferences: this.handleUpdateCustomerPreferences.bind(this),
                AddCustomerAddress: this.handleAddCustomerAddress.bind(this),
                GetCustomerAddresses: this.handleGetCustomerAddresses.bind(this),
                UpdateCustomerAddress: this.handleUpdateCustomerAddress.bind(this),
                DeleteCustomerAddress: this.handleDeleteCustomerAddress.bind(this),
                VerifyCustomer: this.handleVerifyCustomer.bind(this),
                UpdateLastLogin: this.handleUpdateLastLogin.bind(this),
                AddLoyaltyPoints: this.handleAddLoyaltyPoints.bind(this),
                RedeemLoyaltyPoints: this.handleRedeemLoyaltyPoints.bind(this),
                GetLoyaltyPoints: this.handleGetLoyaltyPoints.bind(this),
                SendNotification: this.handleSendNotification.bind(this),
                GetNotifications: this.handleGetNotifications.bind(this),
                HealthCheck: this.handleHealthCheck.bind(this),
            });
            this.logger.info('gRPC server initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize gRPC server', error);
            throw error;
        }
    }
    async loadProtoDefinition() {
        try {
            const protoPath = path_1.default.join(__dirname, '../../proto/customer.proto');
            const packageDefinition = protoLoader.loadSync(protoPath, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: [
                    path_1.default.join(__dirname, '../../proto'),
                    path_1.default.join(__dirname, '../../../rubizz-api-gateway/proto')
                ]
            });
            return grpc.loadPackageDefinition(packageDefinition);
        }
        catch (error) {
            this.logger.error('Failed to load proto definition', error);
            throw error;
        }
    }
    async start() {
        return new Promise((resolve, reject) => {
            const port = config_1.config.grpc?.port || 50053;
            this.server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
                if (error) {
                    this.logger.error('Failed to bind gRPC server', error);
                    reject(error);
                    return;
                }
                this.server.start();
                this.logger.info(`gRPC server started on port ${port}`);
                resolve();
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            this.server.forceShutdown();
            this.logger.info('gRPC server stopped');
            resolve();
        });
    }
    async handleCreateCustomer(call, callback) {
        try {
            const request = call.request;
            const customerData = {
                email: request.email,
                phone: request.phone,
                firstName: request.first_name,
                lastName: request.last_name,
                dateOfBirth: request.date_of_birth ? new Date(request.date_of_birth) : undefined,
                gender: request.gender,
                emergencyContact: request.emergency_contact,
                dietaryRestrictions: request.dietary_restrictions,
                specialRequests: request.special_requests,
            };
            const customer = await this.customerController.createCustomer({ body: customerData }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer created successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                customer: this.mapCustomerToProto(customer)
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to create customer via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to create customer'
            });
        }
    }
    async handleGetCustomer(call, callback) {
        try {
            const request = call.request;
            const customer = await this.customerController.getCustomerById({ params: { customerId: request.customer_id } }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer retrieved successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                customer: this.mapCustomerToProto(customer)
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to get customer via gRPC', error);
            callback({
                code: grpc.status.NOT_FOUND,
                message: 'Customer not found'
            });
        }
    }
    async handleUpdateCustomer(call, callback) {
        try {
            const request = call.request;
            const updateData = {
                phone: request.phone,
                firstName: request.first_name,
                lastName: request.last_name,
                dateOfBirth: request.date_of_birth ? new Date(request.date_of_birth) : undefined,
                gender: request.gender,
            };
            const customer = await this.customerController.updateCustomer({
                params: { customerId: request.customer_id },
                body: updateData
            }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer updated successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                customer: this.mapCustomerToProto(customer)
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to update customer via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to update customer'
            });
        }
    }
    async handleDeleteCustomer(call, callback) {
        try {
            const request = call.request;
            await this.customerController.deleteCustomer({ params: { customerId: request.customer_id } }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer deleted successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                }
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to delete customer via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to delete customer'
            });
        }
    }
    async handleSearchCustomers(call, callback) {
        try {
            const request = call.request;
            const filters = {
                email: request.email,
                phone: request.phone,
                firstName: request.first_name,
                lastName: request.last_name,
                isVerified: request.is_verified,
                isActive: request.is_active,
            };
            const result = await this.customerController.searchCustomersGraphQL(filters, {
                page: request.pagination?.page || 1,
                limit: request.pagination?.limit || 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customers retrieved successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                customers: result.customers?.map((customer) => this.mapCustomerToProto(customer)) || [],
                pagination: {
                    page: result.pagination?.page || 1,
                    limit: result.pagination?.limit || 10,
                    total: result.pagination?.total || 0,
                    total_pages: result.pagination?.pages || 0,
                    has_next: (result.pagination?.page || 1) < (result.pagination?.pages || 0),
                    has_prev: (result.pagination?.page || 1) > 1
                }
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to search customers via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to search customers'
            });
        }
    }
    async handleGetCustomerByEmail(call, callback) {
        try {
            const request = call.request;
            const customer = await this.customerController.getCustomerByEmail({ query: { email: request.email } }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer retrieved successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                customer: this.mapCustomerToProto(customer)
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to get customer by email via gRPC', error);
            callback({
                code: grpc.status.NOT_FOUND,
                message: 'Customer not found'
            });
        }
    }
    async handleGetCustomerStats(_call, callback) {
        try {
            const stats = await this.customerController.getCustomerStatsGraphQL();
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer statistics retrieved successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                stats: {
                    total_customers: stats.totalCustomers || 0,
                    verified_customers: stats.verifiedCustomers || 0,
                    active_customers: stats.activeCustomers || 0,
                    new_customers_this_month: stats.newCustomersThisMonth || 0,
                    new_customers_this_week: stats.newCustomersThisWeek || 0,
                    new_customers_today: stats.newCustomersToday || 0
                }
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to get customer stats via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to get customer statistics'
            });
        }
    }
    async handleUpdateCustomerProfile(call, callback) {
        try {
            const request = call.request;
            const profileData = {
                avatar: request.avatar,
                bio: request.bio,
                preferences: request.preferences,
                emergencyContact: request.emergency_contact,
                dietaryRestrictions: request.dietary_restrictions,
                specialRequests: request.special_requests,
            };
            const profile = await this.customerController.updateCustomerProfile({
                params: { customerId: request.customer_id },
                body: profileData
            }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer profile updated successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                profile: this.mapCustomerProfileToProto(profile)
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to update customer profile via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to update customer profile'
            });
        }
    }
    async handleUpdateCustomerPreferences(call, callback) {
        try {
            const request = call.request;
            const preferencesData = {
                language: request.language,
                currency: request.currency,
                timezone: request.timezone,
                emailNotifications: request.email_notifications,
                smsNotifications: request.sms_notifications,
                pushNotifications: request.push_notifications,
                marketingEmails: request.marketing_emails,
            };
            const preferences = await this.customerController.updateCustomerPreferences({
                params: { customerId: request.customer_id },
                body: preferencesData
            }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer preferences updated successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                preferences: this.mapCustomerPreferencesToProto(preferences)
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to update customer preferences via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to update customer preferences'
            });
        }
    }
    async handleAddCustomerAddress(call, callback) {
        try {
            const request = call.request;
            const addressData = {
                type: request.type,
                addressLine1: request.address_line1,
                addressLine2: request.address_line2,
                city: request.city,
                state: request.state,
                postalCode: request.postal_code,
                country: request.country,
                isDefault: request.is_default,
            };
            const address = await this.customerController.addCustomerAddress({
                params: { customerId: request.customer_id },
                body: addressData
            }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer address added successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                address: this.mapCustomerAddressToProto(address)
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to add customer address via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to add customer address'
            });
        }
    }
    async handleGetCustomerAddresses(call, callback) {
        try {
            const request = call.request;
            const addresses = await this.customerController.getCustomerAddressesGraphQL(request.customer_id);
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer addresses retrieved successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                addresses: addresses.map((address) => this.mapCustomerAddressToProto(address)) || []
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to get customer addresses via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to get customer addresses'
            });
        }
    }
    async handleUpdateCustomerAddress(call, callback) {
        try {
            const request = call.request;
            const addressData = {
                type: request.type,
                addressLine1: request.address_line1,
                addressLine2: request.address_line2,
                city: request.city,
                state: request.state,
                postalCode: request.postal_code,
                country: request.country,
                isDefault: request.is_default,
                isActive: request.is_active,
            };
            const address = await this.customerController.updateCustomerAddress({
                params: { addressId: request.address_id },
                body: addressData
            }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer address updated successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                address: this.mapCustomerAddressToProto(address)
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to update customer address via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to update customer address'
            });
        }
    }
    async handleDeleteCustomerAddress(call, callback) {
        try {
            const request = call.request;
            await this.customerController.deleteCustomerAddress({
                params: { addressId: request.address_id }
            }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer address deleted successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                }
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to delete customer address via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to delete customer address'
            });
        }
    }
    async handleVerifyCustomer(call, callback) {
        try {
            const request = call.request;
            const customer = await this.customerController.verifyCustomer({
                params: { customerId: request.customer_id }
            }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Customer verified successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                customer: this.mapCustomerToProto(customer)
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to verify customer via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to verify customer'
            });
        }
    }
    async handleUpdateLastLogin(call, callback) {
        try {
            const request = call.request;
            await this.customerController.updateLastLogin({
                params: { customerId: request.customer_id }
            }, {}, () => { });
            const response = {
                api_response: {
                    success: true,
                    message: 'Last login updated successfully',
                    timestamp: Date.now(),
                    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                }
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to update last login via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to update last login'
            });
        }
    }
    async handleAddLoyaltyPoints(_call, callback) {
        try {
            callback({
                code: grpc.status.UNIMPLEMENTED,
                message: 'Add loyalty points not implemented yet'
            });
        }
        catch (error) {
            this.logger.error('Failed to add loyalty points via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to add loyalty points'
            });
        }
    }
    async handleRedeemLoyaltyPoints(_call, callback) {
        try {
            callback({
                code: grpc.status.UNIMPLEMENTED,
                message: 'Redeem loyalty points not implemented yet'
            });
        }
        catch (error) {
            this.logger.error('Failed to redeem loyalty points via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to redeem loyalty points'
            });
        }
    }
    async handleGetLoyaltyPoints(_call, callback) {
        try {
            callback({
                code: grpc.status.UNIMPLEMENTED,
                message: 'Get loyalty points not implemented yet'
            });
        }
        catch (error) {
            this.logger.error('Failed to get loyalty points via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to get loyalty points'
            });
        }
    }
    async handleSendNotification(_call, callback) {
        try {
            callback({
                code: grpc.status.UNIMPLEMENTED,
                message: 'Send notification not implemented yet'
            });
        }
        catch (error) {
            this.logger.error('Failed to send notification via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to send notification'
            });
        }
    }
    async handleGetNotifications(_call, callback) {
        try {
            callback({
                code: grpc.status.UNIMPLEMENTED,
                message: 'Get notifications not implemented yet'
            });
        }
        catch (error) {
            this.logger.error('Failed to get notifications via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Failed to get notifications'
            });
        }
    }
    async handleHealthCheck(_call, callback) {
        try {
            const health = await this.healthController.getHealthStatus();
            const response = {
                status: health.status === 'healthy' ? 'healthy' : 'unhealthy',
                message: health.message || 'Service is running',
                timestamp: Date.now(),
                details: {
                    service: 'customer-service',
                    version: '1.0.0',
                    uptime: process.uptime()
                }
            };
            callback(null, response);
        }
        catch (error) {
            this.logger.error('Failed to perform health check via gRPC', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Health check failed'
            });
        }
    }
    mapCustomerToProto(customer) {
        return {
            id: customer.id,
            email: customer.email,
            phone: customer.phone,
            first_name: customer.firstName,
            last_name: customer.lastName,
            date_of_birth: customer.dateOfBirth ? customer.dateOfBirth.getTime() : 0,
            gender: customer.gender,
            is_verified: customer.isVerified,
            is_active: customer.isActive,
            last_login_at: customer.lastLoginAt ? customer.lastLoginAt.getTime() : 0,
            created_at: customer.createdAt ? customer.createdAt.getTime() : 0,
            updated_at: customer.updatedAt ? customer.updatedAt.getTime() : 0,
            profile: customer.profile ? this.mapCustomerProfileToProto(customer.profile) : undefined,
            preferences: customer.preferences ? this.mapCustomerPreferencesToProto(customer.preferences) : undefined,
            addresses: customer.addresses?.map((addr) => this.mapCustomerAddressToProto(addr)) || [],
            loyalty_points: customer.loyaltyPoints?.map((lp) => this.mapCustomerLoyaltyPointToProto(lp)) || [],
            activities: customer.activities?.map((act) => this.mapCustomerActivityToProto(act)) || [],
            notifications: customer.notifications?.map((notif) => this.mapCustomerNotificationToProto(notif)) || []
        };
    }
    mapCustomerProfileToProto(profile) {
        return {
            id: profile.id,
            customer_id: profile.customerId,
            avatar: profile.avatar,
            bio: profile.bio,
            preferences: profile.preferences,
            emergency_contact: profile.emergencyContact,
            dietary_restrictions: profile.dietaryRestrictions,
            special_requests: profile.specialRequests,
            created_at: profile.createdAt ? profile.createdAt.getTime() : 0,
            updated_at: profile.updatedAt ? profile.updatedAt.getTime() : 0
        };
    }
    mapCustomerPreferencesToProto(preferences) {
        return {
            id: preferences.id,
            customer_id: preferences.customerId,
            language: preferences.language,
            currency: preferences.currency,
            timezone: preferences.timezone,
            email_notifications: preferences.emailNotifications,
            sms_notifications: preferences.smsNotifications,
            push_notifications: preferences.pushNotifications,
            marketing_emails: preferences.marketingEmails,
            created_at: preferences.createdAt ? preferences.createdAt.getTime() : 0,
            updated_at: preferences.updatedAt ? preferences.updatedAt.getTime() : 0
        };
    }
    mapCustomerAddressToProto(address) {
        return {
            id: address.id,
            customer_id: address.customerId,
            type: address.type,
            address_line1: address.addressLine1,
            address_line2: address.addressLine2,
            city: address.city,
            state: address.state,
            postal_code: address.postalCode,
            country: address.country,
            is_default: address.isDefault,
            is_active: address.isActive,
            created_at: address.createdAt ? address.createdAt.getTime() : 0,
            updated_at: address.updatedAt ? address.updatedAt.getTime() : 0
        };
    }
    mapCustomerLoyaltyPointToProto(loyaltyPoint) {
        return {
            id: loyaltyPoint.id,
            customer_id: loyaltyPoint.customerId,
            points: loyaltyPoint.points,
            type: loyaltyPoint.type,
            description: loyaltyPoint.description,
            reference_id: loyaltyPoint.referenceId,
            expires_at: loyaltyPoint.expiresAt ? loyaltyPoint.expiresAt.getTime() : 0,
            is_redeemed: loyaltyPoint.isRedeemed,
            redeemed_at: loyaltyPoint.redeemedAt ? loyaltyPoint.redeemedAt.getTime() : 0,
            created_at: loyaltyPoint.createdAt ? loyaltyPoint.createdAt.getTime() : 0
        };
    }
    mapCustomerActivityToProto(activity) {
        return {
            id: activity.id,
            customer_id: activity.customerId,
            activity_type: activity.activityType,
            description: activity.description,
            metadata: activity.metadata,
            ip_address: activity.ipAddress,
            user_agent: activity.userAgent,
            created_at: activity.createdAt ? activity.createdAt.getTime() : 0
        };
    }
    mapCustomerNotificationToProto(notification) {
        return {
            id: notification.id,
            customer_id: notification.customerId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            is_read: notification.isRead,
            read_at: notification.readAt ? notification.readAt.getTime() : 0,
            metadata: notification.metadata,
            created_at: notification.createdAt ? notification.createdAt.getTime() : 0
        };
    }
}
exports.GrpcServer = GrpcServer;
exports.default = GrpcServer;
//# sourceMappingURL=GrpcServer.js.map