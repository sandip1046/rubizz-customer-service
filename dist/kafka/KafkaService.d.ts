export interface KafkaEvent {
    eventType: string;
    serviceName: string;
    data: any;
    metadata: {
        timestamp: string;
        requestId?: string;
        customerId?: string;
        [key: string]: any;
    };
}
export declare class KafkaService {
    private kafka;
    private producer;
    private consumer;
    private logger;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    private subscribeToTopics;
    private startConsuming;
    private handleMessage;
    private handleEventMessage;
    private handleNotificationMessage;
    private handleAnalyticsMessage;
    private handleUserRegisteredEvent;
    private handleUserLoginEvent;
    private handleBookingCreatedEvent;
    private handleOrderPlacedEvent;
    publishEvent(event: KafkaEvent): Promise<void>;
    private getTopicForEventType;
    publishCustomerCreatedEvent(customer: any, requestId?: string): Promise<void>;
    publishCustomerUpdatedEvent(customer: any, requestId?: string): Promise<void>;
    publishCustomerVerifiedEvent(customer: any, requestId?: string): Promise<void>;
    publishCustomerAddressAddedEvent(customerId: string, address: any, requestId?: string): Promise<void>;
    publishCustomerNotificationSentEvent(customerId: string, notification: any, requestId?: string): Promise<void>;
    getConsumerLag(): Promise<any>;
    disconnect(): Promise<void>;
    isServiceInitialized(): boolean;
}
export default KafkaService;
//# sourceMappingURL=KafkaService.d.ts.map