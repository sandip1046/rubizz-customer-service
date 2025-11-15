"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = void 0;
const ws_1 = require("ws");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
const config_1 = require("../config/config");
class WebSocketServer {
    constructor(httpServer, customerService) {
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        this.connections = new Map();
        this.customerService = customerService;
        this.wss = new ws_1.WebSocketServer({
            server: httpServer,
            path: config_1.config.websocket?.path || '/ws',
        });
        this.setupWebSocketServer();
        this.startPingInterval();
    }
    setupWebSocketServer() {
        this.wss.on('connection', (ws, req) => {
            const connectionId = this.generateConnectionId();
            const connection = {
                id: connectionId,
                ws,
                subscriptions: new Set(),
                lastPing: Date.now(),
                isAlive: true,
            };
            this.connections.set(connectionId, connection);
            this.logger.info('WebSocket client connected', {
                connectionId,
                ip: req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(connection, message);
                }
                catch (error) {
                    this.logger.error('Failed to parse WebSocket message', error);
                    this.sendError(connection, 'Invalid message format');
                }
            });
            ws.on('close', (code, reason) => {
                this.logger.info('WebSocket client disconnected', {
                    connectionId,
                    code,
                    reason: reason.toString(),
                });
                this.connections.delete(connectionId);
            });
            ws.on('error', (error) => {
                this.logger.error('WebSocket connection error', error);
                this.connections.delete(connectionId);
            });
            ws.on('pong', () => {
                connection.isAlive = true;
                connection.lastPing = Date.now();
            });
            this.sendMessage(connection, {
                type: 'connection_established',
                data: { connectionId, timestamp: new Date().toISOString() },
                timestamp: new Date().toISOString(),
            });
        });
    }
    handleMessage(connection, message) {
        try {
            switch (message.type) {
                case 'subscribe':
                    this.handleSubscribe(connection, message);
                    break;
                case 'unsubscribe':
                    this.handleUnsubscribe(connection, message);
                    break;
                case 'authenticate':
                    this.handleAuthenticate(connection, message);
                    break;
                case 'ping':
                    this.handlePing(connection);
                    break;
                case 'customer_update':
                    this.handleCustomerUpdate(connection, message);
                    break;
                default:
                    this.logger.warn('Unknown WebSocket message type', { type: message.type });
                    this.sendError(connection, `Unknown message type: ${message.type}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to handle WebSocket message', error);
            this.sendError(connection, 'Failed to process message');
        }
    }
    handleSubscribe(connection, message) {
        const { topic, customerId } = message.data;
        if (!topic) {
            this.sendError(connection, 'Topic is required for subscription');
            return;
        }
        if (customerId && connection.customerId !== customerId) {
            this.sendError(connection, 'Unauthorized access to customer data');
            return;
        }
        const subscriptionKey = customerId ? `${topic}_${customerId}` : topic;
        connection.subscriptions.add(subscriptionKey);
        this.logger.info('WebSocket subscription added', {
            connectionId: connection.id,
            topic,
            customerId,
            subscriptionKey,
        });
        this.sendMessage(connection, {
            type: 'subscription_confirmed',
            data: { topic, customerId, subscriptionKey },
            timestamp: new Date().toISOString(),
        });
    }
    handleUnsubscribe(connection, message) {
        const { topic, customerId } = message.data;
        const subscriptionKey = customerId ? `${topic}_${customerId}` : topic;
        connection.subscriptions.delete(subscriptionKey);
        this.logger.info('WebSocket subscription removed', {
            connectionId: connection.id,
            topic,
            customerId,
            subscriptionKey,
        });
        this.sendMessage(connection, {
            type: 'unsubscription_confirmed',
            data: { topic, customerId, subscriptionKey },
            timestamp: new Date().toISOString(),
        });
    }
    handleAuthenticate(connection, message) {
        const { customerId } = message.data;
        if (customerId) {
            connection.customerId = customerId;
            this.logger.info('WebSocket client authenticated', {
                connectionId: connection.id,
                customerId,
            });
            this.sendMessage(connection, {
                type: 'authentication_success',
                data: { customerId },
                timestamp: new Date().toISOString(),
            });
        }
        else {
            this.sendError(connection, 'Customer ID is required for authentication');
        }
    }
    handlePing(connection) {
        this.sendMessage(connection, {
            type: 'pong',
            data: { timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString(),
        });
    }
    handleCustomerUpdate(connection, message) {
        const { customerId, updateData } = message.data;
        if (!customerId || !updateData) {
            this.sendError(connection, 'Customer ID and update data are required');
            return;
        }
        if (connection.customerId !== customerId) {
            this.sendError(connection, 'Unauthorized access to customer data');
            return;
        }
        this.customerService.updateCustomer(customerId, updateData, message.requestId)
            .then((customer) => {
            this.sendMessage(connection, {
                type: 'customer_updated',
                data: { customer },
                timestamp: new Date().toISOString(),
            });
        })
            .catch((error) => {
            this.logger.error('Failed to update customer via WebSocket', error);
            this.sendError(connection, 'Failed to update customer');
        });
    }
    sendMessage(connection, message) {
        if (connection.ws.readyState === ws_1.WebSocket.OPEN) {
            connection.ws.send(JSON.stringify(message));
        }
    }
    sendError(connection, error) {
        this.sendMessage(connection, {
            type: 'error',
            data: { error },
            timestamp: new Date().toISOString(),
        });
    }
    publishEvent(eventType, data, customerId) {
        const topic = customerId ? `${eventType}_${customerId}` : eventType;
        this.connections.forEach((connection) => {
            if (connection.subscriptions.has(topic)) {
                this.sendMessage(connection, {
                    type: eventType,
                    data,
                    timestamp: new Date().toISOString(),
                });
            }
        });
        this.logger.debug(`Published WebSocket event: ${eventType}`, {
            customerId,
            connections: this.connections.size,
        });
    }
    publishCustomerCreated(customer) {
        this.publishEvent('customer_created', { customer });
    }
    publishCustomerUpdated(customer, customerId) {
        this.publishEvent('customer_updated', { customer }, customerId);
    }
    publishCustomerVerified(customer, customerId) {
        this.publishEvent('customer_verified', { customer }, customerId);
    }
    publishCustomerAddressAdded(customerId, address) {
        this.publishEvent('customer_address_added', { address }, customerId);
    }
    publishCustomerNotificationSent(customerId, notification) {
        this.publishEvent('customer_notification_sent', { notification }, customerId);
    }
    publishCustomerActivityLogged(customerId, activity) {
        this.publishEvent('customer_activity_logged', { activity }, customerId);
    }
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            this.connections.forEach((connection) => {
                if (!connection.isAlive) {
                    this.logger.info('Terminating inactive WebSocket connection', {
                        connectionId: connection.id,
                    });
                    connection.ws.terminate();
                    this.connections.delete(connection.id);
                    return;
                }
                connection.isAlive = false;
                connection.ws.ping();
            });
        }, config_1.config.websocket?.pingInterval || 30000);
    }
    getConnectionStats() {
        return {
            totalConnections: this.connections.size,
            connections: Array.from(this.connections.values()).map(conn => ({
                id: conn.id,
                customerId: conn.customerId,
                subscriptions: Array.from(conn.subscriptions),
                isAlive: conn.isAlive,
                lastPing: conn.lastPing,
            })),
        };
    }
    closeAllConnections() {
        this.connections.forEach((connection) => {
            connection.ws.close(1000, 'Server shutting down');
        });
        this.connections.clear();
    }
    stop() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        this.closeAllConnections();
        this.wss.close();
        this.logger.info('WebSocket server stopped');
    }
    generateConnectionId() {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.WebSocketServer = WebSocketServer;
exports.default = WebSocketServer;
//# sourceMappingURL=WebSocketServer.js.map