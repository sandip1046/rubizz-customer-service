import { CustomerModel, CreateCustomerData, CustomerProfileData, CustomerPreferencesData, CustomerAddressData, CustomerSearchFilters, CustomerPaginationOptions } from '../models/Customer';
import DatabaseConnection from '../database/DatabaseConnection';
import RedisService from './RedisService';
import EmailService from './EmailService';
import { config } from '../config/config';
import { Logger } from '@sandip1046/rubizz-shared-libs';
import { v4 as uuidv4 } from 'uuid';

export class CustomerService {
  private customerModel: CustomerModel;
  private emailService: EmailService;
  private redisService: RedisService;
  private logger: Logger;

  constructor() {
    const prisma = DatabaseConnection.getInstance().getPrismaClient();
    this.customerModel = new CustomerModel(prisma);
    this.emailService = new EmailService();
    this.redisService = new RedisService();
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
  }

  // Create a new customer with email verification
  async createCustomer(customerData: CreateCustomerData) {
    try {
      // Check if customer already exists
      const existingCustomer = await this.customerModel.getCustomerByEmail(customerData.email);
      if (existingCustomer) {
        throw new Error('Customer with this email already exists');
      }

      // Check if phone is provided and already exists
      if (customerData.phone) {
        const existingPhoneCustomer = await this.customerModel.getCustomerByPhone(customerData.phone);
        if (existingPhoneCustomer) {
          throw new Error('Customer with this phone number already exists');
        }
      }

      // Create customer
      const customer = await this.customerModel.createCustomer(customerData);

      // Generate verification token if verification is required
      let verificationToken = null;
      if (config.customer.verificationRequired && !customer.isVerified) {
        verificationToken = uuidv4();
        
        // Store verification token in Redis with 24-hour expiry
        await this.redisService.setCache(
          `verification:${verificationToken}`,
          customer.id,
          24 * 60 * 60 // 24 hours
        );
      }

      // Send welcome email
      if (config.notifications.email) {
        try {
          await this.emailService.sendWelcomeEmail(customer.email, `${customer.firstName} ${customer.lastName}`);
        } catch (emailError) {
          this.logger.warn('Failed to send welcome email:', emailError);
        }
      }

      // Send verification email if required
      if (verificationToken) {
        try {
          await this.emailService.sendVerificationEmail(
            customer.email,
            `${customer.firstName} ${customer.lastName}`,
            verificationToken
          );
        } catch (emailError) {
          this.logger.warn('Failed to send verification email:', emailError);
        }
      }

      // Log customer activity
      await this.logCustomerActivity(customer.id, 'CUSTOMER_CREATED', 'Customer account created');

      this.logger.info('Customer created successfully', { customerId: customer.id, email: customer.email });
      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer:', error as Error);
      throw error;
    }
  }

  // Verify customer email
  async verifyCustomerEmail(verificationToken: string) {
    try {
      // Get customer ID from Redis
      const customerId = await this.redisService.getCache(`verification:${verificationToken}`);
      if (!customerId) {
        throw new Error('Invalid or expired verification token');
      }

      // Verify customer
      const customer = await this.customerModel.verifyCustomer(customerId);

      // Remove verification token from Redis
      await this.redisService.deleteCache(`verification:${verificationToken}`);

      // Log customer activity
      await this.logCustomerActivity(customerId, 'EMAIL_VERIFIED', 'Email address verified');

      this.logger.info('Customer email verified successfully', { customerId });
      return customer;
    } catch (error) {
      this.logger.error('Failed to verify customer email:', error as Error);
      throw error;
    }
  }

  // Update customer profile
  async updateCustomerProfile(customerId: string, profileData: CustomerProfileData) {
    try {
      const profile = await this.customerModel.updateCustomerProfile(customerId, profileData);

      // Log customer activity
      await this.logCustomerActivity(customerId, 'PROFILE_UPDATE', 'Customer profile updated');

      this.logger.info('Customer profile updated successfully', { customerId });
      return profile;
    } catch (error) {
      this.logger.error('Failed to update customer profile:', error as Error);
      throw error;
    }
  }

  // Update customer preferences
  async updateCustomerPreferences(customerId: string, preferencesData: CustomerPreferencesData) {
    try {
      const preferences = await this.customerModel.updateCustomerPreferences(customerId, preferencesData);

      // Log customer activity
      await this.logCustomerActivity(customerId, 'PREFERENCES_UPDATE', 'Customer preferences updated');

      this.logger.info('Customer preferences updated successfully', { customerId });
      return preferences;
    } catch (error) {
      this.logger.error('Failed to update customer preferences:', error as Error);
      throw error;
    }
  }

  // Add customer address
  async addCustomerAddress(customerId: string, addressData: CustomerAddressData) {
    try {
      const address = await this.customerModel.addCustomerAddress(customerId, addressData);

      // Log customer activity
      await this.logCustomerActivity(customerId, 'ADDRESS_ADDED', 'New address added');

      this.logger.info('Customer address added successfully', { customerId, addressId: address.id });
      return address;
    } catch (error) {
      this.logger.error('Failed to add customer address:', error as Error);
      throw error;
    }
  }

  // Update customer address
  async updateCustomerAddress(addressId: string, addressData: Partial<CustomerAddressData>) {
    try {
      const address = await this.customerModel.updateCustomerAddress(addressId, addressData);

      // Log customer activity
      await this.logCustomerActivity(address.customerId, 'ADDRESS_UPDATED', 'Address updated');

      this.logger.info('Customer address updated successfully', { addressId });
      return address;
    } catch (error) {
      this.logger.error('Failed to update customer address:', error as Error);
      throw error;
    }
  }

  // Delete customer address
  async deleteCustomerAddress(addressId: string) {
    try {
      // Get address details before deletion for logging
      const address = await this.customerModel.getCustomerById(addressId);
      
      await this.customerModel.deleteCustomerAddress(addressId);

      // Log customer activity
      if (address) {
        await this.logCustomerActivity(address.id, 'ADDRESS_DELETED', 'Address deleted');
      }

      this.logger.info('Customer address deleted successfully', { addressId });
    } catch (error) {
      this.logger.error('Failed to delete customer address:', error as Error);
      throw error;
    }
  }

  // Search customers with caching
  async searchCustomers(filters: CustomerSearchFilters, pagination: CustomerPaginationOptions = {}) {
    try {
      // Create cache key
      const cacheKey = `search:${JSON.stringify({ filters, pagination })}`;
      
      // Try to get from cache first
      const cachedResult = await this.redisService.getCache(cacheKey);
      if (cachedResult) {
        this.logger.debug('Customer search result retrieved from cache', { cacheKey });
        return JSON.parse(cachedResult);
      }

      // Search customers
      const result = await this.customerModel.searchCustomers(filters, pagination);

      // Cache result for 5 minutes
      await this.redisService.setCache(cacheKey, result, 300);

      this.logger.info('Customer search completed', { 
        total: result.pagination.total,
        page: result.pagination.page,
        filters 
      });
      return result;
    } catch (error) {
      this.logger.error('Failed to search customers:', error as Error);
      throw error;
    }
  }

  // Get customer with full details
  async getCustomerWithDetails(customerId: string) {
    try {
      const customer = await this.customerModel.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Get additional details
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
    } catch (error) {
      this.logger.error('Failed to get customer with details:', error as Error);
      throw error;
    }
  }

  // Get customer loyalty points
  async getCustomerLoyaltyPoints(customerId: string) {
    try {
      const prisma = DatabaseConnection.getInstance().getPrismaClient();
      
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
    } catch (error) {
      this.logger.error('Failed to get customer loyalty points:', error as Error);
      throw error;
    }
  }

  // Get customer recent activities
  async getCustomerRecentActivities(customerId: string, limit: number = 10) {
    try {
      const prisma = DatabaseConnection.getInstance().getPrismaClient();
      
      const activities = await prisma.customerActivity.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return activities;
    } catch (error) {
      this.logger.error('Failed to get customer recent activities:', error as Error);
      throw error;
    }
  }

  // Add loyalty points
  async addLoyaltyPoints(customerId: string, points: number, type: string, description: string, referenceId?: string) {
    try {
      const prisma = DatabaseConnection.getInstance().getPrismaClient();
      
      const loyaltyPoint = await prisma.customerLoyaltyPoint.create({
        data: {
          customerId,
          points,
          type: type as any,
          description,
          referenceId: referenceId || null,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
      });

      // Log customer activity
      await this.logCustomerActivity(customerId, 'LOYALTY_POINTS_EARNED', `Earned ${points} loyalty points`);

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
      // Check if customer has enough points
      const loyaltyPoints = await this.getCustomerLoyaltyPoints(customerId);
      if (loyaltyPoints.total < points) {
        throw new Error('Insufficient loyalty points');
      }

      const prisma = DatabaseConnection.getInstance().getPrismaClient();
      
      const loyaltyPoint = await prisma.customerLoyaltyPoint.create({
        data: {
          customerId,
          points: -points, // Negative points for redemption
          type: 'REDEEMED',
          description,
          referenceId: referenceId || null,
          isRedeemed: true,
          redeemedAt: new Date(),
        },
      });

      // Log customer activity
      await this.logCustomerActivity(customerId, 'LOYALTY_POINTS_REDEEMED', `Redeemed ${points} loyalty points`);

      this.logger.info('Loyalty points redeemed successfully', { customerId, points });
      return loyaltyPoint;
    } catch (error) {
      this.logger.error('Failed to redeem loyalty points:', error as Error);
      throw error;
    }
  }

  // Log customer activity
  async logCustomerActivity(customerId: string, activityType: string, description: string, metadata?: any) {
    try {
      const prisma = DatabaseConnection.getInstance().getPrismaClient();
      
      await prisma.customerActivity.create({
        data: {
          customerId,
          activityType: activityType as any,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log customer activity:', error as Error);
      // Don't throw error for activity logging failures
    }
  }

  // Send notification to customer
  async sendCustomerNotification(customerId: string, type: string, title: string, message: string, metadata?: any) {
    try {
      const prisma = DatabaseConnection.getInstance().getPrismaClient();
      
      // Create notification record
      const notification = await prisma.customerNotification.create({
        data: {
          customerId,
          type: type as any,
          title,
          message,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      // Get customer details for email
      const customer = await this.customerModel.getCustomerById(customerId);
      if (customer && config.notifications.email) {
        try {
          await this.emailService.sendNotificationEmail(
            customer.email,
            `${customer.firstName} ${customer.lastName}`,
            { title, message, type }
          );
        } catch (emailError) {
          this.logger.warn('Failed to send notification email:', emailError);
        }
      }

      this.logger.info('Customer notification sent successfully', { customerId, type });
      return notification;
    } catch (error) {
      this.logger.error('Failed to send customer notification:', error as Error);
      throw error;
    }
  }

  // Get customer statistics
  async getCustomerStatistics() {
    try {
      const stats = await this.customerModel.getCustomerStats();
      return stats;
    } catch (error) {
      this.logger.error('Failed to get customer statistics:', error as Error);
      throw error;
    }
  }

  // Update last login
  async updateLastLogin(customerId: string, ipAddress?: string, userAgent?: string) {
    try {
      await this.customerModel.updateLastLogin(customerId);

      // Log login activity
      await this.logCustomerActivity(customerId, 'LOGIN', 'Customer logged in', {
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      this.logger.info('Last login updated successfully', { customerId });
    } catch (error) {
      this.logger.error('Failed to update last login:', error as Error);
      throw error;
    }
  }

  // Delete customer (soft delete)
  async deleteCustomer(customerId: string) {
    try {
      await this.customerModel.deleteCustomer(customerId);

      // Log deletion activity
      await this.logCustomerActivity(customerId, 'ACCOUNT_DELETED', 'Customer account deleted');

      this.logger.info('Customer deleted successfully', { customerId });
    } catch (error) {
      this.logger.error('Failed to delete customer:', error as Error);
      throw error;
    }
  }
}

export default CustomerService;
