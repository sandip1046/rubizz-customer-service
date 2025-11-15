import { WebSocketServer as WSWebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { Logger } from '@sandip1046/rubizz-shared-libs';
import { config } from '../config/config';
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

export class WebSocketServer {
  private wss: WSWebSocketServer;
  private connections: Map<string, WebSocketConnection>;
  private logger: Logger;
  private customerService: CustomerBusinessService;
  private pingInterval: NodeJS.Timeout | undefined;

  constructor(httpServer: Server, customerService: CustomerBusinessService) {
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
    this.connections = new Map();
    this.customerService = customerService;

    // Create WebSocket server
    this.wss = new WSWebSocketServer({
      server: httpServer,
      path: config.websocket?.path || '/ws',
    });

    this.setupWebSocketServer();
    this.startPingInterval();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const connectionId = this.generateConnectionId();
      const connection: WebSocketConnection = {
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

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(connection, message);
        } catch (error) {
          this.logger.error('Failed to parse WebSocket message', error as Error);
          this.sendError(connection, 'Invalid message format');
        }
      });

      // Handle connection close
      ws.on('close', (code: number, reason: Buffer) => {
        this.logger.info('WebSocket client disconnected', {
          connectionId,
          code,
          reason: reason.toString(),
        });
        this.connections.delete(connectionId);
      });

      // Handle connection errors
      ws.on('error', (error: Error) => {
        this.logger.error('WebSocket connection error', error);
        this.connections.delete(connectionId);
      });

      // Handle pong responses
      ws.on('pong', () => {
        connection.isAlive = true;
        connection.lastPing = Date.now();
      });

      // Send welcome message
      this.sendMessage(connection, {
        type: 'connection_established',
        data: { connectionId, timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      });
    });
  }

  private handleMessage(connection: WebSocketConnection, message: WebSocketMessage) {
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
    } catch (error) {
      this.logger.error('Failed to handle WebSocket message', error as Error);
      this.sendError(connection, 'Failed to process message');
    }
  }

  private handleSubscribe(connection: WebSocketConnection, message: WebSocketMessage) {
    const { topic, customerId } = message.data;
    
    if (!topic) {
      this.sendError(connection, 'Topic is required for subscription');
      return;
    }

    // Validate customer access if customerId is provided
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

  private handleUnsubscribe(connection: WebSocketConnection, message: WebSocketMessage) {
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

  private handleAuthenticate(connection: WebSocketConnection, message: WebSocketMessage) {
    const { customerId } = message.data;
    
    // In a real implementation, you would validate the JWT token here
    // For now, we'll just set the customerId if provided
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
    } else {
      this.sendError(connection, 'Customer ID is required for authentication');
    }
  }

  private handlePing(connection: WebSocketConnection) {
    this.sendMessage(connection, {
      type: 'pong',
      data: { timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });
  }

  private handleCustomerUpdate(connection: WebSocketConnection, message: WebSocketMessage) {
    const { customerId, updateData } = message.data;
    
    if (!customerId || !updateData) {
      this.sendError(connection, 'Customer ID and update data are required');
      return;
    }

    // Validate customer access
    if (connection.customerId !== customerId) {
      this.sendError(connection, 'Unauthorized access to customer data');
      return;
    }

    // Process customer update
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

  private sendMessage(connection: WebSocketConnection, message: WebSocketMessage) {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
    }
  }

  private sendError(connection: WebSocketConnection, error: string) {
    this.sendMessage(connection, {
      type: 'error',
      data: { error },
      timestamp: new Date().toISOString(),
    });
  }

  // Publish events to subscribed connections
  public publishEvent(eventType: string, data: any, customerId?: string) {
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

  // Publish customer events
  public publishCustomerCreated(customer: any) {
    this.publishEvent('customer_created', { customer });
  }

  public publishCustomerUpdated(customer: any, customerId: string) {
    this.publishEvent('customer_updated', { customer }, customerId);
  }

  public publishCustomerVerified(customer: any, customerId: string) {
    this.publishEvent('customer_verified', { customer }, customerId);
  }

  public publishCustomerAddressAdded(customerId: string, address: any) {
    this.publishEvent('customer_address_added', { address }, customerId);
  }

  public publishCustomerNotificationSent(customerId: string, notification: any) {
    this.publishEvent('customer_notification_sent', { notification }, customerId);
  }

  public publishCustomerActivityLogged(customerId: string, activity: any) {
    this.publishEvent('customer_activity_logged', { activity }, customerId);
  }

  // Start ping interval to keep connections alive
  private startPingInterval() {
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
    }, config.websocket?.pingInterval || 30000);
  }

  // Get connection statistics
  public getConnectionStats() {
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

  // Close all connections
  public closeAllConnections() {
    this.connections.forEach((connection) => {
      connection.ws.close(1000, 'Server shutting down');
    });
    this.connections.clear();
  }

  // Stop the WebSocket server
  public stop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.closeAllConnections();
    this.wss.close();
    this.logger.info('WebSocket server stopped');
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default WebSocketServer;
