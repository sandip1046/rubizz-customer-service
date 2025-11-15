"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModel = void 0;
const CustomerSchema_1 = require("../schemas/CustomerSchema");
const config_1 = require("../config/config");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class CustomerModel {
    constructor() {
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
    }
    async createCustomer(data) {
        try {
            const customerData = {
                ...data,
                isVerified: !config_1.config.customer.verificationRequired,
            };
            const customer = await CustomerSchema_1.Customer.create(customerData);
            const populatedCustomer = await this.getCustomerById(customer._id);
            this.logger.info('Customer created successfully', { customerId: customer._id });
            return populatedCustomer;
        }
        catch (error) {
            this.logger.error('Failed to create customer:', error);
            throw error;
        }
    }
    async getCustomerById(id) {
        try {
            const customer = await CustomerSchema_1.Customer.findById(id).lean();
            if (!customer) {
                return null;
            }
            const [profile, preferences, addresses, loyaltyPoints, activities] = await Promise.all([
                CustomerSchema_1.CustomerProfile.findOne({ customerId: id }).lean(),
                CustomerSchema_1.CustomerPreferences.findOne({ customerId: id }).lean(),
                CustomerSchema_1.CustomerAddress.find({ customerId: id, isActive: true }).sort({ isDefault: -1, createdAt: -1 }).limit(10).lean(),
                CustomerSchema_1.CustomerLoyaltyPoint.find({ customerId: id }).sort({ createdAt: -1 }).limit(10).lean(),
                CustomerSchema_1.CustomerActivity.find({ customerId: id }).sort({ createdAt: -1 }).limit(10).lean(),
            ]);
            return {
                id: customer._id,
                ...customer,
                profile: profile ? { id: profile._id, ...profile } : null,
                preferences: preferences ? { id: preferences._id, ...preferences } : null,
                addresses: addresses.map(addr => ({ id: addr._id, ...addr })),
                loyaltyPoints: loyaltyPoints.map(lp => ({ id: lp._id, ...lp })),
                activities: activities.map(act => ({ id: act._id, ...act })),
            };
        }
        catch (error) {
            this.logger.error('Failed to get customer by ID:', error);
            throw error;
        }
    }
    async getCustomerByEmail(email) {
        try {
            const customer = await CustomerSchema_1.Customer.findOne({ email: email.toLowerCase() }).lean();
            if (!customer) {
                return null;
            }
            const [profile, preferences, addresses] = await Promise.all([
                CustomerSchema_1.CustomerProfile.findOne({ customerId: customer._id }).lean(),
                CustomerSchema_1.CustomerPreferences.findOne({ customerId: customer._id }).lean(),
                CustomerSchema_1.CustomerAddress.find({ customerId: customer._id, isActive: true }).lean(),
            ]);
            return {
                id: customer._id,
                ...customer,
                profile: profile ? { id: profile._id, ...profile } : null,
                preferences: preferences ? { id: preferences._id, ...preferences } : null,
                addresses: addresses.map(addr => ({ id: addr._id, ...addr })),
            };
        }
        catch (error) {
            this.logger.error('Failed to get customer by email:', error);
            throw error;
        }
    }
    async getCustomerByPhone(phone) {
        try {
            const customer = await CustomerSchema_1.Customer.findOne({ phone }).lean();
            if (!customer) {
                return null;
            }
            const [profile, preferences, addresses] = await Promise.all([
                CustomerSchema_1.CustomerProfile.findOne({ customerId: customer._id }).lean(),
                CustomerSchema_1.CustomerPreferences.findOne({ customerId: customer._id }).lean(),
                CustomerSchema_1.CustomerAddress.find({ customerId: customer._id, isActive: true }).lean(),
            ]);
            return {
                id: customer._id,
                ...customer,
                profile: profile ? { id: profile._id, ...profile } : null,
                preferences: preferences ? { id: preferences._id, ...preferences } : null,
                addresses: addresses.map(addr => ({ id: addr._id, ...addr })),
            };
        }
        catch (error) {
            this.logger.error('Failed to get customer by phone:', error);
            throw error;
        }
    }
    async updateCustomer(id, data) {
        try {
            const customer = await CustomerSchema_1.Customer.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }).lean();
            if (!customer) {
                throw new Error('Customer not found');
            }
            const [profile, preferences, addresses] = await Promise.all([
                CustomerSchema_1.CustomerProfile.findOne({ customerId: id }).lean(),
                CustomerSchema_1.CustomerPreferences.findOne({ customerId: id }).lean(),
                CustomerSchema_1.CustomerAddress.find({ customerId: id, isActive: true }).lean(),
            ]);
            this.logger.info('Customer updated successfully', { customerId: id });
            return {
                id: customer._id,
                ...customer,
                profile: profile ? { id: profile._id, ...profile } : null,
                preferences: preferences ? { id: preferences._id, ...preferences } : null,
                addresses: addresses.map(addr => ({ id: addr._id, ...addr })),
            };
        }
        catch (error) {
            this.logger.error('Failed to update customer:', error);
            throw error;
        }
    }
    async deleteCustomer(id) {
        try {
            const customer = await CustomerSchema_1.Customer.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() }, { new: true }).lean();
            if (!customer) {
                throw new Error('Customer not found');
            }
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
            const query = {};
            if (filters.email) {
                query.email = { $regex: filters.email, $options: 'i' };
            }
            if (filters.phone) {
                query.phone = { $regex: filters.phone };
            }
            if (filters.firstName) {
                query.firstName = { $regex: filters.firstName, $options: 'i' };
            }
            if (filters.lastName) {
                query.lastName = { $regex: filters.lastName, $options: 'i' };
            }
            if (filters.isVerified !== undefined) {
                query.isVerified = filters.isVerified;
            }
            if (filters.isActive !== undefined) {
                query.isActive = filters.isActive;
            }
            if (filters.createdFrom || filters.createdTo) {
                query.createdAt = {};
                if (filters.createdFrom) {
                    query.createdAt.$gte = filters.createdFrom;
                }
                if (filters.createdTo) {
                    query.createdAt.$lte = filters.createdTo;
                }
            }
            if (filters.lastLoginFrom || filters.lastLoginTo) {
                query.lastLoginAt = {};
                if (filters.lastLoginFrom) {
                    query.lastLoginAt.$gte = filters.lastLoginFrom;
                }
                if (filters.lastLoginTo) {
                    query.lastLoginAt.$lte = filters.lastLoginTo;
                }
            }
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
            const [customers, total] = await Promise.all([
                CustomerSchema_1.Customer.find(query)
                    .sort(sortOptions)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean()
                    .then(async (results) => {
                    return Promise.all(results.map(async (customer) => {
                        const [profile, preferences, addresses] = await Promise.all([
                            CustomerSchema_1.CustomerProfile.findOne({ customerId: customer._id }).lean(),
                            CustomerSchema_1.CustomerPreferences.findOne({ customerId: customer._id }).lean(),
                            CustomerSchema_1.CustomerAddress.find({ customerId: customer._id, isActive: true }).lean(),
                        ]);
                        return {
                            id: customer._id,
                            ...customer,
                            profile: profile ? { id: profile._id, ...profile } : null,
                            preferences: preferences ? { id: preferences._id, ...preferences } : null,
                            addresses: addresses.map(addr => ({ id: addr._id, ...addr })),
                        };
                    }));
                }),
                CustomerSchema_1.Customer.countDocuments(query),
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
            const profile = await CustomerSchema_1.CustomerProfile.findOneAndUpdate({ customerId }, { ...data, updatedAt: new Date() }, { upsert: true, new: true, runValidators: true }).lean();
            if (!profile) {
                throw new Error('Failed to update customer profile');
            }
            this.logger.info('Customer profile updated successfully', { customerId });
            return { id: profile._id, ...profile };
        }
        catch (error) {
            this.logger.error('Failed to update customer profile:', error);
            throw error;
        }
    }
    async updateCustomerPreferences(customerId, data) {
        try {
            const preferences = await CustomerSchema_1.CustomerPreferences.findOneAndUpdate({ customerId }, { ...data, updatedAt: new Date() }, { upsert: true, new: true, runValidators: true }).lean();
            if (!preferences) {
                throw new Error('Failed to update customer preferences');
            }
            this.logger.info('Customer preferences updated successfully', { customerId });
            return { id: preferences._id, ...preferences };
        }
        catch (error) {
            this.logger.error('Failed to update customer preferences:', error);
            throw error;
        }
    }
    async addCustomerAddress(customerId, data) {
        try {
            if (data.isDefault) {
                await CustomerSchema_1.CustomerAddress.updateMany({ customerId, isDefault: true }, { isDefault: false });
            }
            const addressData = {
                customerId,
                ...data,
                isDefault: data.isDefault || false,
            };
            const address = await CustomerSchema_1.CustomerAddress.create(addressData);
            this.logger.info('Customer address added successfully', { customerId, addressId: address._id });
            return { id: address._id, ...address.toObject() };
        }
        catch (error) {
            this.logger.error('Failed to add customer address:', error);
            throw error;
        }
    }
    async updateCustomerAddress(addressId, data) {
        try {
            if (data.isDefault) {
                const address = await CustomerSchema_1.CustomerAddress.findById(addressId).lean();
                if (address) {
                    await CustomerSchema_1.CustomerAddress.updateMany({ customerId: address.customerId, isDefault: true, _id: { $ne: addressId } }, { isDefault: false });
                }
            }
            const updatedAddress = await CustomerSchema_1.CustomerAddress.findByIdAndUpdate(addressId, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }).lean();
            if (!updatedAddress) {
                throw new Error('Address not found');
            }
            this.logger.info('Customer address updated successfully', { addressId });
            return { id: updatedAddress._id, ...updatedAddress };
        }
        catch (error) {
            this.logger.error('Failed to update customer address:', error);
            throw error;
        }
    }
    async deleteCustomerAddress(addressId) {
        try {
            const address = await CustomerSchema_1.CustomerAddress.findById(addressId).lean();
            if (!address) {
                throw new Error('Address not found');
            }
            await CustomerSchema_1.CustomerAddress.findByIdAndDelete(addressId);
            this.logger.info('Customer address deleted successfully', { addressId, customerId: address.customerId });
            return address.customerId;
        }
        catch (error) {
            this.logger.error('Failed to delete customer address:', error);
            throw error;
        }
    }
    async getCustomerAddresses(customerId) {
        try {
            const addresses = await CustomerSchema_1.CustomerAddress.find({ customerId, isActive: true })
                .sort({ isDefault: -1, createdAt: -1 })
                .lean();
            return addresses.map(addr => ({ id: addr._id, ...addr }));
        }
        catch (error) {
            this.logger.error('Failed to get customer addresses:', error);
            throw error;
        }
    }
    async updateLastLogin(id, ipAddress, userAgent) {
        try {
            await CustomerSchema_1.Customer.findByIdAndUpdate(id, { lastLoginAt: new Date() });
            if (ipAddress || userAgent) {
                await this.logCustomerActivity(id, 'LOGIN', 'Customer logged in', {
                    ipAddress,
                    userAgent,
                }, ipAddress, userAgent);
            }
        }
        catch (error) {
            this.logger.error('Failed to update last login:', error);
            throw error;
        }
    }
    async verifyCustomer(id) {
        try {
            const customer = await CustomerSchema_1.Customer.findByIdAndUpdate(id, { isVerified: true, updatedAt: new Date() }, { new: true }).lean();
            if (!customer) {
                throw new Error('Customer not found');
            }
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
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const startOfToday = new Date(now.setHours(0, 0, 0, 0));
            const [totalCustomers, verifiedCustomers, activeCustomers, newCustomersThisMonth, newCustomersThisWeek, newCustomersToday,] = await Promise.all([
                CustomerSchema_1.Customer.countDocuments(),
                CustomerSchema_1.Customer.countDocuments({ isVerified: true }),
                CustomerSchema_1.Customer.countDocuments({ isActive: true }),
                CustomerSchema_1.Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
                CustomerSchema_1.Customer.countDocuments({ createdAt: { $gte: startOfWeek } }),
                CustomerSchema_1.Customer.countDocuments({ createdAt: { $gte: startOfToday } }),
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
            const loyaltyPoint = await CustomerSchema_1.CustomerLoyaltyPoint.create({
                customerId,
                points,
                type: type,
                description,
                referenceId: referenceId || undefined,
            });
            this.logger.info('Loyalty points added successfully', { customerId, points, type });
            return { id: loyaltyPoint._id, ...loyaltyPoint.toObject() };
        }
        catch (error) {
            this.logger.error('Failed to add loyalty points:', error);
            throw error;
        }
    }
    async redeemLoyaltyPoints(customerId, points, description, referenceId) {
        try {
            const loyaltyPoint = await CustomerSchema_1.CustomerLoyaltyPoint.create({
                customerId,
                points: -points,
                type: 'REDEEMED',
                description,
                referenceId: referenceId || undefined,
                isRedeemed: true,
                redeemedAt: new Date(),
            });
            this.logger.info('Loyalty points redeemed successfully', { customerId, points });
            return { id: loyaltyPoint._id, ...loyaltyPoint.toObject() };
        }
        catch (error) {
            this.logger.error('Failed to redeem loyalty points:', error);
            throw error;
        }
    }
    async logCustomerActivity(customerId, activityType, description, metadata, ipAddress, userAgent) {
        try {
            const activity = await CustomerSchema_1.CustomerActivity.create({
                customerId,
                activityType: activityType,
                description,
                metadata: metadata || undefined,
                ipAddress: ipAddress || undefined,
                userAgent: userAgent || undefined,
            });
            this.logger.info('Customer activity logged successfully', { customerId, activityType });
            return { id: activity._id, ...activity.toObject() };
        }
        catch (error) {
            this.logger.error('Failed to log customer activity:', error);
            throw error;
        }
    }
    async sendCustomerNotification(customerId, type, title, message, metadata) {
        try {
            const notification = await CustomerSchema_1.CustomerNotification.create({
                customerId,
                type: type,
                title,
                message,
                metadata: metadata || undefined,
            });
            this.logger.info('Customer notification sent successfully', { customerId, type });
            return { id: notification._id, ...notification.toObject() };
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