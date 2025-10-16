import { Server } from 'http';
import { CustomerController } from '../controllers/CustomerController';
import { HealthController } from '../controllers/HealthController';
export declare class GraphQLServer {
    private apolloServer;
    private pubsub;
    private logger;
    constructor(_customerController: CustomerController, _healthController: HealthController, httpServer: Server);
    private buildContext;
    start(): Promise<void>;
    getMiddleware(): any;
    stop(): Promise<void>;
    getContextBuilder(): (connectionParams: any) => Promise<any>;
    publishEvent(eventType: string, data: any, customerId?: string): void;
    getServerInfo(): any;
}
export default GraphQLServer;
//# sourceMappingURL=GraphQLServer.d.ts.map