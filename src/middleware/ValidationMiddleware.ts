import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Logger } from '@sandip1046/rubizz-shared-libs';

export class ValidationMiddleware {
  private static logger = Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');

  // Generic validation middleware
  static validate(schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, res: Response, next: NextFunction): void => {
      const data = req[property];
      
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
      });

      if (error) {
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        ValidationMiddleware.logger.warn('Validation failed', {
          property,
          errors: errorDetails,
          data,
        });

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: errorDetails,
        });
      }

      // Replace the original data with validated and sanitized data
      req[property] = value;
      next();
    };
  }

  // Customer creation validation
  static validateCustomerCreation = ValidationMiddleware.validate(
    Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required',
        }),
      phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number',
        }),
      firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name must not exceed 50 characters',
          'any.required': 'First name is required',
        }),
      lastName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name must not exceed 50 characters',
          'any.required': 'Last name is required',
        }),
      dateOfBirth: Joi.date()
        .max('now')
        .optional()
        .messages({
          'date.max': 'Date of birth cannot be in the future',
        }),
      gender: Joi.string()
        .valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')
        .optional()
        .messages({
          'any.only': 'Gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY',
        }),
    })
  );

  // Customer update validation
  static validateCustomerUpdate = ValidationMiddleware.validate(
    Joi.object({
      firstName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name must not exceed 50 characters',
        }),
      lastName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name must not exceed 50 characters',
        }),
      dateOfBirth: Joi.date()
        .max('now')
        .optional()
        .messages({
          'date.max': 'Date of birth cannot be in the future',
        }),
      gender: Joi.string()
        .valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')
        .optional()
        .messages({
          'any.only': 'Gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY',
        }),
      phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number',
        }),
    })
  );

  // Customer profile validation
  static validateCustomerProfile = ValidationMiddleware.validate(
    Joi.object({
      avatar: Joi.string()
        .uri()
        .optional()
        .messages({
          'string.uri': 'Avatar must be a valid URL',
        }),
      bio: Joi.string()
        .max(500)
        .optional()
        .messages({
          'string.max': 'Bio must not exceed 500 characters',
        }),
      preferences: Joi.object()
        .optional()
        .messages({
          'object.base': 'Preferences must be an object',
        }),
      emergencyContact: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
          'string.pattern.base': 'Emergency contact must be a valid phone number',
        }),
      dietaryRestrictions: Joi.string()
        .max(200)
        .optional()
        .messages({
          'string.max': 'Dietary restrictions must not exceed 200 characters',
        }),
      specialRequests: Joi.string()
        .max(500)
        .optional()
        .messages({
          'string.max': 'Special requests must not exceed 500 characters',
        }),
    })
  );

  // Customer preferences validation
  static validateCustomerPreferences = ValidationMiddleware.validate(
    Joi.object({
      language: Joi.string()
        .length(2)
        .optional()
        .messages({
          'string.length': 'Language must be a 2-character code',
        }),
      currency: Joi.string()
        .length(3)
        .optional()
        .messages({
          'string.length': 'Currency must be a 3-character code',
        }),
      timezone: Joi.string()
        .optional()
        .messages({
          'string.base': 'Timezone must be a string',
        }),
      emailNotifications: Joi.boolean()
        .optional()
        .messages({
          'boolean.base': 'Email notifications must be a boolean',
        }),
      smsNotifications: Joi.boolean()
        .optional()
        .messages({
          'boolean.base': 'SMS notifications must be a boolean',
        }),
      pushNotifications: Joi.boolean()
        .optional()
        .messages({
          'boolean.base': 'Push notifications must be a boolean',
        }),
      marketingEmails: Joi.boolean()
        .optional()
        .messages({
          'boolean.base': 'Marketing emails must be a boolean',
        }),
    })
  );

  // Customer address validation
  static validateCustomerAddress = ValidationMiddleware.validate(
    Joi.object({
      type: Joi.string()
        .valid('HOME', 'WORK', 'BILLING', 'SHIPPING', 'OTHER')
        .required()
        .messages({
          'any.only': 'Address type must be one of: HOME, WORK, BILLING, SHIPPING, OTHER',
          'any.required': 'Address type is required',
        }),
      addressLine1: Joi.string()
        .min(5)
        .max(100)
        .required()
        .messages({
          'string.min': 'Address line 1 must be at least 5 characters long',
          'string.max': 'Address line 1 must not exceed 100 characters',
          'any.required': 'Address line 1 is required',
        }),
      addressLine2: Joi.string()
        .max(100)
        .optional()
        .messages({
          'string.max': 'Address line 2 must not exceed 100 characters',
        }),
      city: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'City must be at least 2 characters long',
          'string.max': 'City must not exceed 50 characters',
          'any.required': 'City is required',
        }),
      state: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'State must be at least 2 characters long',
          'string.max': 'State must not exceed 50 characters',
          'any.required': 'State is required',
        }),
      postalCode: Joi.string()
        .min(3)
        .max(20)
        .required()
        .messages({
          'string.min': 'Postal code must be at least 3 characters long',
          'string.max': 'Postal code must not exceed 20 characters',
          'any.required': 'Postal code is required',
        }),
      country: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'Country must be at least 2 characters long',
          'string.max': 'Country must not exceed 50 characters',
          'any.required': 'Country is required',
        }),
      isDefault: Joi.boolean()
        .optional()
        .messages({
          'boolean.base': 'Is default must be a boolean',
        }),
    })
  );

  // Customer search validation
  static validateCustomerSearch = ValidationMiddleware.validate(
    Joi.object({
      email: Joi.string()
        .email()
        .optional()
        .messages({
          'string.email': 'Please provide a valid email address',
        }),
      phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number',
        }),
      firstName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name must not exceed 50 characters',
        }),
      lastName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name must not exceed 50 characters',
        }),
      isVerified: Joi.boolean()
        .optional()
        .messages({
          'boolean.base': 'Is verified must be a boolean',
        }),
      isActive: Joi.boolean()
        .optional()
        .messages({
          'boolean.base': 'Is active must be a boolean',
        }),
      createdFrom: Joi.date()
        .optional()
        .messages({
          'date.base': 'Created from must be a valid date',
        }),
      createdTo: Joi.date()
        .min(Joi.ref('createdFrom'))
        .optional()
        .messages({
          'date.base': 'Created to must be a valid date',
          'date.min': 'Created to must be after created from',
        }),
      lastLoginFrom: Joi.date()
        .optional()
        .messages({
          'date.base': 'Last login from must be a valid date',
        }),
      lastLoginTo: Joi.date()
        .min(Joi.ref('lastLoginFrom'))
        .optional()
        .messages({
          'date.base': 'Last login to must be a valid date',
          'date.min': 'Last login to must be after last login from',
        }),
    }),
    'query'
  );

  // Pagination validation
  static validatePagination = ValidationMiddleware.validate(
    Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
          'number.base': 'Page must be a number',
          'number.integer': 'Page must be an integer',
          'number.min': 'Page must be at least 1',
        }),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .messages({
          'number.base': 'Limit must be a number',
          'number.integer': 'Limit must be an integer',
          'number.min': 'Limit must be at least 1',
          'number.max': 'Limit must not exceed 100',
        }),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'lastLoginAt')
        .optional()
        .messages({
          'any.only': 'Sort by must be one of: createdAt, updatedAt, firstName, lastName, email, lastLoginAt',
        }),
      sortOrder: Joi.string()
        .valid('asc', 'desc')
        .optional()
        .messages({
          'any.only': 'Sort order must be either asc or desc',
        }),
    }),
    'query'
  );

  // Customer ID validation
  static validateCustomerId = ValidationMiddleware.validate(
    Joi.object({
      customerId: Joi.string()
        .required()
        .messages({
          'any.required': 'Customer ID is required',
        }),
    }),
    'params'
  );

  // Address ID validation
  static validateAddressId = ValidationMiddleware.validate(
    Joi.object({
      addressId: Joi.string()
        .required()
        .messages({
          'any.required': 'Address ID is required',
        }),
    }),
    'params'
  );
}

export default ValidationMiddleware;
