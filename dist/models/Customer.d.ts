import { PrismaClient } from '@prisma/client';
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
export declare class CustomerModel {
    private prisma;
    private logger;
    constructor(prisma: PrismaClient);
    createCustomer(data: CreateCustomerData): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
            customerId: string;
            avatar: string | null;
            bio: string | null;
            emergencyContact: string | null;
            dietaryRestrictions: string | null;
            specialRequests: string | null;
        } | null;
        preferences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            language: string;
            currency: string;
            timezone: string;
            emailNotifications: boolean;
            smsNotifications: boolean;
            pushNotifications: boolean;
            marketingEmails: boolean;
        } | null;
        addresses: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            type: import(".prisma/client").$Enums.AddressType;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
        }[];
    } & {
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        isVerified: boolean;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCustomerById(id: string): Promise<({
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
            customerId: string;
            avatar: string | null;
            bio: string | null;
            emergencyContact: string | null;
            dietaryRestrictions: string | null;
            specialRequests: string | null;
        } | null;
        preferences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            language: string;
            currency: string;
            timezone: string;
            emailNotifications: boolean;
            smsNotifications: boolean;
            pushNotifications: boolean;
            marketingEmails: boolean;
        } | null;
        addresses: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            type: import(".prisma/client").$Enums.AddressType;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
        }[];
        loyaltyPoints: {
            id: string;
            createdAt: Date;
            customerId: string;
            points: number;
            type: import(".prisma/client").$Enums.LoyaltyPointType;
            description: string;
            referenceId: string | null;
            expiresAt: Date | null;
            isRedeemed: boolean;
            redeemedAt: Date | null;
        }[];
        activities: {
            id: string;
            createdAt: Date;
            customerId: string;
            description: string;
            activityType: import(".prisma/client").$Enums.ActivityType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        }[];
    } & {
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        isVerified: boolean;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    getCustomerByEmail(email: string): Promise<({
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
            customerId: string;
            avatar: string | null;
            bio: string | null;
            emergencyContact: string | null;
            dietaryRestrictions: string | null;
            specialRequests: string | null;
        } | null;
        preferences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            language: string;
            currency: string;
            timezone: string;
            emailNotifications: boolean;
            smsNotifications: boolean;
            pushNotifications: boolean;
            marketingEmails: boolean;
        } | null;
        addresses: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            type: import(".prisma/client").$Enums.AddressType;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
        }[];
    } & {
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        isVerified: boolean;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    getCustomerByPhone(phone: string): Promise<({
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
            customerId: string;
            avatar: string | null;
            bio: string | null;
            emergencyContact: string | null;
            dietaryRestrictions: string | null;
            specialRequests: string | null;
        } | null;
        preferences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            language: string;
            currency: string;
            timezone: string;
            emailNotifications: boolean;
            smsNotifications: boolean;
            pushNotifications: boolean;
            marketingEmails: boolean;
        } | null;
        addresses: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            type: import(".prisma/client").$Enums.AddressType;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
        }[];
    } & {
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        isVerified: boolean;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateCustomer(id: string, data: UpdateCustomerData): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
            customerId: string;
            avatar: string | null;
            bio: string | null;
            emergencyContact: string | null;
            dietaryRestrictions: string | null;
            specialRequests: string | null;
        } | null;
        preferences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            language: string;
            currency: string;
            timezone: string;
            emailNotifications: boolean;
            smsNotifications: boolean;
            pushNotifications: boolean;
            marketingEmails: boolean;
        } | null;
        addresses: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            type: import(".prisma/client").$Enums.AddressType;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
        }[];
    } & {
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        isVerified: boolean;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCustomer(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        isVerified: boolean;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    searchCustomers(filters: CustomerSearchFilters, pagination?: CustomerPaginationOptions): Promise<{
        customers: ({
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                preferences: import("@prisma/client/runtime/library").JsonValue | null;
                customerId: string;
                avatar: string | null;
                bio: string | null;
                emergencyContact: string | null;
                dietaryRestrictions: string | null;
                specialRequests: string | null;
            } | null;
            preferences: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                language: string;
                currency: string;
                timezone: string;
                emailNotifications: boolean;
                smsNotifications: boolean;
                pushNotifications: boolean;
                marketingEmails: boolean;
            } | null;
            addresses: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                type: import(".prisma/client").$Enums.AddressType;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                state: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
            }[];
        } & {
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
            dateOfBirth: Date | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            isVerified: boolean;
            isActive: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    updateCustomerProfile(customerId: string, data: CustomerProfileData): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        preferences: import("@prisma/client/runtime/library").JsonValue | null;
        customerId: string;
        avatar: string | null;
        bio: string | null;
        emergencyContact: string | null;
        dietaryRestrictions: string | null;
        specialRequests: string | null;
    }>;
    updateCustomerPreferences(customerId: string, data: CustomerPreferencesData): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        language: string;
        currency: string;
        timezone: string;
        emailNotifications: boolean;
        smsNotifications: boolean;
        pushNotifications: boolean;
        marketingEmails: boolean;
    }>;
    addCustomerAddress(customerId: string, data: CustomerAddressData): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        type: import(".prisma/client").$Enums.AddressType;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        isDefault: boolean;
    }>;
    updateCustomerAddress(addressId: string, data: Partial<CustomerAddressData>): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        type: import(".prisma/client").$Enums.AddressType;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        isDefault: boolean;
    }>;
    deleteCustomerAddress(addressId: string): Promise<void>;
    getCustomerAddresses(customerId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        type: import(".prisma/client").$Enums.AddressType;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        isDefault: boolean;
    }[]>;
    updateLastLogin(id: string, ipAddress?: string, userAgent?: string): Promise<void>;
    verifyCustomer(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        isVerified: boolean;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCustomerStats(): Promise<{
        totalCustomers: number;
        verifiedCustomers: number;
        activeCustomers: number;
        newCustomersThisMonth: number;
        newCustomersThisWeek: number;
        newCustomersToday: number;
        verificationRate: number;
    }>;
    addLoyaltyPoints(customerId: string, points: number, type: string, description: string, referenceId?: string): Promise<{
        id: string;
        createdAt: Date;
        customerId: string;
        points: number;
        type: import(".prisma/client").$Enums.LoyaltyPointType;
        description: string;
        referenceId: string | null;
        expiresAt: Date | null;
        isRedeemed: boolean;
        redeemedAt: Date | null;
    }>;
    redeemLoyaltyPoints(customerId: string, points: number, description: string, referenceId?: string): Promise<{
        id: string;
        createdAt: Date;
        customerId: string;
        points: number;
        type: import(".prisma/client").$Enums.LoyaltyPointType;
        description: string;
        referenceId: string | null;
        expiresAt: Date | null;
        isRedeemed: boolean;
        redeemedAt: Date | null;
    }>;
    logCustomerActivity(customerId: string, activityType: string, description: string, metadata?: any, ipAddress?: string, userAgent?: string): Promise<{
        id: string;
        createdAt: Date;
        customerId: string;
        description: string;
        activityType: import(".prisma/client").$Enums.ActivityType;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    sendCustomerNotification(customerId: string, type: string, title: string, message: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        customerId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
}
export default CustomerModel;
//# sourceMappingURL=Customer.d.ts.map