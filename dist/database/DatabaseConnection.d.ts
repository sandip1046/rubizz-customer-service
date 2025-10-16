import { PrismaClient } from '@prisma/client';
declare class DatabaseConnection {
    private static instance;
    private prisma;
    private logger;
    private constructor();
    static getInstance(): DatabaseConnection;
    getPrismaClient(): PrismaClient;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
}
export default DatabaseConnection;
//# sourceMappingURL=DatabaseConnection.d.ts.map