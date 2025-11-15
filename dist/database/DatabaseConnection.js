"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config/config");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class DatabaseConnection {
    constructor() {
        this.isConnected = false;
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        mongoose_1.default.connection.on('connected', () => {
            this.isConnected = true;
            this.logger.info('MongoDB connection established');
        });
        mongoose_1.default.connection.on('error', (error) => {
            this.isConnected = false;
            this.logger.error('MongoDB connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            this.isConnected = false;
            this.logger.warn('MongoDB disconnected');
        });
        this.logger.info('Database connection initialized');
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    getMongoose() {
        return mongoose_1.default;
    }
    async connect() {
        try {
            if (this.isConnected) {
                this.logger.info('Database already connected');
                return;
            }
            const connectionOptions = {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };
            await mongoose_1.default.connect(config_1.config.database.url, connectionOptions);
            this.isConnected = true;
            this.logger.info('Database connected successfully', {
                url: config_1.config.database.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
            });
        }
        catch (error) {
            this.isConnected = false;
            this.logger.error('Database connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            if (!this.isConnected) {
                this.logger.info('Database already disconnected');
                return;
            }
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            this.logger.info('Database disconnected successfully');
        }
        catch (error) {
            this.logger.error('Database disconnection failed:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                await mongoose_1.default.connection.db.admin().ping();
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }
    isConnectionActive() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
}
exports.default = DatabaseConnection;
//# sourceMappingURL=DatabaseConnection.js.map