import { WebSocket } from 'ws';
import { Server } from 'http';
import { CustomerBusinessService } from '../services/CustomerBusinessService';
export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: string;
    requestId?: string;
}
export interface WebSocketConnection {
    id: string;
    ws: WebSocket;
    customerId?: string;
    subscriptions: Set<string>;
    lastPing: number;
    isAlive: boolean;
}
export declare class WebSocketServer {
    private wss;
    private connections;
    private logger;
    private customerService;
    private pingInterval;
    constructor(httpServer: Server, customerService: CustomerBusinessService);
    private setupWebSocketServer;
    private handleMessage;
    private handleSubscribe;
    private handleUnsubscribe;
    private handleAuthenticate;
    private handlePing;
    private handleCustomerUpdate;
    private sendMessage;
    private sendError;
    publishEvent(eventType: string, data: any, customerId?: string): void;
    publishCustomerCreated(customer: any): void;
    publishCustomerUpdated(customer: any, customerId: string): void;
    publishCustomerVerified(customer: any, customerId: string): void;
    publishCustomerAddressAdded(customerId: string, address: any): void;
    publishCustomerNotificationSent(customerId: string, notification: any): void;
    publishCustomerActivityLogged(customerId: string, activity: any): void;
    private startPingInterval;
    getConnectionStats(): {
        totalConnections: number;
        connections: {
            id: string;
            customerId: string | undefined;
            subscriptions: string[];
            isAlive: boolean;
            lastPing: number;
        }[];
    };
    closeAllConnections(): void;
    stop(): void;
    private generateConnectionId;
}
export default WebSocketServer;
//# sourceMappingURL=WebSocketServer.d.ts.map