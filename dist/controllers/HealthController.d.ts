import { Request, Response } from 'express';
export declare class HealthController {
    private dbConnection;
    private redisService;
    private logger;
    constructor();
    healthCheck: (_req: Request, res: Response) => Promise<void>;
    detailedHealthCheck: (_req: Request, res: Response) => Promise<void>;
    readinessCheck: (_req: Request, res: Response) => Promise<void>;
    livenessCheck: (_req: Request, res: Response) => Promise<void>;
    metrics: (_req: Request, res: Response) => Promise<void>;
    getHealthStatus(): Promise<{
        status: string;
        message: string;
        timestamp: string;
        uptime: number;
        database: boolean;
        redis: {
            session: boolean;
            cache: boolean;
            queue: boolean;
        };
        services: {
            database: string;
            redis: string;
        };
    }>;
    healthCheckGrpc(_call: any, callback: any): Promise<void>;
}
export default HealthController;
//# sourceMappingURL=HealthController.d.ts.map