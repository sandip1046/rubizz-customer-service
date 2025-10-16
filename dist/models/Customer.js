"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModel = void 0;
const config_1 = require("../config/config");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class CustomerModel {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
    }
    async createCustomer(data) {
        try {
            const customer = await this.prisma.customer.create({
                data: {
                    ...data,
                    isVerified: !config_1.config.customer.verificationRequired,
                },
                include: {
                    profile: true,
                    preferences: true,
                    addresses: true,
                },
            });
            this.logger.info('Customer created successfully', { customerId: customer.id });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to create customer:', error);
            throw error;
        }
    }
    async getCustomerById(id) {
        try {
            const customer = await this.prisma.customer.findUnique({
                where: { id },
                include: {
                    profile: true,
                    preferences: true,
                    addresses: true,
                    loyaltyPoints: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                    activities: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to get customer by ID:', error);
            throw error;
        }
    }
    async getCustomerByEmail(email) {
        try {
            const customer = await this.prisma.customer.findUnique({
                where: { email },
                include: {
                    profile: true,
                    preferences: true,
                    addresses: true,
                },
            });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to get customer by email:', error);
            throw error;
        }
    }
    async getCustomerByPhone(phone) {
        try {
            const customer = await this.prisma.customer.findUnique({
                where: { phone },
                include: {
                    profile: true,
                    preferences: true,
                    addresses: true,
                },
            });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to get customer by phone:', error);
            throw error;
        }
    }
    async updateCustomer(id, data) {
        try {
            const customer = await this.prisma.customer.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
                include: {
                    profile: true,
                    preferences: true,
                    addresses: true,
                },
            });
            this.logger.info('Customer updated successfully', { customerId: id });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to update customer:', error);
            throw error;
        }
    }
    async deleteCustomer(id) {
        try {
            const customer = await this.prisma.customer.update({
                where: { id },
                data: {
                    isActive: false,
                    updatedAt: new Date(),
                },
            });
            this.logger.info('Customer deleted successfully', { customerId: id });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to delete customer:', error);
            throw error;
        }
    }
    async searchCustomers(filters, pagination = {}) {
        try {
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = pagination;
            const where = {};
            if (filters.email) {
                where.email = { contains: filters.email, mode: 'insensitive' };
            }
            if (filters.phone) {
                where.phone = { contains: filters.phone };
            }
            if (filters.firstName) {
                where.firstName = { contains: filters.firstName, mode: 'insensitive' };
            }
            if (filters.lastName) {
                where.lastName = { contains: filters.lastName, mode: 'insensitive' };
            }
            if (filters.isVerified !== undefined) {
                where.isVerified = filters.isVerified;
            }
            if (filters.isActive !== undefined) {
                where.isActive = filters.isActive;
            }
            if (filters.createdFrom || filters.createdTo) {
                where.createdAt = {};
                if (filters.createdFrom) {
                    where.createdAt.gte = filters.createdFrom;
                }
                if (filters.createdTo) {
                    where.createdAt.lte = filters.createdTo;
                }
            }
            if (filters.lastLoginFrom || filters.lastLoginTo) {
                where.lastLoginAt = {};
                if (filters.lastLoginFrom) {
                    where.lastLoginAt.gte = filters.lastLoginFrom;
                }
                if (filters.lastLoginTo) {
                    where.lastLoginAt.lte = filters.lastLoginTo;
                }
            }
            const [customers, total] = await Promise.all([
                this.prisma.customer.findMany({
                    where,
                    include: {
                        profile: true,
                        preferences: true,
                        addresses: true,
                    },
                    orderBy: { [sortBy]: sortOrder },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                this.prisma.customer.count({ where }),
            ]);
            return {
                customers,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to search customers:', error);
            throw error;
        }
    }
    async updateCustomerProfile(customerId, data) {
        try {
            const profile = await this.prisma.customerProfile.upsert({
                where: { customerId },
                update: {
                    ...data,
                    updatedAt: new Date(),
                },
                create: {
                    customerId,
                    ...data,
                },
            });
            this.logger.info('Customer profile updated successfully', { customerId });
            return profile;
        }
        catch (error) {
            this.logger.error('Failed to update customer profile:', error);
            throw error;
        }
    }
    async updateCustomerPreferences(customerId, data) {
        try {
            const preferences = await this.prisma.customerPreferences.upsert({
                where: { customerId },
                update: {
                    ...data,
                    updatedAt: new Date(),
                },
                create: {
                    customerId,
                    ...data,
                },
            });
            this.logger.info('Customer preferences updated successfully', { customerId });
            return preferences;
        }
        catch (error) {
            this.logger.error('Failed to update customer preferences:', error);
            throw error;
        }
    }
    async addCustomerAddress(customerId, data) {
        try {
            if (data.isDefault) {
                await this.prisma.customerAddress.updateMany({
                    where: { customerId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            const address = await this.prisma.customerAddress.create({
                data: {
                    customerId,
                    ...data,
                },
            });
            this.logger.info('Customer address added successfully', { customerId, addressId: address.id });
            return address;
        }
        catch (error) {
            this.logger.error('Failed to add customer address:', error);
            throw error;
        }
    }
    async updateCustomerAddress(addressId, data) {
        try {
            if (data.isDefault) {
                const address = await this.prisma.customerAddress.findUnique({
                    where: { id: addressId },
                    select: { customerId: true },
                });
                if (address) {
                    await this.prisma.customerAddress.updateMany({
                        where: { customerId: address.customerId, isDefault: true },
                        data: { isDefault: false },
                    });
                }
            }
            const updatedAddress = await this.prisma.customerAddress.update({
                where: { id: addressId },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
            });
            this.logger.info('Customer address updated successfully', { addressId });
            return updatedAddress;
        }
        catch (error) {
            this.logger.error('Failed to update customer address:', error);
            throw error;
        }
    }
    async deleteCustomerAddress(addressId) {
        try {
            await this.prisma.customerAddress.delete({
                where: { id: addressId },
            });
            this.logger.info('Customer address deleted successfully', { addressId });
        }
        catch (error) {
            this.logger.error('Failed to delete customer address:', error);
            throw error;
        }
    }
    async getCustomerAddresses(customerId) {
        try {
            const addresses = await this.prisma.customerAddress.findMany({
                where: { customerId, isActive: true },
                orderBy: [
                    { isDefault: 'desc' },
                    { createdAt: 'desc' },
                ],
            });
            return addresses;
        }
        catch (error) {
            this.logger.error('Failed to get customer addresses:', error);
            throw error;
        }
    }
    async updateLastLogin(id, ipAddress, userAgent) {
        try {
            await this.prisma.customer.update({
                where: { id },
                data: { lastLoginAt: new Date() },
            });
            if (ipAddress || userAgent) {
                await this.logCustomerActivity(id, 'LOGIN', 'Customer logged in', {
                    ipAddress,
                    userAgent,
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to update last login:', error);
            throw error;
        }
    }
    async verifyCustomer(id) {
        try {
            const customer = await this.prisma.customer.update({
                where: { id },
                data: {
                    isVerified: true,
                    updatedAt: new Date(),
                },
            });
            this.logger.info('Customer verified successfully', { customerId: id });
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to verify customer:', error);
            throw error;
        }
    }
    async getCustomerStats() {
        try {
            const [totalCustomers, verifiedCustomers, activeCustomers, newCustomersThisMonth, newCustomersThisWeek, newCustomersToday,] = await Promise.all([
                this.prisma.customer.count(),
                this.prisma.customer.count({ where: { isVerified: true } }),
                this.prisma.customer.count({ where: { isActive: true } }),
                this.prisma.customer.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        },
                    },
                }),
                this.prisma.customer.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                this.prisma.customer.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
            ]);
            return {
                totalCustomers,
                verifiedCustomers,
                activeCustomers,
                newCustomersThisMonth,
                newCustomersThisWeek,
                newCustomersToday,
                verificationRate: totalCustomers > 0 ? (verifiedCustomers / totalCustomers) * 100 : 0,
            };
        }
        catch (error) {
            this.logger.error('Failed to get customer statistics:', error);
            throw error;
        }
    }
    async addLoyaltyPoints(customerId, points, type, description, referenceId) {
        try {
            const loyaltyPoint = await this.prisma.customerLoyaltyPoint.create({
                data: {
                    customerId,
                    points,
                    type: type,
                    description,
                    referenceId: referenceId || null,
                },
            });
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
            const loyaltyPoint = await this.prisma.customerLoyaltyPoint.create({
                data: {
                    customerId,
                    points: -points,
                    type: 'REDEEMED',
                    description,
                    referenceId: referenceId || null,
                },
            });
            this.logger.info('Loyalty points redeemed successfully', { customerId, points });
            return loyaltyPoint;
        }
        catch (error) {
            this.logger.error('Failed to redeem loyalty points:', error);
            throw error;
        }
    }
    async logCustomerActivity(customerId, activityType, description, metadata, ipAddress, userAgent) {
        try {
            const activity = await this.prisma.customerActivity.create({
                data: {
                    customerId,
                    activityType: activityType,
                    description,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                    ipAddress: ipAddress || null,
                    userAgent: userAgent || null,
                },
            });
            this.logger.info('Customer activity logged successfully', { customerId, activityType });
            return activity;
        }
        catch (error) {
            this.logger.error('Failed to log customer activity:', error);
            throw error;
        }
    }
    async sendCustomerNotification(customerId, type, title, message, metadata) {
        try {
            const notification = await this.prisma.customerNotification.create({
                data: {
                    customerId,
                    type: type,
                    title,
                    message,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                },
            });
            this.logger.info('Customer notification sent successfully', { customerId, type });
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to send customer notification:', error);
            throw error;
        }
    }
}
exports.CustomerModel = CustomerModel;
exports.default = CustomerModel;
//# sourceMappingURL=Customer.js.map