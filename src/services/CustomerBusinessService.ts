import { CustomerModel, CreateCustomerData, UpdateCustomerData, CustomerProfileData, CustomerPreferencesData, CustomerAddressData, CustomerSearchFilters, CustomerPaginationOptions } from '../models/Customer';
import { Logger } from '@sandip1046/rubizz-shared-libs';
import RedisService from './RedisService';
import EmailService from './EmailService';
import KafkaService from '../kafka/KafkaService';

export class CustomerBusinessService {
  private customerModel: CustomerModel;
  private redisService: RedisService;
  private emailService: EmailService;
  private kafkaService: KafkaService | undefined;
  private logger: Logger;

  constructor(kafkaService?: KafkaService) {
    this.customerModel = new CustomerModel();
    this.redisService = new RedisService();
    this.emailService = new EmailService();
    this.kafkaService = kafkaService;
    this.logger = Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');
  }

  // Core Customer Operations
  async createCustomer(customerData: CreateCustomerData, requestId?: string) {
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

      const customer = await this.customerModel.createCustomer(customerData);

      if (!customer || !customer.id) {
        throw new Error('Failed to create customer');
      }

      // Cache customer data
      await this.redisService.setCache(customer.id, customer, 3600);

      // Send welcome email
      await this.emailService.sendWelcomeEmail(customer.email, customer.firstName);

      // Publish event to Kafka
      if (this.kafkaService) {
        await this.kafkaService.publishCustomerCreatedEvent(customer, requestId);
      }

      this.logger.info('Customer created successfully', { 
        customerId: customer.id, 
        email: customer.email,
        requestId 
      });

      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer:', error as Error);
      throw error;
    }
  }

  async getCustomerById(customerId: string) {
    try {
      // Try cache first
      const cachedCustomer = await this.redisService.getCache(customerId);
      if (cachedCustomer) {
        return cachedCustomer;
      }

      const customer = await this.customerModel.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Cache the result
      await this.redisService.setCache(customerId, customer, 3600);

      return customer;
    } catch (error) {
      this.logger.error('Failed to get customer by ID:', error as Error);
      throw error;
    }
  }

  async getCustomerByEmail(email: string) {
    try {
      const customer = await this.customerModel.getCustomerByEmail(email);
      if (!customer) {
        throw new Error('Customer not found');
      }
      return customer;
    } catch (error) {
      this.logger.error('Failed to get customer by email:', error as Error);
      throw error;
    }
  }

  async updateCustomer(customerId: string, updateData: UpdateCustomerData, requestId?: string) {
    try {
      // Check if customer exists
      const existingCustomer = await this.customerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        throw new Error('Customer not found');
      }

      // Check if phone is being updated and already exists
      if (updateData.phone && updateData.phone !== existingCustomer.phone) {
        const existingPhoneCustomer = await this.customerModel.getCustomerByPhone(updateData.phone);
        if (existingPhoneCustomer && existingPhoneCustomer.id !== customerId) {
          throw new Error('Customer with this phone number already exists');
        }
      }

      const customer = await this.customerModel.updateCustomer(customerId, updateData);

      // Update cache
      await this.redisService.setCache(customerId, customer, 3600);

      // Publish event to Kafka
      if (this.kafkaService) {
        await this.kafkaService.publishCustomerUpdatedEvent(customer, requestId);
      }

      this.logger.info('Customer updated successfully', { customerId, requestId });
      return customer;
    } catch (error) {
      this.logger.error('Failed to update customer:', error as Error);
      throw error;
    }
  }

  async deleteCustomer(customerId: string, requestId?: string) {
    try {
      // Check if customer exists
      const existingCustomer = await this.customerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        throw new Error('Customer not found');
      }

      await this.customerModel.deleteCustomer(customerId);

      // Remove from cache
      await this.redisService.deleteCache(customerId);

      this.logger.info('Customer deleted successfully', { customerId, requestId });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete customer:', error as Error);
      throw error;
    }
  }

  async searchCustomers(filters: CustomerSearchFilters, pagination: CustomerPaginationOptions) {
    try {
      const result = await this.customerModel.searchCustomers(filters, pagination);
      return result;
    } catch (error) {
      this.logger.error('Failed to search customers:', error as Error);
      throw error;
    }
  }

  async getCustomerStats() {
    try {
      const stats = await this.customerModel.getCustomerStats();
      return stats;
    } catch (error) {
      this.logger.error('Failed to get customer statistics:', error as Error);
      throw error;
    }
  }

  // Profile Management
  async updateCustomerProfile(customerId: string, profileData: CustomerProfileData, requestId?: string) {
    try {
      const profile = await this.customerModel.updateCustomerProfile(customerId, profileData);
      
      // Update cache
      const customer = await this.getCustomerById(customerId);
      await this.redisService.setCache(customerId, customer, 3600);

      this.logger.info('Customer profile updated successfully', { customerId, requestId });
      return profile;
    } catch (error) {
      this.logger.error('Failed to update customer profile:', error as Error);
      throw error;
    }
  }

  async updateCustomerPreferences(customerId: string, preferencesData: CustomerPreferencesData, requestId?: string) {
    try {
      const preferences = await this.customerModel.updateCustomerPreferences(customerId, preferencesData);
      
      // Update cache
      const customer = await this.getCustomerById(customerId);
      await this.redisService.setCache(customerId, customer, 3600);

      this.logger.info('Customer preferences updated successfully', { customerId, requestId });
      return preferences;
    } catch (error) {
      this.logger.error('Failed to update customer preferences:', error as Error);
      throw error;
    }
  }

  // Address Management
  async addCustomerAddress(customerId: string, addressData: CustomerAddressData, requestId?: string) {
    try {
      const address = await this.customerModel.addCustomerAddress(customerId, addressData);
      
      // Update cache
      const customer = await this.getCustomerById(customerId);
      await this.redisService.setCache(customerId, customer, 3600);

      // Publish event to Kafka
      if (this.kafkaService) {
        await this.kafkaService.publishCustomerAddressAddedEvent(customerId, address, requestId);
      }

      this.logger.info('Customer address added successfully', { customerId, addressId: address.id, requestId });
      return address;
    } catch (error) {
      this.logger.error('Failed to add customer address:', error as Error);
      throw error;
    }
  }

  async getCustomerAddresses(customerId: string) {
    try {
      const addresses = await this.customerModel.getCustomerAddresses(customerId);
      return addresses;
    } catch (error) {
      this.logger.error('Failed to get customer addresses:', error as Error);
      throw error;
    }
  }

  async updateCustomerAddress(addressId: string, addressData: Partial<CustomerAddressData>, requestId?: string) {
    try {
      const address = await this.customerModel.updateCustomerAddress(addressId, addressData);
      
      // Update cache for the customer
      const customer = await this.getCustomerById(address.customerId);
      await this.redisService.setCache(address.customerId, customer, 3600);

      this.logger.info('Customer address updated successfully', { addressId, requestId });
      return address;
    } catch (error) {
      this.logger.error('Failed to update customer address:', error as Error);
      throw error;
    }
  }

  async deleteCustomerAddress(addressId: string, requestId?: string) {
    try {
      // Delete the address and get the customerId
      const customerId = await this.customerModel.deleteCustomerAddress(addressId);
      
      // Update cache
      const customer = await this.getCustomerById(customerId);
      await this.redisService.setCache(customerId, customer, 3600);

      this.logger.info('Customer address deleted successfully', { addressId, customerId, requestId });
      return customerId;
    } catch (error) {
      this.logger.error('Failed to delete customer address:', error as Error);
      throw error;
    }
  }

  // Verification and Authentication
  async verifyCustomer(customerId: string, requestId?: string) {
    try {
      const customer = await this.customerModel.verifyCustomer(customerId);
      
      // Update cache
      await this.redisService.setCache(customerId, customer, 3600);

      // Publish event to Kafka
      if (this.kafkaService) {
        await this.kafkaService.publishCustomerVerifiedEvent(customer, requestId);
      }

      this.logger.info('Customer verified successfully', { customerId, requestId });
      return customer;
    } catch (error) {
      this.logger.error('Failed to verify customer:', error as Error);
      throw error;
    }
  }

  async updateLastLogin(customerId: string, ipAddress?: string, userAgent?: string, requestId?: string) {
    try {
      await this.customerModel.updateLastLogin(customerId, ipAddress, userAgent);
      
      // Update cache
      const customer = await this.getCustomerById(customerId);
      await this.redisService.setCache(customerId, customer, 3600);

      this.logger.info('Last login updated successfully', { customerId, requestId });
      return true;
    } catch (error) {
      this.logger.error('Failed to update last login:', error as Error);
      throw error;
    }
  }

  // Loyalty Points
  async addLoyaltyPoints(customerId: string, points: number, type: string, description: string, referenceId?: string, requestId?: string) {
    try {
      const loyaltyPoint = await this.customerModel.addLoyaltyPoints(
        customerId,
        points,
        type,
        description,
        referenceId
      );

      // Update cache
      const customer = await this.getCustomerById(customerId);
      await this.redisService.setCache(customerId, customer, 3600);

      this.logger.info('Loyalty points added successfully', { customerId, points, type, requestId });
      return loyaltyPoint;
    } catch (error) {
      this.logger.error('Failed to add loyalty points:', error as Error);
      throw error;
    }
  }

  async redeemLoyaltyPoints(customerId: string, points: number, description: string, referenceId?: string, requestId?: string) {
    try {
      const loyaltyPoint = await this.customerModel.redeemLoyaltyPoints(
        customerId,
        points,
        description,
        referenceId
      );

      // Update cache
      const customer = await this.getCustomerById(customerId);
      await this.redisService.setCache(customerId, customer, 3600);

      this.logger.info('Loyalty points redeemed successfully', { customerId, points, requestId });
      return loyaltyPoint;
    } catch (error) {
      this.logger.error('Failed to redeem loyalty points:', error as Error);
      throw error;
    }
  }

  // Activity Logging
  async logCustomerActivity(customerId: string, activityType: string, description: string, metadata?: any, ipAddress?: string, userAgent?: string, requestId?: string) {
    try {
      await this.customerModel.logCustomerActivity(
        customerId,
        activityType,
        description,
        metadata,
        ipAddress,
        userAgent
      );

      this.logger.info('Customer activity logged successfully', { customerId, activityType, requestId });
      return true;
    } catch (error) {
      this.logger.error('Failed to log customer activity:', error as Error);
      throw error;
    }
  }

  // Notifications
  async sendCustomerNotification(customerId: string, type: string, title: string, message: string, metadata?: any, requestId?: string) {
    try {
      const notification = await this.customerModel.sendCustomerNotification(
        customerId,
        type,
        title,
        message,
        metadata
      );

      // Publish event to Kafka
      if (this.kafkaService) {
        await this.kafkaService.publishCustomerNotificationSentEvent(customerId, notification, requestId);
      }

      this.logger.info('Customer notification sent successfully', { customerId, type, requestId });
      return notification;
    } catch (error) {
      this.logger.error('Failed to send customer notification:', error as Error);
      throw error;
    }
  }
}

export default CustomerBusinessService;
