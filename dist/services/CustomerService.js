"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const Customer_1 = require("../models/Customer");
const DatabaseConnection_1 = __importDefault(require("../database/DatabaseConnection"));
const RedisService_1 = __importDefault(require("./RedisService"));
const EmailService_1 = __importDefault(require("./EmailService"));
const config_1 = require("../config/config");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
const uuid_1 = require("uuid");
class CustomerService {
    constructor() {
        const prisma = DatabaseConnection_1.default.getInstance().getPrismaClient();
        this.customerModel = new Customer_1.CustomerModel(prisma);
        this.emailService = new EmailService_1.default();
        this.redisService = new RedisService_1.default();
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
    }
    async createCustomer(customerData) {
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
            let verificationToken = null;
            if (config_1.config.customer.verificationRequired && !customer.isVerified) {
                verificationToken = (0, uuid_1.v4)();
                await this.redisService.setCache(`verification:${verificationToken}`, customer.id, 24 * 60 * 60);
            }
            if (config_1.config.notifications.email) {
                try {
                    await this.emailService.sendWelcomeEmail(customer.email, `${customer.firstName} ${customer.lastName}`);
                }
                catch (emailError) {
                    this.logger.warn('Failed to send welcome email:', emailError);
                }
            }
            if (verificationToken) {
                try {
                    await this.emailService.sendVerificationEmail(customer.email, `${customer.firstName} ${customer.lastName}`, verificationToken);
                }
                catch (emailError) {
                    this.logger.warn('Failed to send verification email:', emailError);
                }
            }
            await this.logCustomerActivity(customer.id, 'CUSTOMER_CREATED', 'Customer account created');
            this.logger.info('Customer created successfully', { customerId: customer.id, email: customer.email });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to create customer:', error);
            throw error;
        }
    }
    async verifyCustomerEmail(verificationToken) {
        try {
            const customerId = await this.redisService.getCache(`verification:${verificationToken}`);
            if (!customerId) {
                throw new Error('Invalid or expired verification token');
            }
            const customer = await this.customerModel.verifyCustomer(customerId);
            await this.redisService.deleteCache(`verification:${verificationToken}`);
            await this.logCustomerActivity(customerId, 'EMAIL_VERIFIED', 'Email address verified');
            this.logger.info('Customer email verified successfully', { customerId });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to verify customer email:', error);
            throw error;
        }
    }
    async updateCustomerProfile(customerId, profileData) {
        try {
            const profile = await this.customerModel.updateCustomerProfile(customerId, profileData);
            await this.logCustomerActivity(customerId, 'PROFILE_UPDATE', 'Customer profile updated');
            this.logger.info('Customer profile updated successfully', { customerId });
            return profile;
        }
        catch (error) {
            this.logger.error('Failed to update customer profile:', error);
            throw error;
        }
    }
    async updateCustomerPreferences(customerId, preferencesData) {
        try {
            const preferences = await this.customerModel.updateCustomerPreferences(customerId, preferencesData);
            await this.logCustomerActivity(customerId, 'PREFERENCES_UPDATE', 'Customer preferences updated');
            this.logger.info('Customer preferences updated successfully', { customerId });
            return preferences;
        }
        catch (error) {
            this.logger.error('Failed to update customer preferences:', error);
            throw error;
        }
    }
    async addCustomerAddress(customerId, addressData) {
        try {
            const address = await this.customerModel.addCustomerAddress(customerId, addressData);
            await this.logCustomerActivity(customerId, 'ADDRESS_ADDED', 'New address added');
            this.logger.info('Customer address added successfully', { customerId, addressId: address.id });
            return address;
        }
        catch (error) {
            this.logger.error('Failed to add customer address:', error);
            throw error;
        }
    }
    async updateCustomerAddress(addressId, addressData) {
        try {
            const address = await this.customerModel.updateCustomerAddress(addressId, addressData);
            await this.logCustomerActivity(address.customerId, 'ADDRESS_UPDATED', 'Address updated');
            this.logger.info('Customer address updated successfully', { addressId });
            return address;
        }
        catch (error) {
            this.logger.error('Failed to update customer address:', error);
            throw error;
        }
    }
    async deleteCustomerAddress(addressId) {
        try {
            const address = await this.customerModel.getCustomerById(addressId);
            await this.customerModel.deleteCustomerAddress(addressId);
            if (address) {
                await this.logCustomerActivity(address.id, 'ADDRESS_DELETED', 'Address deleted');
            }
            this.logger.info('Customer address deleted successfully', { addressId });
        }
        catch (error) {
            this.logger.error('Failed to delete customer address:', error);
            throw error;
        }
    }
    async searchCustomers(filters, pagination = {}) {
        try {
            const cacheKey = `search:${JSON.stringify({ filters, pagination })}`;
            const cachedResult = await this.redisService.getCache(cacheKey);
            if (cachedResult) {
                this.logger.debug('Customer search result retrieved from cache', { cacheKey });
                return JSON.parse(cachedResult);
            }
            const result = await this.customerModel.searchCustomers(filters, pagination);
            await this.redisService.setCache(cacheKey, result, 300);
            this.logger.info('Customer search completed', {
                total: result.pagination.total,
                page: result.pagination.page,
                filters
            });
            return result;
        }
        catch (error) {
            this.logger.error('Failed to search customers:', error);
            throw error;
        }
    }
    async getCustomerWithDetails(customerId) {
        try {
            const customer = await this.customerModel.getCustomerById(customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }
            const [addresses, loyaltyPoints, recentActivities] = await Promise.all([
                this.customerModel.getCustomerAddresses(customerId),
                this.getCustomerLoyaltyPoints(customerId),
                this.getCustomerRecentActivities(customerId),
            ]);
            return {
                ...customer,
                addresses,
                loyaltyPoints,
                recentActivities,
            };
        }
        catch (error) {
            this.logger.error('Failed to get customer with details:', error);
            throw error;
        }
    }
    async getCustomerLoyaltyPoints(customerId) {
        try {
            const prisma = DatabaseConnection_1.default.getInstance().getPrismaClient();
            const [totalPoints, recentPoints] = await Promise.all([
                prisma.customerLoyaltyPoint.aggregate({
                    where: { customerId, isRedeemed: false },
                    _sum: { points: true },
                }),
                prisma.customerLoyaltyPoint.findMany({
                    where: { customerId },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
            ]);
            return {
                total: totalPoints._sum.points || 0,
                recent: recentPoints,
            };
        }
        catch (error) {
            this.logger.error('Failed to get customer loyalty points:', error);
            throw error;
        }
    }
    async getCustomerRecentActivities(customerId, limit = 10) {
        try {
            const prisma = DatabaseConnection_1.default.getInstance().getPrismaClient();
            const activities = await prisma.customerActivity.findMany({
                where: { customerId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            return activities;
        }
        catch (error) {
            this.logger.error('Failed to get customer recent activities:', error);
            throw error;
        }
    }
    async addLoyaltyPoints(customerId, points, type, description, referenceId) {
        try {
            const prisma = DatabaseConnection_1.default.getInstance().getPrismaClient();
            const loyaltyPoint = await prisma.customerLoyaltyPoint.create({
                data: {
                    customerId,
                    points,
                    type: type,
                    description,
                    referenceId: referenceId || null,
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                },
            });
            await this.logCustomerActivity(customerId, 'LOYALTY_POINTS_EARNED', `Earned ${points} loyalty points`);
            this.logger.info('Loyalty points added successfully', { customerId, points, type });
            return loyaltyPoint;
        }
        catch (error) {
            this.logger.error('Failed to add loyalty points:', error);
            throw error;
        }
    }
    async redeemLoyaltyPoints(customerId, points, description, referenceId) {
        try {
            const loyaltyPoints = await this.getCustomerLoyaltyPoints(customerId);
            if (loyaltyPoints.total < points) {
                throw new Error('Insufficient loyalty points');
            }
            const prisma = DatabaseConnection_1.default.getInstance().getPrismaClient();
            const loyaltyPoint = await prisma.customerLoyaltyPoint.create({
                data: {
                    customerId,
                    points: -points,
                    type: 'REDEEMED',
                    description,
                    referenceId: referenceId || null,
                    isRedeemed: true,
                    redeemedAt: new Date(),
                },
            });
            await this.logCustomerActivity(customerId, 'LOYALTY_POINTS_REDEEMED', `Redeemed ${points} loyalty points`);
            this.logger.info('Loyalty points redeemed successfully', { customerId, points });
            return loyaltyPoint;
        }
        catch (error) {
            this.logger.error('Failed to redeem loyalty points:', error);
            throw error;
        }
    }
    async logCustomerActivity(customerId, activityType, description, metadata) {
        try {
            const prisma = DatabaseConnection_1.default.getInstance().getPrismaClient();
            await prisma.customerActivity.create({
                data: {
                    customerId,
                    activityType: activityType,
                    description,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to log customer activity:', error);
        }
    }
    async sendCustomerNotification(customerId, type, title, message, metadata) {
        try {
            const prisma = DatabaseConnection_1.default.getInstance().getPrismaClient();
            const notification = await prisma.customerNotification.create({
                data: {
                    customerId,
                    type: type,
                    title,
                    message,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                },
            });
            const customer = await this.customerModel.getCustomerById(customerId);
            if (customer && config_1.config.notifications.email) {
                try {
                    await this.emailService.sendNotificationEmail(customer.email, `${customer.firstName} ${customer.lastName}`, { title, message, type });
                }
                catch (emailError) {
                    this.logger.warn('Failed to send notification email:', emailError);
                }
            }
            this.logger.info('Customer notification sent successfully', { customerId, type });
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to send customer notification:', error);
            throw error;
        }
    }
    async getCustomerStatistics() {
        try {
            const stats = await this.customerModel.getCustomerStats();
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get customer statistics:', error);
            throw error;
        }
    }
    async updateLastLogin(customerId, ipAddress, userAgent) {
        try {
            await this.customerModel.updateLastLogin(customerId);
            await this.logCustomerActivity(customerId, 'LOGIN', 'Customer logged in', {
                ipAddress,
                userAgent,
                timestamp: new Date().toISOString(),
            });
            this.logger.info('Last login updated successfully', { customerId });
        }
        catch (error) {
            this.logger.error('Failed to update last login:', error);
            throw error;
        }
    }
    async deleteCustomer(customerId) {
        try {
            await this.customerModel.deleteCustomer(customerId);
            await this.logCustomerActivity(customerId, 'ACCOUNT_DELETED', 'Customer account deleted');
            this.logger.info('Customer deleted successfully', { customerId });
        }
        catch (error) {
            this.logger.error('Failed to delete customer:', error);
            throw error;
        }
    }
}
exports.CustomerService = CustomerService;
exports.default = CustomerService;
//# sourceMappingURL=CustomerService.js.map