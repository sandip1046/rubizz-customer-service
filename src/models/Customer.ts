import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';
import { Logger } from '@sandip1046/rubizz-shared-libs';

export interface CreateCustomerData {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
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
  type: 'HOME' | 'WORK' | 'BILLING' | 'SHIPPING' | 'OTHER';
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
  private prisma: PrismaClient;
  private logger: Logger;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
  }

  // Create a new customer
  async createCustomer(data: CreateCustomerData) {
    try {
      const customer = await this.prisma.customer.create({
        data: {
          ...data,
          isVerified: !config.customer.verificationRequired,
        },
        include: {
          profile: true,
          preferences: true,
          addresses: true,
        },
      });

      this.logger.info('Customer created successfully', { customerId: customer.id });
      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer:', error as Error);
      throw error;
    }
  }

  // Get customer by ID
  async getCustomerById(id: string) {
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
    } catch (error) {
      this.logger.error('Failed to get customer by ID:', error as Error);
      throw error;
    }
  }

  // Get customer by email
  async getCustomerByEmail(email: string) {
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
    } catch (error) {
      this.logger.error('Failed to get customer by email:', error as Error);
      throw error;
    }
  }

  // Get customer by phone
  async getCustomerByPhone(phone: string) {
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
    } catch (error) {
      this.logger.error('Failed to get customer by phone:', error as Error);
      throw error;
    }
  }

  // Update customer
  async updateCustomer(id: string, data: UpdateCustomerData) {
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
    } catch (error) {
      this.logger.error('Failed to update customer:', error as Error);
      throw error;
    }
  }

  // Delete customer (soft delete)
  async deleteCustomer(id: string) {
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

      const where: any = {};

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
    } catch (error) {
      this.logger.error('Failed to search customers:', error as Error);
      throw error;
    }
  }

  // Update customer profile
  async updateCustomerProfile(customerId: string, data: CustomerProfileData) {
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
    } catch (error) {
      this.logger.error('Failed to update customer profile:', error as Error);
      throw error;
    }
  }

  // Update customer preferences
  async updateCustomerPreferences(customerId: string, data: CustomerPreferencesData) {
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
    } catch (error) {
      this.logger.error('Failed to update customer address:', error as Error);
      throw error;
    }
  }

  // Delete customer address
  async deleteCustomerAddress(addressId: string) {
    try {
      await this.prisma.customerAddress.delete({
        where: { id: addressId },
      });

      this.logger.info('Customer address deleted successfully', { addressId });
    } catch (error) {
      this.logger.error('Failed to delete customer address:', error as Error);
      throw error;
    }
  }

  // Get customer addresses
  async getCustomerAddresses(customerId: string) {
    try {
      const addresses = await this.prisma.customerAddress.findMany({
        where: { customerId, isActive: true },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return addresses;
    } catch (error) {
      this.logger.error('Failed to get customer addresses:', error as Error);
      throw error;
    }
  }

  // Update last login
  async updateLastLogin(id: string, ipAddress?: string, userAgent?: string) {
    try {
      await this.prisma.customer.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });
      
      // Log the activity if ipAddress and userAgent are provided
      if (ipAddress || userAgent) {
        await this.logCustomerActivity(id, 'LOGIN', 'Customer logged in', {
          ipAddress,
          userAgent,
        });
      }
    } catch (error) {
      this.logger.error('Failed to update last login:', error as Error);
      throw error;
    }
  }

  // Verify customer
  async verifyCustomer(id: string) {
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
    } catch (error) {
      this.logger.error('Failed to verify customer:', error as Error);
      throw error;
    }
  }

  // Get customer statistics
  async getCustomerStats() {
    try {
      const [
        totalCustomers,
        verifiedCustomers,
        activeCustomers,
        newCustomersThisMonth,
        newCustomersThisWeek,
        newCustomersToday,
      ] = await Promise.all([
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
    } catch (error) {
      this.logger.error('Failed to get customer statistics:', error as Error);
      throw error;
    }
  }

  // Add loyalty points
  async addLoyaltyPoints(customerId: string, points: number, type: string, description: string, referenceId?: string) {
    try {
      const loyaltyPoint = await this.prisma.customerLoyaltyPoint.create({
        data: {
          customerId,
          points,
          type: type as any,
          description,
          referenceId: referenceId || null,
        },
      });

      this.logger.info('Loyalty points added successfully', { customerId, points, type });
      return loyaltyPoint;
    } catch (error) {
      this.logger.error('Failed to add loyalty points:', error as Error);
      throw error;
    }
  }

  // Redeem loyalty points
  async redeemLoyaltyPoints(customerId: string, points: number, description: string, referenceId?: string) {
    try {
      const loyaltyPoint = await this.prisma.customerLoyaltyPoint.create({
        data: {
          customerId,
          points: -points, // Negative points for redemption
          type: 'REDEEMED',
          description,
          referenceId: referenceId || null,
        },
      });

      this.logger.info('Loyalty points redeemed successfully', { customerId, points });
      return loyaltyPoint;
    } catch (error) {
      this.logger.error('Failed to redeem loyalty points:', error as Error);
      throw error;
    }
  }

  // Log customer activity
  async logCustomerActivity(customerId: string, activityType: string, description: string, metadata?: any, ipAddress?: string, userAgent?: string) {
    try {
      const activity = await this.prisma.customerActivity.create({
        data: {
          customerId,
          activityType: activityType as any,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });

      this.logger.info('Customer activity logged successfully', { customerId, activityType });
      return activity;
    } catch (error) {
      this.logger.error('Failed to log customer activity:', error as Error);
      throw error;
    }
  }

  // Send customer notification
  async sendCustomerNotification(customerId: string, type: string, title: string, message: string, metadata?: any) {
    try {
      const notification = await this.prisma.customerNotification.create({
        data: {
          customerId,
          type: type as any,
          title,
          message,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      this.logger.info('Customer notification sent successfully', { customerId, type });
      return notification;
    } catch (error) {
      this.logger.error('Failed to send customer notification:', error as Error);
      throw error;
    }
  }
}

export default CustomerModel;
