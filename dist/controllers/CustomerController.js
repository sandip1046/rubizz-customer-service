"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const Customer_1 = require("../models/Customer");
const DatabaseConnection_1 = __importDefault(require("../database/DatabaseConnection"));
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class CustomerController {
    constructor() {
        this.createCustomer = async (req, res, next) => {
            try {
                const customerData = req.body;
                const existingCustomer = await this.customerModel.getCustomerByEmail(customerData.email);
                if (existingCustomer) {
                    res.status(409).json({
                        success: false,
                        message: 'Customer with this email already exists',
                        code: 'CUSTOMER_EXISTS',
                    });
                }
                if (customerData.phone) {
                    const existingPhoneCustomer = await this.customerModel.getCustomerByPhone(customerData.phone);
                    if (existingPhoneCustomer) {
                        res.status(409).json({
                            success: false,
                            message: 'Customer with this phone number already exists',
                            code: 'PHONE_EXISTS',
                        });
                    }
                }
                const customer = await this.customerModel.createCustomer(customerData);
                this.logger.info('Customer created successfully', { customerId: customer.id, email: customer.email });
                res.status(201).json({
                    success: true,
                    message: 'Customer created successfully',
                    data: {
                        customer: {
                            id: customer.id,
                            email: customer.email,
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                            phone: customer.phone,
                            isVerified: customer.isVerified,
                            isActive: customer.isActive,
                            createdAt: customer.createdAt,
                        },
                    },
                });
            }
            catch (error) {
                this.logger.error('Failed to create customer:', error);
                next(error);
            }
        };
        this.getCustomerById = async (req, res, next) => {
            try {
                const { customerId } = req.params;
                const customer = await this.customerModel.getCustomerById(customerId);
                if (!customer) {
                    res.status(404).json({
                        success: false,
                        message: 'Customer not found',
                        code: 'CUSTOMER_NOT_FOUND',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Customer retrieved successfully',
                    data: { customer },
                });
            }
            catch (error) {
                this.logger.error('Failed to get customer by ID:', error);
                next(error);
            }
        };
        this.getCustomerByEmail = async (req, res, next) => {
            try {
                const { email } = req.query;
                if (!email || typeof email !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: 'Email parameter is required',
                        code: 'EMAIL_REQUIRED',
                    });
                }
                const customer = await this.customerModel.getCustomerByEmail(email);
                if (!customer) {
                    res.status(404).json({
                        success: false,
                        message: 'Customer not found',
                        code: 'CUSTOMER_NOT_FOUND',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Customer retrieved successfully',
                    data: { customer },
                });
            }
            catch (error) {
                this.logger.error('Failed to get customer by email:', error);
                next(error);
            }
        };
        this.updateCustomer = async (req, res, next) => {
            try {
                const { customerId } = req.params;
                const updateData = req.body;
                const existingCustomer = await this.customerModel.getCustomerById(customerId);
                if (!existingCustomer) {
                    res.status(404).json({
                        success: false,
                        message: 'Customer not found',
                        code: 'CUSTOMER_NOT_FOUND',
                    });
                }
                if (updateData.phone && updateData.phone !== existingCustomer.phone) {
                    const existingPhoneCustomer = await this.customerModel.getCustomerByPhone(updateData.phone);
                    if (existingPhoneCustomer && existingPhoneCustomer.id !== customerId) {
                        res.status(409).json({
                            success: false,
                            message: 'Customer with this phone number already exists',
                            code: 'PHONE_EXISTS',
                        });
                    }
                }
                const customer = await this.customerModel.updateCustomer(customerId, updateData);
                this.logger.info('Customer updated successfully', { customerId });
                res.status(200).json({
                    success: true,
                    message: 'Customer updated successfully',
                    data: { customer },
                });
            }
            catch (error) {
                this.logger.error('Failed to update customer:', error);
                next(error);
            }
        };
        this.deleteCustomer = async (req, res, next) => {
            try {
                const { customerId } = req.params;
                const existingCustomer = await this.customerModel.getCustomerById(customerId);
                if (!existingCustomer) {
                    res.status(404).json({
                        success: false,
                        message: 'Customer not found',
                        code: 'CUSTOMER_NOT_FOUND',
                    });
                }
                await this.customerModel.deleteCustomer(customerId);
                this.logger.info('Customer deleted successfully', { customerId });
                res.status(200).json({
                    success: true,
                    message: 'Customer deleted successfully',
                });
            }
            catch (error) {
                this.logger.error('Failed to delete customer:', error);
                next(error);
            }
        };
        this.searchCustomers = async (req, res, next) => {
            try {
                const filters = req.query;
                const pagination = {
                    page: parseInt(req.query['page']) || 1,
                    limit: parseInt(req.query['limit']) || 10,
                    sortBy: req.query['sortBy'] || 'createdAt',
                    sortOrder: req.query['sortOrder'] || 'desc',
                };
                const result = await this.customerModel.searchCustomers(filters, pagination);
                res.status(200).json({
                    success: true,
                    message: 'Customers retrieved successfully',
                    data: result,
                });
            }
            catch (error) {
                this.logger.error('Failed to search customers:', error);
                next(error);
            }
        };
        this.updateCustomerProfile = async (req, res, next) => {
            try {
                const { customerId } = req.params;
                const profileData = req.body;
                const existingCustomer = await this.customerModel.getCustomerById(customerId);
                if (!existingCustomer) {
                    res.status(404).json({
                        success: false,
                        message: 'Customer not found',
                        code: 'CUSTOMER_NOT_FOUND',
                    });
                }
                const profile = await this.customerModel.updateCustomerProfile(customerId, profileData);
                this.logger.info('Customer profile updated successfully', { customerId });
                res.status(200).json({
                    success: true,
                    message: 'Customer profile updated successfully',
                    data: { profile },
                });
            }
            catch (error) {
                this.logger.error('Failed to update customer profile:', error);
                next(error);
            }
        };
        this.updateCustomerPreferences = async (req, res, next) => {
            try {
                const { customerId } = req.params;
                const preferencesData = req.body;
                const existingCustomer = await this.customerModel.getCustomerById(customerId);
                if (!existingCustomer) {
                    res.status(404).json({
                        success: false,
                        message: 'Customer not found',
                        code: 'CUSTOMER_NOT_FOUND',
                    });
                }
                const preferences = await this.customerModel.updateCustomerPreferences(customerId, preferencesData);
                this.logger.info('Customer preferences updated successfully', { customerId });
                res.status(200).json({
                    success: true,
                    message: 'Customer preferences updated successfully',
                    data: { preferences },
                });
            }
            catch (error) {
                this.logger.error('Failed to update customer preferences:', error);
                next(error);
            }
        };
        this.addCustomerAddress = async (req, res, next) => {
            try {
                const { customerId } = req.params;
                const addressData = req.body;
                const existingCustomer = await this.customerModel.getCustomerById(customerId);
                if (!existingCustomer) {
                    res.status(404).json({
                        success: false,
                        message: 'Customer not found',
                        code: 'CUSTOMER_NOT_FOUND',
                    });
                }
                const address = await this.customerModel.addCustomerAddress(customerId, addressData);
                this.logger.info('Customer address added successfully', { customerId, addressId: address.id });
                res.status(201).json({
                    success: true,
                    message: 'Customer address added successfully',
                    data: { address },
                });
            }
            catch (error) {
                this.logger.error('Failed to add customer address:', error);
                next(error);
            }
        };
        this.updateCustomerAddress = async (req, res, next) => {
            try {
                const { addressId } = req.params;
                const addressData = req.body;
                const address = await this.customerModel.updateCustomerAddress(addressId, addressData);
                this.logger.info('Customer address updated successfully', { addressId });
                res.status(200).json({
                    success: true,
                    message: 'Customer address updated successfully',
                    data: { address },
                });
            }
            catch (error) {
                this.logger.error('Failed to update customer address:', error);
                next(error);
            }
        };
        this.deleteCustomerAddress = async (req, res, next) => {
            try {
                const { addressId } = req.params;
                await this.customerModel.deleteCustomerAddress(addressId);
                this.logger.info('Customer address deleted successfully', { addressId });
                res.status(200).json({
                    success: true,
                    message: 'Customer address deleted successfully',
                });
            }
            catch (error) {
                this.logger.error('Failed to delete customer address:', error);
                next(error);
            }
        };
        this.getCustomerAddresses = async (req, res, next) => {
            try {
                const { customerId } = req.params;
                const existingCustomer = await this.customerModel.getCustomerById(customerId);
                if (!existingCustomer) {
                    res.status(404).json({
                        success: false,
                        message: 'Customer not found',
                        code: 'CUSTOMER_NOT_FOUND',
                    });
                }
                const addresses = await this.customerModel.getCustomerAddresses(customerId);
                res.status(200).json({
                    success: true,
                    message: 'Customer addresses retrieved successfully',
                    data: { addresses },
                });
            }
            catch (error) {
                this.logger.error('Failed to get customer addresses:', error);
                next(error);
            }
        };
        this.verifyCustomer = async (req, res, next) => {
            try {
                const { customerId } = req.params;
                const existingCustomer = await this.customerModel.getCustomerById(customerId);
                if (!existingCustomer) {
                    res.status(404).json({
                        success: false,
                        message: 'Customer not found',
                        code: 'CUSTOMER_NOT_FOUND',
                    });
                }
                const customer = await this.customerModel.verifyCustomer(customerId);
                this.logger.info('Customer verified successfully', { customerId });
                res.status(200).json({
                    success: true,
                    message: 'Customer verified successfully',
                    data: { customer },
                });
            }
            catch (error) {
                this.logger.error('Failed to verify customer:', error);
                next(error);
            }
        };
        this.getCustomerStats = async (_req, res, next) => {
            try {
                const stats = await this.customerModel.getCustomerStats();
                res.status(200).json({
                    success: true,
                    message: 'Customer statistics retrieved successfully',
                    data: { stats },
                });
            }
            catch (error) {
                this.logger.error('Failed to get customer statistics:', error);
                next(error);
            }
        };
        this.updateLastLogin = async (req, res, next) => {
            try {
                const { customerId } = req.params;
                await this.customerModel.updateLastLogin(customerId);
                this.logger.info('Last login updated successfully', { customerId });
                res.status(200).json({
                    success: true,
                    message: 'Last login updated successfully',
                });
            }
            catch (error) {
                this.logger.error('Failed to update last login:', error);
                next(error);
            }
        };
        const prisma = DatabaseConnection_1.default.getInstance().getPrismaClient();
        this.customerModel = new Customer_1.CustomerModel(prisma);
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');
    }
    async getCustomerByIdGraphQL(customerId) {
        try {
            const customer = await this.customerModel.getCustomerById(customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to get customer by ID:', error);
            throw error;
        }
    }
    async getCustomerByEmailGraphQL(email) {
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
    async searchCustomersGraphQL(filters, pagination) {
        try {
            const result = await this.customerModel.searchCustomers(filters, pagination);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to search customers:', error);
            throw error;
        }
    }
    async getCustomerStatsGraphQL() {
        try {
            const stats = await this.customerModel.getCustomerStats();
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get customer stats:', error);
            throw error;
        }
    }
    async createCustomerGraphQL(input) {
        try {
            const customer = await this.customerModel.createCustomer(input);
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to create customer:', error);
            throw error;
        }
    }
    async updateCustomerGraphQL(customerId, input) {
        try {
            const customer = await this.customerModel.updateCustomer(customerId, input);
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to update customer:', error);
            throw error;
        }
    }
    async deleteCustomerGraphQL(customerId) {
        try {
            await this.customerModel.deleteCustomer(customerId);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to delete customer:', error);
            throw error;
        }
    }
    async updateCustomerProfileGraphQL(customerId, input) {
        try {
            const profile = await this.customerModel.updateCustomerProfile(customerId, input);
            return profile;
        }
        catch (error) {
            this.logger.error('Failed to update customer profile:', error);
            throw error;
        }
    }
    async updateCustomerPreferencesGraphQL(customerId, input) {
        try {
            const preferences = await this.customerModel.updateCustomerPreferences(customerId, input);
            return preferences;
        }
        catch (error) {
            this.logger.error('Failed to update customer preferences:', error);
            throw error;
        }
    }
    async addCustomerAddressGraphQL(customerId, input) {
        try {
            const address = await this.customerModel.addCustomerAddress(customerId, input);
            return address;
        }
        catch (error) {
            this.logger.error('Failed to add customer address:', error);
            throw error;
        }
    }
    async updateCustomerAddressGraphQL(addressId, input) {
        try {
            const address = await this.customerModel.updateCustomerAddress(addressId, input);
            return address;
        }
        catch (error) {
            this.logger.error('Failed to update customer address:', error);
            throw error;
        }
    }
    async deleteCustomerAddressGraphQL(addressId) {
        try {
            const customerId = await this.customerModel.deleteCustomerAddress(addressId);
            return customerId;
        }
        catch (error) {
            this.logger.error('Failed to delete customer address:', error);
            throw error;
        }
    }
    async getCustomerAddressesGraphQL(customerId) {
        try {
            const addresses = await this.customerModel.getCustomerAddresses(customerId);
            return addresses;
        }
        catch (error) {
            this.logger.error('Failed to get customer addresses:', error);
            throw error;
        }
    }
    async verifyCustomerGraphQL(customerId) {
        try {
            const customer = await this.customerModel.verifyCustomer(customerId);
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to verify customer:', error);
            throw error;
        }
    }
    async updateLastLoginGraphQL(customerId, ipAddress, userAgent) {
        try {
            await this.customerModel.updateLastLogin(customerId, ipAddress, userAgent);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to update last login:', error);
            throw error;
        }
    }
    async addLoyaltyPointsGraphQL(customerId, input) {
        try {
            const loyaltyPoint = await this.customerModel.addLoyaltyPoints(customerId, input.points, input.type, input.description, input.referenceId);
            return loyaltyPoint;
        }
        catch (error) {
            this.logger.error('Failed to add loyalty points:', error);
            throw error;
        }
    }
    async redeemLoyaltyPointsGraphQL(customerId, input) {
        try {
            const loyaltyPoint = await this.customerModel.redeemLoyaltyPoints(customerId, input.points, input.description, input.referenceId);
            return loyaltyPoint;
        }
        catch (error) {
            this.logger.error('Failed to redeem loyalty points:', error);
            throw error;
        }
    }
    async logCustomerActivityGraphQL(customerId, input) {
        try {
            await this.customerModel.logCustomerActivity(customerId, input.activityType, input.description, input.metadata, input.ipAddress, input.userAgent);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to log customer activity:', error);
            throw error;
        }
    }
    async sendCustomerNotificationGraphQL(customerId, input) {
        try {
            const notification = await this.customerModel.sendCustomerNotification(customerId, input.type, input.title, input.message, input.metadata);
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to send customer notification:', error);
            throw error;
        }
    }
    async createCustomerGrpc(call, callback) {
        try {
            const customer = await this.customerModel.createCustomer(call.request);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer created successfully',
                    timestamp: new Date().toISOString(),
                },
                customer: this.mapCustomerToProto(customer),
            });
        }
        catch (error) {
            this.logger.error('Failed to create customer via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to create customer',
            });
        }
    }
    async getCustomerByIdGrpc(call, callback) {
        try {
            const customer = await this.customerModel.getCustomerById(call.request.customer_id);
            if (!customer) {
                callback({
                    code: 404,
                    message: 'Customer not found',
                });
                return;
            }
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer retrieved successfully',
                    timestamp: new Date().toISOString(),
                },
                customer: this.mapCustomerToProto(customer),
            });
        }
        catch (error) {
            this.logger.error('Failed to get customer by ID via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to retrieve customer',
            });
        }
    }
    async getCustomerByEmailGrpc(call, callback) {
        try {
            const customer = await this.customerModel.getCustomerByEmail(call.request.email);
            if (!customer) {
                callback({
                    code: 404,
                    message: 'Customer not found',
                });
                return;
            }
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer retrieved successfully',
                    timestamp: new Date().toISOString(),
                },
                customer: this.mapCustomerToProto(customer),
            });
        }
        catch (error) {
            this.logger.error('Failed to get customer by email via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to retrieve customer',
            });
        }
    }
    async updateCustomerGrpc(call, callback) {
        try {
            const customer = await this.customerModel.updateCustomer(call.request.customer_id, call.request);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer updated successfully',
                    timestamp: new Date().toISOString(),
                },
                customer: this.mapCustomerToProto(customer),
            });
        }
        catch (error) {
            this.logger.error('Failed to update customer via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to update customer',
            });
        }
    }
    async deleteCustomerGrpc(call, callback) {
        try {
            await this.customerModel.deleteCustomer(call.request.customer_id);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer deleted successfully',
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to delete customer via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to delete customer',
            });
        }
    }
    async searchCustomersGrpc(call, callback) {
        try {
            const result = await this.customerModel.searchCustomers(call.request, call.request.pagination);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customers retrieved successfully',
                    timestamp: new Date().toISOString(),
                },
                customers: result.customers?.map((customer) => this.mapCustomerToProto(customer)) || [],
                pagination: {
                    page: result.pagination?.page || 1,
                    limit: result.pagination?.limit || 10,
                    total: result.pagination?.total || 0,
                    total_pages: result.pagination?.pages || 0,
                    has_next: (result.pagination?.page || 1) < (result.pagination?.pages || 0),
                    has_prev: (result.pagination?.page || 1) > 1,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to search customers via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to search customers',
            });
        }
    }
    async updateCustomerProfileGrpc(call, callback) {
        try {
            const profile = await this.customerModel.updateCustomerProfile(call.request.customer_id, call.request);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer profile updated successfully',
                    timestamp: new Date().toISOString(),
                },
                profile: this.mapCustomerProfileToProto(profile),
            });
        }
        catch (error) {
            this.logger.error('Failed to update customer profile via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to update customer profile',
            });
        }
    }
    async updateCustomerPreferencesGrpc(call, callback) {
        try {
            const preferences = await this.customerModel.updateCustomerPreferences(call.request.customer_id, call.request);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer preferences updated successfully',
                    timestamp: new Date().toISOString(),
                },
                preferences: this.mapCustomerPreferencesToProto(preferences),
            });
        }
        catch (error) {
            this.logger.error('Failed to update customer preferences via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to update customer preferences',
            });
        }
    }
    async addCustomerAddressGrpc(call, callback) {
        try {
            const address = await this.customerModel.addCustomerAddress(call.request.customer_id, call.request);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer address added successfully',
                    timestamp: new Date().toISOString(),
                },
                address: this.mapCustomerAddressToProto(address),
            });
        }
        catch (error) {
            this.logger.error('Failed to add customer address via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to add customer address',
            });
        }
    }
    async updateCustomerAddressGrpc(call, callback) {
        try {
            const address = await this.customerModel.updateCustomerAddress(call.request.address_id, call.request);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer address updated successfully',
                    timestamp: new Date().toISOString(),
                },
                address: this.mapCustomerAddressToProto(address),
            });
        }
        catch (error) {
            this.logger.error('Failed to update customer address via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to update customer address',
            });
        }
    }
    async deleteCustomerAddressGrpc(call, callback) {
        try {
            await this.customerModel.deleteCustomerAddress(call.request.address_id);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer address deleted successfully',
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to delete customer address via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to delete customer address',
            });
        }
    }
    async getCustomerAddressesGrpc(call, callback) {
        try {
            const addresses = await this.customerModel.getCustomerAddresses(call.request.customer_id);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer addresses retrieved successfully',
                    timestamp: new Date().toISOString(),
                },
                addresses: addresses?.map((address) => this.mapCustomerAddressToProto(address)) || [],
            });
        }
        catch (error) {
            this.logger.error('Failed to get customer addresses via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to retrieve customer addresses',
            });
        }
    }
    async verifyCustomerGrpc(call, callback) {
        try {
            const customer = await this.customerModel.verifyCustomer(call.request.customer_id);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer verified successfully',
                    timestamp: new Date().toISOString(),
                },
                customer: this.mapCustomerToProto(customer),
            });
        }
        catch (error) {
            this.logger.error('Failed to verify customer via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to verify customer',
            });
        }
    }
    async updateLastLoginGrpc(call, callback) {
        try {
            await this.customerModel.updateLastLogin(call.request.customer_id, call.request.ip_address, call.request.user_agent);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Last login updated successfully',
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to update last login via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to update last login',
            });
        }
    }
    async getCustomerStatsGrpc(_call, callback) {
        try {
            const stats = await this.customerModel.getCustomerStats();
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer stats retrieved successfully',
                    timestamp: new Date().toISOString(),
                },
                stats: {
                    total_customers: stats.totalCustomers || 0,
                    verified_customers: stats.verifiedCustomers || 0,
                    active_customers: stats.activeCustomers || 0,
                    new_customers_this_month: stats.newCustomersThisMonth || 0,
                    new_customers_this_week: stats.newCustomersThisWeek || 0,
                    new_customers_today: stats.newCustomersToday || 0,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to get customer stats via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to retrieve customer stats',
            });
        }
    }
    async addLoyaltyPointsGrpc(call, callback) {
        try {
            const loyaltyPoint = await this.customerModel.addLoyaltyPoints(call.request.customer_id, call.request.points, call.request.type, call.request.description, call.request.reference_id);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Loyalty points added successfully',
                    timestamp: new Date().toISOString(),
                },
                loyaltyPoint: this.mapCustomerLoyaltyPointToProto(loyaltyPoint),
            });
        }
        catch (error) {
            this.logger.error('Failed to add loyalty points via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to add loyalty points',
            });
        }
    }
    async redeemLoyaltyPointsGrpc(call, callback) {
        try {
            const loyaltyPoint = await this.customerModel.redeemLoyaltyPoints(call.request.customer_id, call.request.points, call.request.description, call.request.reference_id);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Loyalty points redeemed successfully',
                    timestamp: new Date().toISOString(),
                },
                loyaltyPoint: this.mapCustomerLoyaltyPointToProto(loyaltyPoint),
            });
        }
        catch (error) {
            this.logger.error('Failed to redeem loyalty points via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to redeem loyalty points',
            });
        }
    }
    async logCustomerActivityGrpc(call, callback) {
        try {
            await this.customerModel.logCustomerActivity(call.request.customer_id, call.request.activity_type, call.request.description, call.request.metadata_json, call.request.ip_address, call.request.user_agent);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer activity logged successfully',
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to log customer activity via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to log customer activity',
            });
        }
    }
    async sendCustomerNotificationGrpc(call, callback) {
        try {
            const notification = await this.customerModel.sendCustomerNotification(call.request.customer_id, call.request.type, call.request.title, call.request.message, call.request.metadata_json);
            callback(null, {
                apiResponse: {
                    success: true,
                    message: 'Customer notification sent successfully',
                    timestamp: new Date().toISOString(),
                },
                notification: this.mapCustomerNotificationToProto(notification),
            });
        }
        catch (error) {
            this.logger.error('Failed to send customer notification via gRPC:', error);
            callback({
                code: 500,
                message: 'Failed to send customer notification',
            });
        }
    }
    mapCustomerToProto(customer) {
        return {
            id: customer.id,
            email: customer.email,
            phone: customer.phone || '',
            first_name: customer.firstName,
            last_name: customer.lastName,
            date_of_birth: customer.dateOfBirth ? new Date(customer.dateOfBirth).getTime() : 0,
            gender: customer.gender || 'PREFER_NOT_TO_SAY',
            is_verified: customer.isVerified || false,
            is_active: customer.isActive || false,
            last_login_at: customer.lastLoginAt ? new Date(customer.lastLoginAt).getTime() : 0,
            created_at: customer.createdAt ? new Date(customer.createdAt).getTime() : 0,
            updated_at: customer.updatedAt ? new Date(customer.updatedAt).getTime() : 0,
        };
    }
    mapCustomerProfileToProto(profile) {
        return {
            id: profile.id,
            customer_id: profile.customerId,
            avatar: profile.avatar || '',
            bio: profile.bio || '',
            preferences_json: profile.preferences ? JSON.stringify(profile.preferences) : '',
            emergency_contact: profile.emergencyContact || '',
            dietary_restrictions: profile.dietaryRestrictions || '',
            special_requests: profile.specialRequests || '',
            created_at: profile.createdAt ? new Date(profile.createdAt).getTime() : 0,
            updated_at: profile.updatedAt ? new Date(profile.updatedAt).getTime() : 0,
        };
    }
    mapCustomerPreferencesToProto(preferences) {
        return {
            id: preferences.id,
            customer_id: preferences.customerId,
            language: preferences.language || 'en',
            currency: preferences.currency || 'USD',
            timezone: preferences.timezone || 'UTC',
            email_notifications: preferences.emailNotifications || false,
            sms_notifications: preferences.smsNotifications || false,
            push_notifications: preferences.pushNotifications || false,
            marketing_emails: preferences.marketingEmails || false,
            created_at: preferences.createdAt ? new Date(preferences.createdAt).getTime() : 0,
            updated_at: preferences.updatedAt ? new Date(preferences.updatedAt).getTime() : 0,
        };
    }
    mapCustomerAddressToProto(address) {
        return {
            id: address.id,
            customer_id: address.customerId,
            type: address.type || 'HOME',
            address_line1: address.addressLine1,
            address_line2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            postal_code: address.postalCode,
            country: address.country,
            is_default: address.isDefault || false,
            is_active: address.isActive || false,
            created_at: address.createdAt ? new Date(address.createdAt).getTime() : 0,
            updated_at: address.updatedAt ? new Date(address.updatedAt).getTime() : 0,
        };
    }
    mapCustomerLoyaltyPointToProto(loyaltyPoint) {
        return {
            id: loyaltyPoint.id,
            customer_id: loyaltyPoint.customerId,
            points: loyaltyPoint.points,
            type: loyaltyPoint.type || 'EARNED',
            description: loyaltyPoint.description,
            reference_id: loyaltyPoint.referenceId || '',
            expires_at: loyaltyPoint.expiresAt ? new Date(loyaltyPoint.expiresAt).getTime() : 0,
            is_redeemed: loyaltyPoint.isRedeemed || false,
            redeemed_at: loyaltyPoint.redeemedAt ? new Date(loyaltyPoint.redeemedAt).getTime() : 0,
            created_at: loyaltyPoint.createdAt ? new Date(loyaltyPoint.createdAt).getTime() : 0,
        };
    }
    mapCustomerNotificationToProto(notification) {
        return {
            id: notification.id,
            customer_id: notification.customerId,
            type: notification.type || 'SYSTEM_ALERT',
            title: notification.title,
            message: notification.message,
            is_read: notification.isRead || false,
            read_at: notification.readAt ? new Date(notification.readAt).getTime() : 0,
            metadata_json: notification.metadata ? JSON.stringify(notification.metadata) : '',
            created_at: notification.createdAt ? new Date(notification.createdAt).getTime() : 0,
        };
    }
}
exports.CustomerController = CustomerController;
exports.default = CustomerController;
//# sourceMappingURL=CustomerController.js.map