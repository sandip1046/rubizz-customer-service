import { Request, Response, NextFunction } from 'express';
import { CustomerModel, CreateCustomerData, UpdateCustomerData, CustomerProfileData, CustomerPreferencesData, CustomerAddressData, CustomerSearchFilters, CustomerPaginationOptions } from '../models/Customer';
import DatabaseConnection from '../database/DatabaseConnection';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { logger } from '@shared/logger';

export class CustomerController {
  private customerModel: CustomerModel;

  constructor() {
    const prisma = DatabaseConnection.getInstance().getPrismaClient();
    this.customerModel = new CustomerModel(prisma);
  }

  // Create a new customer
  public createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerData: CreateCustomerData = req.body;

      // Check if customer already exists
      const existingCustomer = await this.customerModel.getCustomerByEmail(customerData.email);
      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: 'Customer with this email already exists',
          code: 'CUSTOMER_EXISTS',
        });
      }

      // Check if phone is provided and already exists
      if (customerData.phone) {
        const existingPhoneCustomer = await this.customerModel.getCustomerByPhone(customerData.phone);
        if (existingPhoneCustomer) {
          return res.status(409).json({
            success: false,
            message: 'Customer with this phone number already exists',
            code: 'PHONE_EXISTS',
          });
        }
      }

      const customer = await this.customerModel.createCustomer(customerData);

      logger.info('Customer created successfully', { customerId: customer.id, email: customer.email });

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
    } catch (error) {
      logger.error('Failed to create customer:', error);
      next(error);
    }
  };

  // Get customer by ID
  public getCustomerById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;

      const customer = await this.customerModel.getCustomerById(customerId);
      if (!customer) {
        return res.status(404).json({
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
    } catch (error) {
      logger.error('Failed to get customer by ID:', error);
      next(error);
    }
  };

  // Get customer by email
  public getCustomerByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email parameter is required',
          code: 'EMAIL_REQUIRED',
        });
      }

      const customer = await this.customerModel.getCustomerByEmail(email);
      if (!customer) {
        return res.status(404).json({
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
    } catch (error) {
      logger.error('Failed to get customer by email:', error);
      next(error);
    }
  };

  // Update customer
  public updateCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const updateData: UpdateCustomerData = req.body;

      // Check if customer exists
      const existingCustomer = await this.customerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          code: 'CUSTOMER_NOT_FOUND',
        });
      }

      // Check if phone is being updated and already exists
      if (updateData.phone && updateData.phone !== existingCustomer.phone) {
        const existingPhoneCustomer = await this.customerModel.getCustomerByPhone(updateData.phone);
        if (existingPhoneCustomer && existingPhoneCustomer.id !== customerId) {
          return res.status(409).json({
            success: false,
            message: 'Customer with this phone number already exists',
            code: 'PHONE_EXISTS',
          });
        }
      }

      const customer = await this.customerModel.updateCustomer(customerId, updateData);

      logger.info('Customer updated successfully', { customerId });

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: { customer },
      });
    } catch (error) {
      logger.error('Failed to update customer:', error);
      next(error);
    }
  };

  // Delete customer (soft delete)
  public deleteCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;

      // Check if customer exists
      const existingCustomer = await this.customerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          code: 'CUSTOMER_NOT_FOUND',
        });
      }

      await this.customerModel.deleteCustomer(customerId);

      logger.info('Customer deleted successfully', { customerId });

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete customer:', error);
      next(error);
    }
  };

  // Search customers
  public searchCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: CustomerSearchFilters = req.query;
      const pagination: CustomerPaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await this.customerModel.searchCustomers(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Customers retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Failed to search customers:', error);
      next(error);
    }
  };

  // Update customer profile
  public updateCustomerProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const profileData: CustomerProfileData = req.body;

      // Check if customer exists
      const existingCustomer = await this.customerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          code: 'CUSTOMER_NOT_FOUND',
        });
      }

      const profile = await this.customerModel.updateCustomerProfile(customerId, profileData);

      logger.info('Customer profile updated successfully', { customerId });

      res.status(200).json({
        success: true,
        message: 'Customer profile updated successfully',
        data: { profile },
      });
    } catch (error) {
      logger.error('Failed to update customer profile:', error);
      next(error);
    }
  };

  // Update customer preferences
  public updateCustomerPreferences = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const preferencesData: CustomerPreferencesData = req.body;

      // Check if customer exists
      const existingCustomer = await this.customerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          code: 'CUSTOMER_NOT_FOUND',
        });
      }

      const preferences = await this.customerModel.updateCustomerPreferences(customerId, preferencesData);

      logger.info('Customer preferences updated successfully', { customerId });

      res.status(200).json({
        success: true,
        message: 'Customer preferences updated successfully',
        data: { preferences },
      });
    } catch (error) {
      logger.error('Failed to update customer preferences:', error);
      next(error);
    }
  };

  // Add customer address
  public addCustomerAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const addressData: CustomerAddressData = req.body;

      // Check if customer exists
      const existingCustomer = await this.customerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          code: 'CUSTOMER_NOT_FOUND',
        });
      }

      const address = await this.customerModel.addCustomerAddress(customerId, addressData);

      logger.info('Customer address added successfully', { customerId, addressId: address.id });

      res.status(201).json({
        success: true,
        message: 'Customer address added successfully',
        data: { address },
      });
    } catch (error) {
      logger.error('Failed to add customer address:', error);
      next(error);
    }
  };

  // Update customer address
  public updateCustomerAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { addressId } = req.params;
      const addressData: Partial<CustomerAddressData> = req.body;

      const address = await this.customerModel.updateCustomerAddress(addressId, addressData);

      logger.info('Customer address updated successfully', { addressId });

      res.status(200).json({
        success: true,
        message: 'Customer address updated successfully',
        data: { address },
      });
    } catch (error) {
      logger.error('Failed to update customer address:', error);
      next(error);
    }
  };

  // Delete customer address
  public deleteCustomerAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { addressId } = req.params;

      await this.customerModel.deleteCustomerAddress(addressId);

      logger.info('Customer address deleted successfully', { addressId });

      res.status(200).json({
        success: true,
        message: 'Customer address deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete customer address:', error);
      next(error);
    }
  };

  // Get customer addresses
  public getCustomerAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;

      // Check if customer exists
      const existingCustomer = await this.customerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        return res.status(404).json({
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
    } catch (error) {
      logger.error('Failed to get customer addresses:', error);
      next(error);
    }
  };

  // Verify customer
  public verifyCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;

      // Check if customer exists
      const existingCustomer = await this.customerModel.getCustomerById(customerId);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          code: 'CUSTOMER_NOT_FOUND',
        });
      }

      const customer = await this.customerModel.verifyCustomer(customerId);

      logger.info('Customer verified successfully', { customerId });

      res.status(200).json({
        success: true,
        message: 'Customer verified successfully',
        data: { customer },
      });
    } catch (error) {
      logger.error('Failed to verify customer:', error);
      next(error);
    }
  };

  // Get customer statistics
  public getCustomerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.customerModel.getCustomerStats();

      res.status(200).json({
        success: true,
        message: 'Customer statistics retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      logger.error('Failed to get customer statistics:', error);
      next(error);
    }
  };

  // Update last login
  public updateLastLogin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;

      await this.customerModel.updateLastLogin(customerId);

      logger.info('Last login updated successfully', { customerId });

      res.status(200).json({
        success: true,
        message: 'Last login updated successfully',
      });
    } catch (error) {
      logger.error('Failed to update last login:', error);
      next(error);
    }
  };
}

export default CustomerController;
