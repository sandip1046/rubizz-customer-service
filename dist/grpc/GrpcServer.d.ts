import { CustomerController } from '../controllers/CustomerController';
import { HealthController } from '../controllers/HealthController';
export interface GrpcServiceDefinition {
    [key: string]: any;
}
export declare class GrpcServer {
    private logger;
    private server;
    private customerController;
    private healthController;
    constructor(customerController: CustomerController, healthController: HealthController);
    initialize(): Promise<void>;
    private loadProtoDefinition;
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleCreateCustomer;
    private handleGetCustomer;
    private handleUpdateCustomer;
    private handleDeleteCustomer;
    private handleSearchCustomers;
    private handleGetCustomerByEmail;
    private handleGetCustomerStats;
    private handleUpdateCustomerProfile;
    private handleUpdateCustomerPreferences;
    private handleAddCustomerAddress;
    private handleGetCustomerAddresses;
    private handleUpdateCustomerAddress;
    private handleDeleteCustomerAddress;
    private handleVerifyCustomer;
    private handleUpdateLastLogin;
    private handleAddLoyaltyPoints;
    private handleRedeemLoyaltyPoints;
    private handleGetLoyaltyPoints;
    private handleSendNotification;
    private handleGetNotifications;
    private handleHealthCheck;
    private mapCustomerToProto;
    private mapCustomerProfileToProto;
    private mapCustomerPreferencesToProto;
    private mapCustomerAddressToProto;
    private mapCustomerLoyaltyPointToProto;
    private mapCustomerActivityToProto;
    private mapCustomerNotificationToProto;
}
export default GrpcServer;
//# sourceMappingURL=GrpcServer.d.ts.map