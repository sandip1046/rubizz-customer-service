"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const config_1 = require("../config/config");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class DatabaseConnection {
    constructor() {
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        this.prisma = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: config_1.config.database.url,
                },
            },
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
        });
        this.logger.info('Database connection initialized');
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    getPrismaClient() {
        return this.prisma;
    }
    async connect() {
        try {
            await this.prisma.$connect();
            this.logger.info('Database connected successfully');
        }
        catch (error) {
            this.logger.error('Database connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            this.logger.info('Database disconnected successfully');
        }
        catch (error) {
            this.logger.error('Database disconnection failed:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            await this.prisma.customer.findFirst();
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }
}
exports.default = DatabaseConnection;
//# sourceMappingURL=DatabaseConnection.js.map