"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerNotification = exports.CustomerActivity = exports.CustomerLoyaltyPoint = exports.CustomerReview = exports.CustomerOrder = exports.CustomerBooking = exports.CustomerAddress = exports.CustomerPreferences = exports.CustomerProfile = exports.Customer = exports.NotificationType = exports.ActivityType = exports.LoyaltyPointType = exports.ReviewType = exports.OrderStatus = exports.OrderType = exports.BookingStatus = exports.BookingType = exports.AddressType = exports.Gender = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
    Gender["PREFER_NOT_TO_SAY"] = "PREFER_NOT_TO_SAY";
})(Gender || (exports.Gender = Gender = {}));
var AddressType;
(function (AddressType) {
    AddressType["HOME"] = "HOME";
    AddressType["WORK"] = "WORK";
    AddressType["BILLING"] = "BILLING";
    AddressType["SHIPPING"] = "SHIPPING";
    AddressType["OTHER"] = "OTHER";
})(AddressType || (exports.AddressType = AddressType = {}));
var BookingType;
(function (BookingType) {
    BookingType["HOTEL_ROOM"] = "HOTEL_ROOM";
    BookingType["RESTAURANT_TABLE"] = "RESTAURANT_TABLE";
    BookingType["HALL_EVENT"] = "HALL_EVENT";
})(BookingType || (exports.BookingType = BookingType = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["CHECKED_IN"] = "CHECKED_IN";
    BookingStatus["CHECKED_OUT"] = "CHECKED_OUT";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["NO_SHOW"] = "NO_SHOW";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["FOOD_DELIVERY"] = "FOOD_DELIVERY";
    OrderType["RESTAURANT_DINE_IN"] = "RESTAURANT_DINE_IN";
    OrderType["ROOM_SERVICE"] = "ROOM_SERVICE";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var ReviewType;
(function (ReviewType) {
    ReviewType["HOTEL_ROOM"] = "HOTEL_ROOM";
    ReviewType["RESTAURANT"] = "RESTAURANT";
    ReviewType["FOOD_ITEM"] = "FOOD_ITEM";
    ReviewType["SERVICE"] = "SERVICE";
    ReviewType["DELIVERY"] = "DELIVERY";
})(ReviewType || (exports.ReviewType = ReviewType = {}));
var LoyaltyPointType;
(function (LoyaltyPointType) {
    LoyaltyPointType["EARNED"] = "EARNED";
    LoyaltyPointType["REDEEMED"] = "REDEEMED";
    LoyaltyPointType["EXPIRED"] = "EXPIRED";
    LoyaltyPointType["BONUS"] = "BONUS";
    LoyaltyPointType["REFERRAL"] = "REFERRAL";
})(LoyaltyPointType || (exports.LoyaltyPointType = LoyaltyPointType = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType["LOGIN"] = "LOGIN";
    ActivityType["LOGOUT"] = "LOGOUT";
    ActivityType["PROFILE_UPDATE"] = "PROFILE_UPDATE";
    ActivityType["BOOKING_CREATED"] = "BOOKING_CREATED";
    ActivityType["ORDER_PLACED"] = "ORDER_PLACED";
    ActivityType["REVIEW_POSTED"] = "REVIEW_POSTED";
    ActivityType["PASSWORD_CHANGED"] = "PASSWORD_CHANGED";
    ActivityType["EMAIL_VERIFIED"] = "EMAIL_VERIFIED";
    ActivityType["PHONE_VERIFIED"] = "PHONE_VERIFIED";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["BOOKING_CONFIRMATION"] = "BOOKING_CONFIRMATION";
    NotificationType["ORDER_UPDATE"] = "ORDER_UPDATE";
    NotificationType["PAYMENT_RECEIPT"] = "PAYMENT_RECEIPT";
    NotificationType["PROMOTION"] = "PROMOTION";
    NotificationType["REMINDER"] = "REMINDER";
    NotificationType["SYSTEM_ALERT"] = "SYSTEM_ALERT";
    NotificationType["REVIEW_REQUEST"] = "REVIEW_REQUEST";
    NotificationType["LOYALTY_POINTS"] = "LOYALTY_POINTS";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
const CustomerSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
}, {
    timestamps: true,
    collection: 'customers',
    _id: false,
});
const CustomerProfileSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
        type: mongoose_1.Schema.Types.Mixed,
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
}, {
    timestamps: true,
    collection: 'customer_profiles',
    _id: false,
});
const CustomerPreferencesSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
}, {
    timestamps: true,
    collection: 'customer_preferences',
    _id: false,
});
const CustomerAddressSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
}, {
    timestamps: true,
    collection: 'customer_addresses',
    _id: false,
});
const CustomerBookingSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
}, {
    timestamps: true,
    collection: 'customer_bookings',
    _id: false,
});
const CustomerOrderSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
}, {
    timestamps: true,
    collection: 'customer_orders',
    _id: false,
});
const CustomerReviewSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
}, {
    timestamps: true,
    collection: 'customer_reviews',
    _id: false,
});
const CustomerLoyaltyPointSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'customer_loyalty_points',
    _id: false,
});
const CustomerActivitySchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
        type: mongoose_1.Schema.Types.Mixed,
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'customer_activities',
    _id: false,
});
const CustomerNotificationSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'customer_notifications',
    _id: false,
});
exports.Customer = mongoose_1.default.model('Customer', CustomerSchema);
exports.CustomerProfile = mongoose_1.default.model('CustomerProfile', CustomerProfileSchema);
exports.CustomerPreferences = mongoose_1.default.model('CustomerPreferences', CustomerPreferencesSchema);
exports.CustomerAddress = mongoose_1.default.model('CustomerAddress', CustomerAddressSchema);
exports.CustomerBooking = mongoose_1.default.model('CustomerBooking', CustomerBookingSchema);
exports.CustomerOrder = mongoose_1.default.model('CustomerOrder', CustomerOrderSchema);
exports.CustomerReview = mongoose_1.default.model('CustomerReview', CustomerReviewSchema);
exports.CustomerLoyaltyPoint = mongoose_1.default.model('CustomerLoyaltyPoint', CustomerLoyaltyPointSchema);
exports.CustomerActivity = mongoose_1.default.model('CustomerActivity', CustomerActivitySchema);
exports.CustomerNotification = mongoose_1.default.model('CustomerNotification', CustomerNotificationSchema);
exports.default = {
    Customer: exports.Customer,
    CustomerProfile: exports.CustomerProfile,
    CustomerPreferences: exports.CustomerPreferences,
    CustomerAddress: exports.CustomerAddress,
    CustomerBooking: exports.CustomerBooking,
    CustomerOrder: exports.CustomerOrder,
    CustomerReview: exports.CustomerReview,
    CustomerLoyaltyPoint: exports.CustomerLoyaltyPoint,
    CustomerActivity: exports.CustomerActivity,
    CustomerNotification: exports.CustomerNotification,
};
//# sourceMappingURL=CustomerSchema.js.map