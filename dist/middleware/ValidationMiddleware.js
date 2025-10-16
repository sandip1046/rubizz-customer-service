"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = void 0;
const joi_1 = __importDefault(require("joi"));
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class ValidationMiddleware {
    static validate(schema, property = 'body') {
        return (req, res, next) => {
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
            req[property] = value;
            next();
        };
    }
}
exports.ValidationMiddleware = ValidationMiddleware;
ValidationMiddleware.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');
ValidationMiddleware.validateCustomerCreation = ValidationMiddleware.validate(joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Please provide a valid phone number',
    }),
    firstName: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must not exceed 50 characters',
        'any.required': 'First name is required',
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must not exceed 50 characters',
        'any.required': 'Last name is required',
    }),
    dateOfBirth: joi_1.default.date()
        .max('now')
        .optional()
        .messages({
        'date.max': 'Date of birth cannot be in the future',
    }),
    gender: joi_1.default.string()
        .valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')
        .optional()
        .messages({
        'any.only': 'Gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY',
    }),
}));
ValidationMiddleware.validateCustomerUpdate = ValidationMiddleware.validate(joi_1.default.object({
    firstName: joi_1.default.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must not exceed 50 characters',
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must not exceed 50 characters',
    }),
    dateOfBirth: joi_1.default.date()
        .max('now')
        .optional()
        .messages({
        'date.max': 'Date of birth cannot be in the future',
    }),
    gender: joi_1.default.string()
        .valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')
        .optional()
        .messages({
        'any.only': 'Gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY',
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Please provide a valid phone number',
    }),
}));
ValidationMiddleware.validateCustomerProfile = ValidationMiddleware.validate(joi_1.default.object({
    avatar: joi_1.default.string()
        .uri()
        .optional()
        .messages({
        'string.uri': 'Avatar must be a valid URL',
    }),
    bio: joi_1.default.string()
        .max(500)
        .optional()
        .messages({
        'string.max': 'Bio must not exceed 500 characters',
    }),
    preferences: joi_1.default.object()
        .optional()
        .messages({
        'object.base': 'Preferences must be an object',
    }),
    emergencyContact: joi_1.default.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Emergency contact must be a valid phone number',
    }),
    dietaryRestrictions: joi_1.default.string()
        .max(200)
        .optional()
        .messages({
        'string.max': 'Dietary restrictions must not exceed 200 characters',
    }),
    specialRequests: joi_1.default.string()
        .max(500)
        .optional()
        .messages({
        'string.max': 'Special requests must not exceed 500 characters',
    }),
}));
ValidationMiddleware.validateCustomerPreferences = ValidationMiddleware.validate(joi_1.default.object({
    language: joi_1.default.string()
        .length(2)
        .optional()
        .messages({
        'string.length': 'Language must be a 2-character code',
    }),
    currency: joi_1.default.string()
        .length(3)
        .optional()
        .messages({
        'string.length': 'Currency must be a 3-character code',
    }),
    timezone: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Timezone must be a string',
    }),
    emailNotifications: joi_1.default.boolean()
        .optional()
        .messages({
        'boolean.base': 'Email notifications must be a boolean',
    }),
    smsNotifications: joi_1.default.boolean()
        .optional()
        .messages({
        'boolean.base': 'SMS notifications must be a boolean',
    }),
    pushNotifications: joi_1.default.boolean()
        .optional()
        .messages({
        'boolean.base': 'Push notifications must be a boolean',
    }),
    marketingEmails: joi_1.default.boolean()
        .optional()
        .messages({
        'boolean.base': 'Marketing emails must be a boolean',
    }),
}));
ValidationMiddleware.validateCustomerAddress = ValidationMiddleware.validate(joi_1.default.object({
    type: joi_1.default.string()
        .valid('HOME', 'WORK', 'BILLING', 'SHIPPING', 'OTHER')
        .required()
        .messages({
        'any.only': 'Address type must be one of: HOME, WORK, BILLING, SHIPPING, OTHER',
        'any.required': 'Address type is required',
    }),
    addressLine1: joi_1.default.string()
        .min(5)
        .max(100)
        .required()
        .messages({
        'string.min': 'Address line 1 must be at least 5 characters long',
        'string.max': 'Address line 1 must not exceed 100 characters',
        'any.required': 'Address line 1 is required',
    }),
    addressLine2: joi_1.default.string()
        .max(100)
        .optional()
        .messages({
        'string.max': 'Address line 2 must not exceed 100 characters',
    }),
    city: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.min': 'City must be at least 2 characters long',
        'string.max': 'City must not exceed 50 characters',
        'any.required': 'City is required',
    }),
    state: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.min': 'State must be at least 2 characters long',
        'string.max': 'State must not exceed 50 characters',
        'any.required': 'State is required',
    }),
    postalCode: joi_1.default.string()
        .min(3)
        .max(20)
        .required()
        .messages({
        'string.min': 'Postal code must be at least 3 characters long',
        'string.max': 'Postal code must not exceed 20 characters',
        'any.required': 'Postal code is required',
    }),
    country: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.min': 'Country must be at least 2 characters long',
        'string.max': 'Country must not exceed 50 characters',
        'any.required': 'Country is required',
    }),
    isDefault: joi_1.default.boolean()
        .optional()
        .messages({
        'boolean.base': 'Is default must be a boolean',
    }),
}));
ValidationMiddleware.validateCustomerSearch = ValidationMiddleware.validate(joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .optional()
        .messages({
        'string.email': 'Please provide a valid email address',
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Please provide a valid phone number',
    }),
    firstName: joi_1.default.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must not exceed 50 characters',
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must not exceed 50 characters',
    }),
    isVerified: joi_1.default.boolean()
        .optional()
        .messages({
        'boolean.base': 'Is verified must be a boolean',
    }),
    isActive: joi_1.default.boolean()
        .optional()
        .messages({
        'boolean.base': 'Is active must be a boolean',
    }),
    createdFrom: joi_1.default.date()
        .optional()
        .messages({
        'date.base': 'Created from must be a valid date',
    }),
    createdTo: joi_1.default.date()
        .min(joi_1.default.ref('createdFrom'))
        .optional()
        .messages({
        'date.base': 'Created to must be a valid date',
        'date.min': 'Created to must be after created from',
    }),
    lastLoginFrom: joi_1.default.date()
        .optional()
        .messages({
        'date.base': 'Last login from must be a valid date',
    }),
    lastLoginTo: joi_1.default.date()
        .min(joi_1.default.ref('lastLoginFrom'))
        .optional()
        .messages({
        'date.base': 'Last login to must be a valid date',
        'date.min': 'Last login to must be after last login from',
    }),
}), 'query');
ValidationMiddleware.validatePagination = ValidationMiddleware.validate(joi_1.default.object({
    page: joi_1.default.number()
        .integer()
        .min(1)
        .optional()
        .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
    }),
    limit: joi_1.default.number()
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
    sortBy: joi_1.default.string()
        .valid('createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'lastLoginAt')
        .optional()
        .messages({
        'any.only': 'Sort by must be one of: createdAt, updatedAt, firstName, lastName, email, lastLoginAt',
    }),
    sortOrder: joi_1.default.string()
        .valid('asc', 'desc')
        .optional()
        .messages({
        'any.only': 'Sort order must be either asc or desc',
    }),
}), 'query');
ValidationMiddleware.validateCustomerId = ValidationMiddleware.validate(joi_1.default.object({
    customerId: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Customer ID is required',
    }),
}), 'params');
ValidationMiddleware.validateAddressId = ValidationMiddleware.validate(joi_1.default.object({
    addressId: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Address ID is required',
    }),
}), 'params');
exports.default = ValidationMiddleware;
//# sourceMappingURL=ValidationMiddleware.js.map