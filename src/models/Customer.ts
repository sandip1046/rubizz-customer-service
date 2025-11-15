import {
  Customer,
  CustomerProfile,
  CustomerPreferences,
  CustomerAddress,
  CustomerLoyaltyPoint,
  CustomerActivity,
  CustomerNotification,
  Gender,
  AddressType,
} from '../schemas/CustomerSchema';
import { config } from '../config/config';
import { Logger } from '@sandip1046/rubizz-shared-libs';

export interface CreateCustomerData {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: Gender;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  phone?: string;
}

export interface CustomerProfileData {
  avatar?: string;
  bio?: string;
  preferences?: Record<string, any>;
  emergencyContact?: string;
  dietaryRestrictions?: string;
  specialRequests?: string;
}

export interface CustomerPreferencesData {
  language?: string;
  currency?: string;
  timezone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
}

export interface CustomerAddressData {
  type: AddressType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface CustomerSearchFilters {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  lastLoginFrom?: Date;
  lastLoginTo?: Date;
}

export interface CustomerPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CustomerModel {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
  }

  // Create a new customer
  async createCustomer(data: CreateCustomerData) {
    try {
      const customerData: any = {
        ...data,
        isVerified: !config.customer.verificationRequired,
      };

      const customer = await Customer.create(customerData);

      // Populate related data
      const populatedCustomer = await this.getCustomerById(customer._id);

      this.logger.info('Customer created successfully', { customerId: customer._id });
      return populatedCustomer;
    } catch (error) {
      this.logger.error('Failed to create customer:', error as Error);
      throw error;
    }
  }

  // Get customer by ID
  async getCustomerById(id: string) {
    try {
      const customer = await Customer.findById(id).lean();

      if (!customer) {
        return null;
      }

      // Get related data
      const [profile, preferences, addresses, loyaltyPoints, activities] = await Promise.all([
        CustomerProfile.findOne({ customerId: id }).lean(),
        CustomerPreferences.findOne({ customerId: id }).lean(),
        CustomerAddress.find({ customerId: id, isActive: true }).sort({ isDefault: -1, createdAt: -1 }).limit(10).lean(),
        CustomerLoyaltyPoint.find({ customerId: id }).sort({ createdAt: -1 }).limit(10).lean(),
        CustomerActivity.find({ customerId: id }).sort({ createdAt: -1 }).limit(10).lean(),
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
    } catch (error) {
      this.logger.error('Failed to get customer by ID:', error as Error);
      throw error;
    }
  }

  // Get customer by email
  async getCustomerByEmail(email: string) {
    try {
      const customer = await Customer.findOne({ email: email.toLowerCase() }).lean();

      if (!customer) {
        return null;
      }

      // Get related data
      const [profile, preferences, addresses] = await Promise.all([
        CustomerProfile.findOne({ customerId: customer._id }).lean(),
        CustomerPreferences.findOne({ customerId: customer._id }).lean(),
        CustomerAddress.find({ customerId: customer._id, isActive: true }).lean(),
      ]);

      return {
        id: customer._id,
        ...customer,
        profile: profile ? { id: profile._id, ...profile } : null,
        preferences: preferences ? { id: preferences._id, ...preferences } : null,
        addresses: addresses.map(addr => ({ id: addr._id, ...addr })),
      };
    } catch (error) {
      this.logger.error('Failed to get customer by email:', error as Error);
      throw error;
    }
  }

  // Get customer by phone
  async getCustomerByPhone(phone: string) {
    try {
      const customer = await Customer.findOne({ phone }).lean();

      if (!customer) {
        return null;
      }

      // Get related data
      const [profile, preferences, addresses] = await Promise.all([
        CustomerProfile.findOne({ customerId: customer._id }).lean(),
        CustomerPreferences.findOne({ customerId: customer._id }).lean(),
        CustomerAddress.find({ customerId: customer._id, isActive: true }).lean(),
      ]);

      return {
        id: customer._id,
        ...customer,
        profile: profile ? { id: profile._id, ...profile } : null,
        preferences: preferences ? { id: preferences._id, ...preferences } : null,
        addresses: addresses.map(addr => ({ id: addr._id, ...addr })),
      };
    } catch (error) {
      this.logger.error('Failed to get customer by phone:', error as Error);
      throw error;
    }
  }

  // Update customer
  async updateCustomer(id: string, data: UpdateCustomerData) {
    try {
      const customer = await Customer.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Get related data
      const [profile, preferences, addresses] = await Promise.all([
        CustomerProfile.findOne({ customerId: id }).lean(),
        CustomerPreferences.findOne({ customerId: id }).lean(),
        CustomerAddress.find({ customerId: id, isActive: true }).lean(),
      ]);

      this.logger.info('Customer updated successfully', { customerId: id });
      return {
        id: customer._id,
        ...customer,
        profile: profile ? { id: profile._id, ...profile } : null,
        preferences: preferences ? { id: preferences._id, ...preferences } : null,
        addresses: addresses.map(addr => ({ id: addr._id, ...addr })),
      };
    } catch (error) {
      this.logger.error('Failed to update customer:', error as Error);
      throw error;
    }
  }

  // Delete customer (soft delete)
  async deleteCustomer(id: string) {
    try {
      const customer = await Customer.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      ).lean();

      if (!customer) {
        throw new Error('Customer not found');
      }

      this.logger.info('Customer deleted successfully', { customerId: id });
      return customer;
    } catch (error) {
      this.logger.error('Failed to delete customer:', error as Error);
      throw error;
    }
  }

  // Search customers with filters and pagination
  async searchCustomers(filters: CustomerSearchFilters, pagination: CustomerPaginationOptions = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = pagination;

      const query: any = {};

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

      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const [customers, total] = await Promise.all([
        Customer.find(query)
          .sort(sortOptions)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .then(async (results) => {
            // Populate related data for each customer
            return Promise.all(
              results.map(async (customer) => {
                const [profile, preferences, addresses] = await Promise.all([
                  CustomerProfile.findOne({ customerId: customer._id }).lean(),
                  CustomerPreferences.findOne({ customerId: customer._id }).lean(),
                  CustomerAddress.find({ customerId: customer._id, isActive: true }).lean(),
                ]);

                return {
                  id: customer._id,
                  ...customer,
                  profile: profile ? { id: profile._id, ...profile } : null,
                  preferences: preferences ? { id: preferences._id, ...preferences } : null,
                  addresses: addresses.map(addr => ({ id: addr._id, ...addr })),
                };
              })
            );
          }),
        Customer.countDocuments(query),
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
    } catch (error) {
      this.logger.error('Failed to search customers:', error as Error);
      throw error;
    }
  }

  // Update customer profile
  async updateCustomerProfile(customerId: string, data: CustomerProfileData) {
    try {
      const profile = await CustomerProfile.findOneAndUpdate(
        { customerId },
        { ...data, updatedAt: new Date() },
        { upsert: true, new: true, runValidators: true }
      ).lean();

      if (!profile) {
        throw new Error('Failed to update customer profile');
      }

      this.logger.info('Customer profile updated successfully', { customerId });
      return { id: profile._id, ...profile };
    } catch (error) {
      this.logger.error('Failed to update customer profile:', error as Error);
      throw error;
    }
  }

  // Update customer preferences
  async updateCustomerPreferences(customerId: string, data: CustomerPreferencesData) {
    try {
      const preferences = await CustomerPreferences.findOneAndUpdate(
        { customerId },
        { ...data, updatedAt: new Date() },
        { upsert: true, new: true, runValidators: true }
      ).lean();

      if (!preferences) {
        throw new Error('Failed to update customer preferences');
      }

      this.logger.info('Customer preferences updated successfully', { customerId });
      return { id: preferences._id, ...preferences };
    } catch (error) {
      this.logger.error('Failed to update customer preferences:', error as Error);
      throw error;
    }
  }

  // Add customer address
  async addCustomerAddress(customerId: string, data: CustomerAddressData) {
    try {
      // If this is set as default, unset other default addresses
      if (data.isDefault) {
        await CustomerAddress.updateMany(
          { customerId, isDefault: true },
          { isDefault: false }
        );
      }

      const addressData: any = {
        customerId,
        ...data,
        isDefault: data.isDefault || false,
      };

      const address = await CustomerAddress.create(addressData);

      this.logger.info('Customer address added successfully', { customerId, addressId: address._id });
      return { id: address._id, ...address.toObject() };
    } catch (error) {
      this.logger.error('Failed to add customer address:', error as Error);
      throw error;
    }
  }

  // Update customer address
  async updateCustomerAddress(addressId: string, data: Partial<CustomerAddressData>) {
    try {
      // If this is set as default, unset other default addresses
      if (data.isDefault) {
        const address = await CustomerAddress.findById(addressId).lean();
        if (address) {
          await CustomerAddress.updateMany(
            { customerId: address.customerId, isDefault: true, _id: { $ne: addressId } },
            { isDefault: false }
          );
        }
      }

      const updatedAddress = await CustomerAddress.findByIdAndUpdate(
        addressId,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedAddress) {
        throw new Error('Address not found');
      }

      this.logger.info('Customer address updated successfully', { addressId });
      return { id: updatedAddress._id, ...updatedAddress };
    } catch (error) {
      this.logger.error('Failed to update customer address:', error as Error);
      throw error;
    }
  }

  // Delete customer address
  async deleteCustomerAddress(addressId: string) {
    try {
      const address = await CustomerAddress.findById(addressId).lean();

      if (!address) {
        throw new Error('Address not found');
      }

      await CustomerAddress.findByIdAndDelete(addressId);

      this.logger.info('Customer address deleted successfully', { addressId, customerId: address.customerId });
      return address.customerId;
    } catch (error) {
      this.logger.error('Failed to delete customer address:', error as Error);
      throw error;
    }
  }

  // Get customer addresses
  async getCustomerAddresses(customerId: string) {
    try {
      const addresses = await CustomerAddress.find({ customerId, isActive: true })
        .sort({ isDefault: -1, createdAt: -1 })
        .lean();

      return addresses.map(addr => ({ id: addr._id, ...addr }));
    } catch (error) {
      this.logger.error('Failed to get customer addresses:', error as Error);
      throw error;
    }
  }

  // Update last login
  async updateLastLogin(id: string, ipAddress?: string, userAgent?: string) {
    try {
      await Customer.findByIdAndUpdate(id, { lastLoginAt: new Date() });

      // Log the activity if ipAddress and userAgent are provided
      if (ipAddress || userAgent) {
        await this.logCustomerActivity(id, 'LOGIN', 'Customer logged in', {
          ipAddress,
          userAgent,
        }, ipAddress, userAgent);
      }
    } catch (error) {
      this.logger.error('Failed to update last login:', error as Error);
      throw error;
    }
  }

  // Verify customer
  async verifyCustomer(id: string) {
    try {
      const customer = await Customer.findByIdAndUpdate(
        id,
        { isVerified: true, updatedAt: new Date() },
        { new: true }
      ).lean();

      if (!customer) {
        throw new Error('Customer not found');
      }

      this.logger.info('Customer verified successfully', { customerId: id });
      return customer;
    } catch (error) {
      this.logger.error('Failed to verify customer:', error as Error);
      throw error;
    }
  }

  // Get customer statistics
  async getCustomerStats() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));

      const [
        totalCustomers,
        verifiedCustomers,
        activeCustomers,
        newCustomersThisMonth,
        newCustomersThisWeek,
        newCustomersToday,
      ] = await Promise.all([
        Customer.countDocuments(),
        Customer.countDocuments({ isVerified: true }),
        Customer.countDocuments({ isActive: true }),
        Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Customer.countDocuments({ createdAt: { $gte: startOfWeek } }),
        Customer.countDocuments({ createdAt: { $gte: startOfToday } }),
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
    } catch (error) {
      this.logger.error('Failed to get customer statistics:', error as Error);
      throw error;
    }
  }

  // Add loyalty points
  async addLoyaltyPoints(customerId: string, points: number, type: string, description: string, referenceId?: string) {
    try {
      const loyaltyPoint = await CustomerLoyaltyPoint.create({
        customerId,
        points,
        type: type as any,
        description,
        referenceId: referenceId || undefined,
      });

      this.logger.info('Loyalty points added successfully', { customerId, points, type });
      return { id: loyaltyPoint._id, ...loyaltyPoint.toObject() };
    } catch (error) {
      this.logger.error('Failed to add loyalty points:', error as Error);
      throw error;
    }
  }

  // Redeem loyalty points
  async redeemLoyaltyPoints(customerId: string, points: number, description: string, referenceId?: string) {
    try {
      const loyaltyPoint = await CustomerLoyaltyPoint.create({
        customerId,
        points: -points, // Negative points for redemption
        type: 'REDEEMED',
        description,
        referenceId: referenceId || undefined,
        isRedeemed: true,
        redeemedAt: new Date(),
      });

      this.logger.info('Loyalty points redeemed successfully', { customerId, points });
      return { id: loyaltyPoint._id, ...loyaltyPoint.toObject() };
    } catch (error) {
      this.logger.error('Failed to redeem loyalty points:', error as Error);
      throw error;
    }
  }

  // Log customer activity
  async logCustomerActivity(
    customerId: string,
    activityType: string,
    description: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const activity = await CustomerActivity.create({
        customerId,
        activityType: activityType as any,
        description,
        metadata: metadata || undefined,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
      });

      this.logger.info('Customer activity logged successfully', { customerId, activityType });
      return { id: activity._id, ...activity.toObject() };
    } catch (error) {
      this.logger.error('Failed to log customer activity:', error as Error);
      throw error;
    }
  }

  // Send customer notification
  async sendCustomerNotification(customerId: string, type: string, title: string, message: string, metadata?: any) {
    try {
      const notification = await CustomerNotification.create({
        customerId,
        type: type as any,
        title,
        message,
        metadata: metadata || undefined,
      });

      this.logger.info('Customer notification sent successfully', { customerId, type });
      return { id: notification._id, ...notification.toObject() };
    } catch (error) {
      this.logger.error('Failed to send customer notification:', error as Error);
      throw error;
    }
  }
}

export default CustomerModel;
