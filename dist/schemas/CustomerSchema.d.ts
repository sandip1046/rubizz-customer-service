import mongoose, { Document } from 'mongoose';
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}
export declare enum AddressType {
    HOME = "HOME",
    WORK = "WORK",
    BILLING = "BILLING",
    SHIPPING = "SHIPPING",
    OTHER = "OTHER"
}
export declare enum BookingType {
    HOTEL_ROOM = "HOTEL_ROOM",
    RESTAURANT_TABLE = "RESTAURANT_TABLE",
    HALL_EVENT = "HALL_EVENT"
}
export declare enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CHECKED_IN = "CHECKED_IN",
    CHECKED_OUT = "CHECKED_OUT",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare enum OrderType {
    FOOD_DELIVERY = "FOOD_DELIVERY",
    RESTAURANT_DINE_IN = "RESTAURANT_DINE_IN",
    ROOM_SERVICE = "ROOM_SERVICE"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    READY = "READY",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum ReviewType {
    HOTEL_ROOM = "HOTEL_ROOM",
    RESTAURANT = "RESTAURANT",
    FOOD_ITEM = "FOOD_ITEM",
    SERVICE = "SERVICE",
    DELIVERY = "DELIVERY"
}
export declare enum LoyaltyPointType {
    EARNED = "EARNED",
    REDEEMED = "REDEEMED",
    EXPIRED = "EXPIRED",
    BONUS = "BONUS",
    REFERRAL = "REFERRAL"
}
export declare enum ActivityType {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    PROFILE_UPDATE = "PROFILE_UPDATE",
    BOOKING_CREATED = "BOOKING_CREATED",
    ORDER_PLACED = "ORDER_PLACED",
    REVIEW_POSTED = "REVIEW_POSTED",
    PASSWORD_CHANGED = "PASSWORD_CHANGED",
    EMAIL_VERIFIED = "EMAIL_VERIFIED",
    PHONE_VERIFIED = "PHONE_VERIFIED"
}
export declare enum NotificationType {
    BOOKING_CONFIRMATION = "BOOKING_CONFIRMATION",
    ORDER_UPDATE = "ORDER_UPDATE",
    PAYMENT_RECEIPT = "PAYMENT_RECEIPT",
    PROMOTION = "PROMOTION",
    REMINDER = "REMINDER",
    SYSTEM_ALERT = "SYSTEM_ALERT",
    REVIEW_REQUEST = "REVIEW_REQUEST",
    LOYALTY_POINTS = "LOYALTY_POINTS"
}
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
export declare const Customer: mongoose.Model<ICustomer, {}, {}, {}, mongoose.Document<unknown, {}, ICustomer, {}, {}> & ICustomer & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const CustomerProfile: mongoose.Model<ICustomerProfile, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerProfile, {}, {}> & ICustomerProfile & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const CustomerPreferences: mongoose.Model<ICustomerPreferences, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerPreferences, {}, {}> & ICustomerPreferences & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const CustomerAddress: mongoose.Model<ICustomerAddress, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerAddress, {}, {}> & ICustomerAddress & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const CustomerBooking: mongoose.Model<ICustomerBooking, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerBooking, {}, {}> & ICustomerBooking & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const CustomerOrder: mongoose.Model<ICustomerOrder, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerOrder, {}, {}> & ICustomerOrder & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const CustomerReview: mongoose.Model<ICustomerReview, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerReview, {}, {}> & ICustomerReview & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const CustomerLoyaltyPoint: mongoose.Model<ICustomerLoyaltyPoint, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerLoyaltyPoint, {}, {}> & ICustomerLoyaltyPoint & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const CustomerActivity: mongoose.Model<ICustomerActivity, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerActivity, {}, {}> & ICustomerActivity & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const CustomerNotification: mongoose.Model<ICustomerNotification, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerNotification, {}, {}> & ICustomerNotification & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
declare const _default: {
    Customer: mongoose.Model<ICustomer, {}, {}, {}, mongoose.Document<unknown, {}, ICustomer, {}, {}> & ICustomer & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
    CustomerProfile: mongoose.Model<ICustomerProfile, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerProfile, {}, {}> & ICustomerProfile & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
    CustomerPreferences: mongoose.Model<ICustomerPreferences, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerPreferences, {}, {}> & ICustomerPreferences & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
    CustomerAddress: mongoose.Model<ICustomerAddress, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerAddress, {}, {}> & ICustomerAddress & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
    CustomerBooking: mongoose.Model<ICustomerBooking, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerBooking, {}, {}> & ICustomerBooking & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
    CustomerOrder: mongoose.Model<ICustomerOrder, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerOrder, {}, {}> & ICustomerOrder & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
    CustomerReview: mongoose.Model<ICustomerReview, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerReview, {}, {}> & ICustomerReview & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
    CustomerLoyaltyPoint: mongoose.Model<ICustomerLoyaltyPoint, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerLoyaltyPoint, {}, {}> & ICustomerLoyaltyPoint & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
    CustomerActivity: mongoose.Model<ICustomerActivity, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerActivity, {}, {}> & ICustomerActivity & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
    CustomerNotification: mongoose.Model<ICustomerNotification, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerNotification, {}, {}> & ICustomerNotification & Required<{
        _id: string;
    }> & {
        __v: number;
    }, any>;
};
export default _default;
//# sourceMappingURL=CustomerSchema.d.ts.map