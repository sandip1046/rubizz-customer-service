declare class CustomerServiceApp {
    private app;
    private httpServer;
    private dbConnection;
    private redisService;
    private grpcServer;
    private graphqlServer;
    private kafkaService;
    private customerController;
    private healthController;
    private logger;
    constructor();
    private initializeMiddlewares;
    private initializeServices;
    private initializeRoutes;
    private createApiRoutes;
    private initializeErrorHandling;
    start(): Promise<void>;
    private setupGracefulShutdown;
}
export default CustomerServiceApp;
//# sourceMappingURL=index.d.ts.map