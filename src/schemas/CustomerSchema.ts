import mongoose, { Schema, Document } from 'mongoose';

// Enum Types
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  OTHER = 'OTHER',
}

export enum BookingType {
  HOTEL_ROOM = 'HOTEL_ROOM',
  RESTAURANT_TABLE = 'RESTAURANT_TABLE',
  HALL_EVENT = 'HALL_EVENT',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum OrderType {
  FOOD_DELIVERY = 'FOOD_DELIVERY',
  RESTAURANT_DINE_IN = 'RESTAURANT_DINE_IN',
  ROOM_SERVICE = 'ROOM_SERVICE',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum ReviewType {
  HOTEL_ROOM = 'HOTEL_ROOM',
  RESTAURANT = 'RESTAURANT',
  FOOD_ITEM = 'FOOD_ITEM',
  SERVICE = 'SERVICE',
  DELIVERY = 'DELIVERY',
}

export enum LoyaltyPointType {
  EARNED = 'EARNED',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
  BONUS = 'BONUS',
  REFERRAL = 'REFERRAL',
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  BOOKING_CREATED = 'BOOKING_CREATED',
  ORDER_PLACED = 'ORDER_PLACED',
  REVIEW_POSTED = 'REVIEW_POSTED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  PHONE_VERIFIED = 'PHONE_VERIFIED',
}

export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  ORDER_UPDATE = 'ORDER_UPDATE',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  PROMOTION = 'PROMOTION',
  REMINDER = 'REMINDER',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  LOYALTY_POINTS = 'LOYALTY_POINTS',
}

// Customer Interface
export interface ICustomer extends Document {
  _id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: Gender;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Profile Interface
export interface ICustomerProfile extends Document {
  _id: string;
  customerId: string;
  avatar?: string;
  bio?: string;
  preferences?: Record<string, any>;
  emergencyContact?: string;
  dietaryRestrictions?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Preferences Interface
export interface ICustomerPreferences extends Document {
  _id: string;
  customerId: string;
  language: string;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Address Interface
export interface ICustomerAddress extends Document {
  _id: string;
  customerId: string;
  type: AddressType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Booking Interface
export interface ICustomerBooking extends Document {
  _id: string;
  customerId: string;
  bookingType: BookingType;
  referenceId: string;
  status: BookingStatus;
  bookingDate: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  totalAmount: number;
  paidAmount: number;
  specialRequests?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Order Interface
export interface ICustomerOrder extends Document {
  _id: string;
  customerId: string;
  orderType: OrderType;
  referenceId: string;
  status: OrderStatus;
  orderDate: Date;
  deliveryDate?: Date;
  totalAmount: number;
  paidAmount: number;
  deliveryAddress?: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Review Interface
export interface ICustomerReview extends Document {
  _id: string;
  customerId: string;
  reviewType: ReviewType;
  referenceId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isPublic: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Loyalty Point Interface
export interface ICustomerLoyaltyPoint extends Document {
  _id: string;
  customerId: string;
  points: number;
  type: LoyaltyPointType;
  description: string;
  referenceId?: string;
  expiresAt?: Date;
  isRedeemed: boolean;
  redeemedAt?: Date;
  createdAt: Date;
}

// Customer Activity Interface
export interface ICustomerActivity extends Document {
  _id: string;
  customerId: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Customer Notification Interface
export interface ICustomerNotification extends Document {
  _id: string;
  customerId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Customer Schema
const CustomerSchema = new Schema<ICustomer>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'customers',
    _id: false,
  }
);

// Customer Profile Schema
const CustomerProfileSchema = new Schema<ICustomerProfile>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    customerId: {
      type: String,
      required: true,
      unique: true,
      ref: 'Customer',
      index: true,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
    },
    preferences: {
      type: Schema.Types.Mixed,
    },
    emergencyContact: {
      type: String,
    },
    dietaryRestrictions: {
      type: String,
    },
    specialRequests: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'customer_profiles',
    _id: false,
  }
);

// Customer Preferences Schema
const CustomerPreferencesSchema = new Schema<ICustomerPreferences>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    customerId: {
      type: String,
      required: true,
      unique: true,
      ref: 'Customer',
      index: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    marketingEmails: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'customer_preferences',
    _id: false,
  }
);

// Customer Address Schema
const CustomerAddressSchema = new Schema<ICustomerAddress>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    customerId: {
      type: String,
      required: true,
      ref: 'Customer',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(AddressType),
      default: AddressType.HOME,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'customer_addresses',
    _id: false,
  }
);

// Customer Booking Schema
const CustomerBookingSchema = new Schema<ICustomerBooking>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    customerId: {
      type: String,
      required: true,
      ref: 'Customer',
      index: true,
    },
    bookingType: {
      type: String,
      enum: Object.values(BookingType),
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    checkInDate: {
      type: Date,
    },
    checkOutDate: {
      type: Date,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    specialRequests: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'customer_bookings',
    _id: false,
  }
);

// Customer Order Schema
const CustomerOrderSchema = new Schema<ICustomerOrder>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    customerId: {
      type: String,
      required: true,
      ref: 'Customer',
      index: true,
    },
    orderType: {
      type: String,
      enum: Object.values(OrderType),
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    orderDate: {
      type: Date,
      required: true,
    },
    deliveryDate: {
      type: Date,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    deliveryAddress: {
      type: String,
    },
    specialInstructions: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'customer_orders',
    _id: false,
  }
);

// Customer Review Schema
const CustomerReviewSchema = new Schema<ICustomerReview>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    customerId: {
      type: String,
      required: true,
      ref: 'Customer',
      index: true,
    },
    reviewType: {
      type: String,
      enum: Object.values(ReviewType),
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
    },
    comment: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'customer_reviews',
    _id: false,
  }
);

// Customer Loyalty Point Schema
const CustomerLoyaltyPointSchema = new Schema<ICustomerLoyaltyPoint>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    customerId: {
      type: String,
      required: true,
      ref: 'Customer',
      index: true,
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(LoyaltyPointType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'customer_loyalty_points',
    _id: false,
  }
);

// Customer Activity Schema
const CustomerActivitySchema = new Schema<ICustomerActivity>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    customerId: {
      type: String,
      required: true,
      ref: 'Customer',
      index: true,
    },
    activityType: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'customer_activities',
    _id: false,
  }
);

// Customer Notification Schema
const CustomerNotificationSchema = new Schema<ICustomerNotification>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    customerId: {
      type: String,
      required: true,
      ref: 'Customer',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'customer_notifications',
    _id: false,
  }
);

// Create and export models
export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
export const CustomerProfile = mongoose.model<ICustomerProfile>('CustomerProfile', CustomerProfileSchema);
export const CustomerPreferences = mongoose.model<ICustomerPreferences>('CustomerPreferences', CustomerPreferencesSchema);
export const CustomerAddress = mongoose.model<ICustomerAddress>('CustomerAddress', CustomerAddressSchema);
export const CustomerBooking = mongoose.model<ICustomerBooking>('CustomerBooking', CustomerBookingSchema);
export const CustomerOrder = mongoose.model<ICustomerOrder>('CustomerOrder', CustomerOrderSchema);
export const CustomerReview = mongoose.model<ICustomerReview>('CustomerReview', CustomerReviewSchema);
export const CustomerLoyaltyPoint = mongoose.model<ICustomerLoyaltyPoint>('CustomerLoyaltyPoint', CustomerLoyaltyPointSchema);
export const CustomerActivity = mongoose.model<ICustomerActivity>('CustomerActivity', CustomerActivitySchema);
export const CustomerNotification = mongoose.model<ICustomerNotification>('CustomerNotification', CustomerNotificationSchema);

export default {
  Customer,
  CustomerProfile,
  CustomerPreferences,
  CustomerAddress,
  CustomerBooking,
  CustomerOrder,
  CustomerReview,
  CustomerLoyaltyPoint,
  CustomerActivity,
  CustomerNotification,
};

