import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Logger } from '@sandip1046/rubizz-shared-libs';
import { config } from '../config/config';
import path from 'path';
import { CustomerController } from '../controllers/CustomerController';
import { HealthController } from '../controllers/HealthController';

export interface GrpcServiceDefinition {
  [key: string]: any;
}

export class GrpcServer {
  private logger: Logger;
  private server: grpc.Server;
  private customerController: CustomerController;
  private healthController: HealthController;

  constructor(customerController: CustomerController, healthController: HealthController) {
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
    this.server = new grpc.Server();
    this.customerController = customerController;
    this.healthController = healthController;
  }

  /**
   * Initialize gRPC server
   */
  public async initialize(): Promise<void> {
    try {
      // Load proto definition
      const protoDefinition = await this.loadProtoDefinition();
      
      // Get service definition
      const serviceDefinition = protoDefinition['rubizz.customer']['CustomerService'];
      
      // Add service to server
      this.server.addService(serviceDefinition.service, {
        // Customer management methods
        CreateCustomer: this.handleCreateCustomer.bind(this),
        GetCustomer: this.handleGetCustomer.bind(this),
        UpdateCustomer: this.handleUpdateCustomer.bind(this),
        DeleteCustomer: this.handleDeleteCustomer.bind(this),
        SearchCustomers: this.handleSearchCustomers.bind(this),
        GetCustomerByEmail: this.handleGetCustomerByEmail.bind(this),
        GetCustomerStats: this.handleGetCustomerStats.bind(this),
        
        // Customer profile methods
        UpdateCustomerProfile: this.handleUpdateCustomerProfile.bind(this),
        UpdateCustomerPreferences: this.handleUpdateCustomerPreferences.bind(this),
        
        // Address management methods
        AddCustomerAddress: this.handleAddCustomerAddress.bind(this),
        GetCustomerAddresses: this.handleGetCustomerAddresses.bind(this),
        UpdateCustomerAddress: this.handleUpdateCustomerAddress.bind(this),
        DeleteCustomerAddress: this.handleDeleteCustomerAddress.bind(this),
        
        // Verification methods
        VerifyCustomer: this.handleVerifyCustomer.bind(this),
        UpdateLastLogin: this.handleUpdateLastLogin.bind(this),
        
        // Loyalty points methods
        AddLoyaltyPoints: this.handleAddLoyaltyPoints.bind(this),
        RedeemLoyaltyPoints: this.handleRedeemLoyaltyPoints.bind(this),
        GetLoyaltyPoints: this.handleGetLoyaltyPoints.bind(this),
        
        // Notification methods
        SendNotification: this.handleSendNotification.bind(this),
        GetNotifications: this.handleGetNotifications.bind(this),
        
        // Health check
        HealthCheck: this.handleHealthCheck.bind(this),
      });

      this.logger.info('gRPC server initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize gRPC server', error as Error);
      throw error;
    }
  }

  /**
   * Load proto definition from file
   */
  private async loadProtoDefinition(): Promise<any> {
    try {
      const protoPath = path.join(__dirname, '../../proto/customer.proto');
      
      const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [
          path.join(__dirname, '../../proto'),
          path.join(__dirname, '../../../rubizz-api-gateway/proto')
        ]
      });

      return grpc.loadPackageDefinition(packageDefinition);
    } catch (error) {
      this.logger.error('Failed to load proto definition', error as Error);
      throw error;
    }
  }

  /**
   * Start gRPC server
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const port = config.grpc?.port || 50053;
      
      this.server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (error: any, port: any) => {
          if (error) {
            this.logger.error('Failed to bind gRPC server', error);
            reject(error);
            return;
          }

          this.server.start();
          this.logger.info(`gRPC server started on port ${port}`);
          resolve();
        }
      );
    });
  }

  /**
   * Stop gRPC server
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.forceShutdown();
      this.logger.info('gRPC server stopped');
      resolve();
    });
  }

  // Customer management handlers
  private async handleCreateCustomer(call: any, callback: any): Promise<void> {
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

      const customer = await this.customerController.createCustomer({ body: customerData } as any, {} as any, () => {});
      
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
    } catch (error) {
      this.logger.error('Failed to create customer via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to create customer'
      });
    }
  }

  private async handleGetCustomer(call: any, callback: any): Promise<void> {
    try {
      const request = call.request;
      const customer = await this.customerController.getCustomerById({ params: { customerId: request.customer_id } } as any, {} as any, () => {});
      
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
    } catch (error) {
      this.logger.error('Failed to get customer via gRPC', error as Error);
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Customer not found'
      });
    }
  }

  private async handleUpdateCustomer(call: any, callback: any): Promise<void> {
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
      } as any, {} as any, () => {});
      
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
    } catch (error) {
      this.logger.error('Failed to update customer via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to update customer'
      });
    }
  }

  private async handleDeleteCustomer(call: any, callback: any): Promise<void> {
    try {
      const request = call.request;
      await this.customerController.deleteCustomer({ params: { customerId: request.customer_id } } as any, {} as any, () => {});
      
      const response = {
        api_response: {
          success: true,
          message: 'Customer deleted successfully',
          timestamp: Date.now(),
          request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };

      callback(null, response);
    } catch (error) {
      this.logger.error('Failed to delete customer via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to delete customer'
      });
    }
  }

  private async handleSearchCustomers(call: any, callback: any): Promise<void> {
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
        customers: result.customers?.map((customer: any) => this.mapCustomerToProto(customer)) || [],
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
    } catch (error) {
      this.logger.error('Failed to search customers via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to search customers'
      });
    }
  }

  private async handleGetCustomerByEmail(call: any, callback: any): Promise<void> {
    try {
      const request = call.request;
      const customer = await this.customerController.getCustomerByEmail({ query: { email: request.email } } as any, {} as any, () => {});
      
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
    } catch (error) {
      this.logger.error('Failed to get customer by email via gRPC', error as Error);
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Customer not found'
      });
    }
  }

  private async handleGetCustomerStats(_call: any, callback: any): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to get customer stats via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get customer statistics'
      });
    }
  }

  // Profile management handlers
  private async handleUpdateCustomerProfile(call: any, callback: any): Promise<void> {
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
      } as any, {} as any, () => {});
      
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
    } catch (error) {
      this.logger.error('Failed to update customer profile via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to update customer profile'
      });
    }
  }

  private async handleUpdateCustomerPreferences(call: any, callback: any): Promise<void> {
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
      } as any, {} as any, () => {});
      
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
    } catch (error) {
      this.logger.error('Failed to update customer preferences via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to update customer preferences'
      });
    }
  }

  // Address management handlers
  private async handleAddCustomerAddress(call: any, callback: any): Promise<void> {
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
      } as any, {} as any, () => {});
      
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
    } catch (error) {
      this.logger.error('Failed to add customer address via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to add customer address'
      });
    }
  }

  private async handleGetCustomerAddresses(call: any, callback: any): Promise<void> {
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
        addresses: addresses.map((address: any) => this.mapCustomerAddressToProto(address)) || []
      };

      callback(null, response);
    } catch (error) {
      this.logger.error('Failed to get customer addresses via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get customer addresses'
      });
    }
  }

  private async handleUpdateCustomerAddress(call: any, callback: any): Promise<void> {
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
      } as any, {} as any, () => {});
      
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
    } catch (error) {
      this.logger.error('Failed to update customer address via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to update customer address'
      });
    }
  }

  private async handleDeleteCustomerAddress(call: any, callback: any): Promise<void> {
    try {
      const request = call.request;
      await this.customerController.deleteCustomerAddress({ 
        params: { addressId: request.address_id }
      } as any, {} as any, () => {});
      
      const response = {
        api_response: {
          success: true,
          message: 'Customer address deleted successfully',
          timestamp: Date.now(),
          request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };

      callback(null, response);
    } catch (error) {
      this.logger.error('Failed to delete customer address via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to delete customer address'
      });
    }
  }

  // Verification handlers
  private async handleVerifyCustomer(call: any, callback: any): Promise<void> {
    try {
      const request = call.request;
      const customer = await this.customerController.verifyCustomer({ 
        params: { customerId: request.customer_id }
      } as any, {} as any, () => {});
      
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
    } catch (error) {
      this.logger.error('Failed to verify customer via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to verify customer'
      });
    }
  }

  private async handleUpdateLastLogin(call: any, callback: any): Promise<void> {
    try {
      const request = call.request;
      await this.customerController.updateLastLogin({ 
        params: { customerId: request.customer_id }
      } as any, {} as any, () => {});
      
      const response = {
        api_response: {
          success: true,
          message: 'Last login updated successfully',
          timestamp: Date.now(),
          request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };

      callback(null, response);
    } catch (error) {
      this.logger.error('Failed to update last login via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to update last login'
      });
    }
  }

  // Loyalty points handlers (placeholder implementations)
  private async handleAddLoyaltyPoints(_call: any, callback: any): Promise<void> {
    try {
      // Implementation would go here
      callback({
        code: grpc.status.UNIMPLEMENTED,
        message: 'Add loyalty points not implemented yet'
      });
    } catch (error) {
      this.logger.error('Failed to add loyalty points via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to add loyalty points'
      });
    }
  }

  private async handleRedeemLoyaltyPoints(_call: any, callback: any): Promise<void> {
    try {
      // Implementation would go here
      callback({
        code: grpc.status.UNIMPLEMENTED,
        message: 'Redeem loyalty points not implemented yet'
      });
    } catch (error) {
      this.logger.error('Failed to redeem loyalty points via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to redeem loyalty points'
      });
    }
  }

  private async handleGetLoyaltyPoints(_call: any, callback: any): Promise<void> {
    try {
      // Implementation would go here
      callback({
        code: grpc.status.UNIMPLEMENTED,
        message: 'Get loyalty points not implemented yet'
      });
    } catch (error) {
      this.logger.error('Failed to get loyalty points via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get loyalty points'
      });
    }
  }

  // Notification handlers (placeholder implementations)
  private async handleSendNotification(_call: any, callback: any): Promise<void> {
    try {
      // Implementation would go here
      callback({
        code: grpc.status.UNIMPLEMENTED,
        message: 'Send notification not implemented yet'
      });
    } catch (error) {
      this.logger.error('Failed to send notification via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to send notification'
      });
    }
  }

  private async handleGetNotifications(_call: any, callback: any): Promise<void> {
    try {
      // Implementation would go here
      callback({
        code: grpc.status.UNIMPLEMENTED,
        message: 'Get notifications not implemented yet'
      });
    } catch (error) {
      this.logger.error('Failed to get notifications via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get notifications'
      });
    }
  }

  // Health check handler
  private async handleHealthCheck(_call: any, callback: any): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to perform health check via gRPC', error as Error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Health check failed'
      });
    }
  }

  // Helper methods to map data to protobuf format
  private mapCustomerToProto(customer: any): any {
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
      addresses: customer.addresses?.map((addr: any) => this.mapCustomerAddressToProto(addr)) || [],
      loyalty_points: customer.loyaltyPoints?.map((lp: any) => this.mapCustomerLoyaltyPointToProto(lp)) || [],
      activities: customer.activities?.map((act: any) => this.mapCustomerActivityToProto(act)) || [],
      notifications: customer.notifications?.map((notif: any) => this.mapCustomerNotificationToProto(notif)) || []
    };
  }

  private mapCustomerProfileToProto(profile: any): any {
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

  private mapCustomerPreferencesToProto(preferences: any): any {
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

  private mapCustomerAddressToProto(address: any): any {
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

  private mapCustomerLoyaltyPointToProto(loyaltyPoint: any): any {
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

  private mapCustomerActivityToProto(activity: any): any {
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

  private mapCustomerNotificationToProto(notification: any): any {
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

export default GrpcServer;
