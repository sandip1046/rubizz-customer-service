import mongoose from 'mongoose';
declare class DatabaseConnection {
    private static instance;
    private logger;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseConnection;
    getMongoose(): typeof mongoose;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
    isConnectionActive(): boolean;
}
export default DatabaseConnection;
//# sourceMappingURL=DatabaseConnection.d.ts.map