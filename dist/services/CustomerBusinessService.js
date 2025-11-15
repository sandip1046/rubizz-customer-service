"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerBusinessService = void 0;
const Customer_1 = require("../models/Customer");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
const RedisService_1 = __importDefault(require("./RedisService"));
const EmailService_1 = __importDefault(require("./EmailService"));
class CustomerBusinessService {
    constructor(kafkaService) {
        this.customerModel = new Customer_1.CustomerModel();
        this.redisService = new RedisService_1.default();
        this.emailService = new EmailService_1.default();
        this.kafkaService = kafkaService;
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');
    }
    async createCustomer(customerData, requestId) {
        try {
            const existingCustomer = await this.customerModel.getCustomerByEmail(customerData.email);
            if (existingCustomer) {
                throw new Error('Customer with this email already exists');
            }
            if (customerData.phone) {
                const existingPhoneCustomer = await this.customerModel.getCustomerByPhone(customerData.phone);
                if (existingPhoneCustomer) {
                    throw new Error('Customer with this phone number already exists');
                }
            }
            const customer = await this.customerModel.createCustomer(customerData);
            await this.redisService.setCache(customer.id, customer, 3600);
            await this.emailService.sendWelcomeEmail(customer.email, customer.firstName);
            if (this.kafkaService) {
                await this.kafkaService.publishCustomerCreatedEvent(customer, requestId);
            }
            this.logger.info('Customer created successfully', {
                customerId: customer.id,
                email: customer.email,
                requestId
            });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to create customer:', error);
            throw error;
        }
    }
    async getCustomerById(customerId) {
        try {
            const cachedCustomer = await this.redisService.getCache(customerId);
            if (cachedCustomer) {
                return cachedCustomer;
            }
            const customer = await this.customerModel.getCustomerById(customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }
            await this.redisService.setCache(customerId, customer, 3600);
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to get customer by ID:', error);
            throw error;
        }
    }
    async getCustomerByEmail(email) {
        try {
            const customer = await this.customerModel.getCustomerByEmail(email);
            if (!customer) {
                throw new Error('Customer not found');
            }
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to get customer by email:', error);
            throw error;
        }
    }
    async updateCustomer(customerId, updateData, requestId) {
        try {
            const existingCustomer = await this.customerModel.getCustomerById(customerId);
            if (!existingCustomer) {
                throw new Error('Customer not found');
            }
            if (updateData.phone && updateData.phone !== existingCustomer.phone) {
                const existingPhoneCustomer = await this.customerModel.getCustomerByPhone(updateData.phone);
                if (existingPhoneCustomer && existingPhoneCustomer.id !== customerId) {
                    throw new Error('Customer with this phone number already exists');
                }
            }
            const customer = await this.customerModel.updateCustomer(customerId, updateData);
            await this.redisService.setCache(customerId, customer, 3600);
            if (this.kafkaService) {
                await this.kafkaService.publishCustomerUpdatedEvent(customer, requestId);
            }
            this.logger.info('Customer updated successfully', { customerId, requestId });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to update customer:', error);
            throw error;
        }
    }
    async deleteCustomer(customerId, requestId) {
        try {
            const existingCustomer = await this.customerModel.getCustomerById(customerId);
            if (!existingCustomer) {
                throw new Error('Customer not found');
            }
            await this.customerModel.deleteCustomer(customerId);
            await this.redisService.deleteCache(customerId);
            this.logger.info('Customer deleted successfully', { customerId, requestId });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to delete customer:', error);
            throw error;
        }
    }
    async searchCustomers(filters, pagination) {
        try {
            const result = await this.customerModel.searchCustomers(filters, pagination);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to search customers:', error);
            throw error;
        }
    }
    async getCustomerStats() {
        try {
            const stats = await this.customerModel.getCustomerStats();
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get customer statistics:', error);
            throw error;
        }
    }
    async updateCustomerProfile(customerId, profileData, requestId) {
        try {
            const profile = await this.customerModel.updateCustomerProfile(customerId, profileData);
            const customer = await this.getCustomerById(customerId);
            await this.redisService.setCache(customerId, customer, 3600);
            this.logger.info('Customer profile updated successfully', { customerId, requestId });
            return profile;
        }
        catch (error) {
            this.logger.error('Failed to update customer profile:', error);
            throw error;
        }
    }
    async updateCustomerPreferences(customerId, preferencesData, requestId) {
        try {
            const preferences = await this.customerModel.updateCustomerPreferences(customerId, preferencesData);
            const customer = await this.getCustomerById(customerId);
            await this.redisService.setCache(customerId, customer, 3600);
            this.logger.info('Customer preferences updated successfully', { customerId, requestId });
            return preferences;
        }
        catch (error) {
            this.logger.error('Failed to update customer preferences:', error);
            throw error;
        }
    }
    async addCustomerAddress(customerId, addressData, requestId) {
        try {
            const address = await this.customerModel.addCustomerAddress(customerId, addressData);
            const customer = await this.getCustomerById(customerId);
            await this.redisService.setCache(customerId, customer, 3600);
            if (this.kafkaService) {
                await this.kafkaService.publishCustomerAddressAddedEvent(customerId, address, requestId);
            }
            this.logger.info('Customer address added successfully', { customerId, addressId: address.id, requestId });
            return address;
        }
        catch (error) {
            this.logger.error('Failed to add customer address:', error);
            throw error;
        }
    }
    async getCustomerAddresses(customerId) {
        try {
            const addresses = await this.customerModel.getCustomerAddresses(customerId);
            return addresses;
        }
        catch (error) {
            this.logger.error('Failed to get customer addresses:', error);
            throw error;
        }
    }
    async updateCustomerAddress(addressId, addressData, requestId) {
        try {
            const address = await this.customerModel.updateCustomerAddress(addressId, addressData);
            const customer = await this.getCustomerById(address.customerId);
            await this.redisService.setCache(address.customerId, customer, 3600);
            this.logger.info('Customer address updated successfully', { addressId, requestId });
            return address;
        }
        catch (error) {
            this.logger.error('Failed to update customer address:', error);
            throw error;
        }
    }
    async deleteCustomerAddress(addressId, requestId) {
        try {
            const customerId = await this.customerModel.deleteCustomerAddress(addressId);
            const customer = await this.getCustomerById(customerId);
            await this.redisService.setCache(customerId, customer, 3600);
            this.logger.info('Customer address deleted successfully', { addressId, customerId, requestId });
            return customerId;
        }
        catch (error) {
            this.logger.error('Failed to delete customer address:', error);
            throw error;
        }
    }
    async verifyCustomer(customerId, requestId) {
        try {
            const customer = await this.customerModel.verifyCustomer(customerId);
            await this.redisService.setCache(customerId, customer, 3600);
            if (this.kafkaService) {
                await this.kafkaService.publishCustomerVerifiedEvent(customer, requestId);
            }
            this.logger.info('Customer verified successfully', { customerId, requestId });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to verify customer:', error);
            throw error;
        }
    }
    async updateLastLogin(customerId, ipAddress, userAgent, requestId) {
        try {
            await this.customerModel.updateLastLogin(customerId, ipAddress, userAgent);
            const customer = await this.getCustomerById(customerId);
            await this.redisService.setCache(customerId, customer, 3600);
            this.logger.info('Last login updated successfully', { customerId, requestId });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to update last login:', error);
            throw error;
        }
    }
    async addLoyaltyPoints(customerId, points, type, description, referenceId, requestId) {
        try {
            const loyaltyPoint = await this.customerModel.addLoyaltyPoints(customerId, points, type, description, referenceId);
            const customer = await this.getCustomerById(customerId);
            await this.redisService.setCache(customerId, customer, 3600);
            this.logger.info('Loyalty points added successfully', { customerId, points, type, requestId });
            return loyaltyPoint;
        }
        catch (error) {
            this.logger.error('Failed to add loyalty points:', error);
            throw error;
        }
    }
    async redeemLoyaltyPoints(customerId, points, description, referenceId, requestId) {
        try {
            const loyaltyPoint = await this.customerModel.redeemLoyaltyPoints(customerId, points, description, referenceId);
            const customer = await this.getCustomerById(customerId);
            await this.redisService.setCache(customerId, customer, 3600);
            this.logger.info('Loyalty points redeemed successfully', { customerId, points, requestId });
            return loyaltyPoint;
        }
        catch (error) {
            this.logger.error('Failed to redeem loyalty points:', error);
            throw error;
        }
    }
    async logCustomerActivity(customerId, activityType, description, metadata, ipAddress, userAgent, requestId) {
        try {
            await this.customerModel.logCustomerActivity(customerId, activityType, description, metadata, ipAddress, userAgent);
            this.logger.info('Customer activity logged successfully', { customerId, activityType, requestId });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to log customer activity:', error);
            throw error;
        }
    }
    async sendCustomerNotification(customerId, type, title, message, metadata, requestId) {
        try {
            const notification = await this.customerModel.sendCustomerNotification(customerId, type, title, message, metadata);
            if (this.kafkaService) {
                await this.kafkaService.publishCustomerNotificationSentEvent(customerId, notification, requestId);
            }
            this.logger.info('Customer notification sent successfully', { customerId, type, requestId });
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to send customer notification:', error);
            throw error;
        }
    }
}
exports.CustomerBusinessService = CustomerBusinessService;
exports.default = CustomerBusinessService;
//# sourceMappingURL=CustomerBusinessService.js.map