import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { typeDefs } from './schema';
import resolvers from './resolvers';
import { CustomerController } from '../controllers/CustomerController';
import { HealthController } from '../controllers/HealthController';
import { Logger } from '@sandip1046/rubizz-shared-libs';
import { config } from '../config/config';

export class GraphQLServer {
  private apolloServer: ApolloServer;
  // private resolvers: GraphQLResolvers; // Not needed
  private pubsub: any;
  private logger: Logger;

  constructor(
    _customerController: CustomerController,
    _healthController: HealthController,
    httpServer: Server
  ) {
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
    // this.resolvers = new GraphQLResolvers(customerController, healthController);
    // this.pubsub = this.resolvers.getPubSub();

    // Create executable schema
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    // Setup WebSocket server for subscriptions
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql-ws',
    });

    const serverCleanup = useServer(
      {
        schema,
        context: async (ctx: any) => {
          return await this.buildContext(ctx.connectionParams);
        },
        onConnect: async (ctx: any) => {
          this.logger.info('WebSocket client connected', {
            connectionParams: ctx.connectionParams
          });
        },
        onDisconnect: async (_ctx: any, code: any, reason: any) => {
          this.logger.info('WebSocket client disconnected', {
            code,
            reason: reason.toString()
          });
        },
        onError: async (_ctx: any, msg: any, errors: any) => {
          this.logger.error('WebSocket error', new Error(`${msg}: ${errors.map((e: any) => e.message).join(', ')}`));
        },
      },
      wsServer
    );

    this.apolloServer = new ApolloServer({
      schema,
      context: async ({ req }: any) => {
        return await this.buildContext(req);
      },
      introspection: config.graphql?.introspection || true,
      // playground: config.graphql?.playground || true, // Removed as it's not available in this version
      plugins: [
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
      formatError: (error: any) => {
        this.logger.error('GraphQL error', error);
        return {
          message: error.message,
          code: error.extensions?.code,
          timestamp: new Date().toISOString(),
        };
      },
    });
  }

  /**
   * Build GraphQL context
   */
  private async buildContext(req: any): Promise<any> {
    const context: any = {
      requestId: req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    // Extract user information from JWT token if present
    const authHeader = req.headers?.authorization || req.connectionParams?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Here you would validate the JWT token and extract user information
        // For now, we'll just add the token to context
        context.token = token;
        // context.user = await this.validateToken(token);
      } catch (error) {
        this.logger.warn('Failed to parse authorization token', error);
      }
    }

    return context;
  }

  /**
   * Start GraphQL server
   */
  public async start(): Promise<void> {
    await this.apolloServer.start();
    this.logger.info('GraphQL server started successfully');
  }

  /**
   * Get Apollo Server middleware
   */
  public getMiddleware(): any {
    return this.apolloServer.getMiddleware({
      path: '/graphql',
      cors: {
        origin: config.cors?.origins || ['http://localhost:3000', 'http://localhost:4200'],
        credentials: true,
      },
    });
  }

  /**
   * Stop GraphQL server
   */
  public async stop(): Promise<void> {
    await this.apolloServer.stop();
    this.logger.info('GraphQL server stopped');
  }

  /**
   * Get context builder for WebSocket
   */
  public getContextBuilder(): (connectionParams: any) => Promise<any> {
    return this.buildContext.bind(this);
  }

  /**
   * Publish event to subscribers
   */
  public publishEvent(eventType: string, data: any, customerId?: string): void {
    const topic = customerId ? `${eventType}_${customerId}` : eventType;
    this.pubsub.publish(topic, data);
    this.logger.debug(`Published event: ${topic}`, { data });
  }

  /**
   * Get server info
   */
  public getServerInfo(): any {
    return {
      graphqlEndpoint: '/graphql',
      websocketEndpoint: '/graphql-ws',
      introspection: config.graphql?.introspection || true,
      // playground: config.graphql?.playground || true, // Removed as it's not available in this version
    };
  }
}

export default GraphQLServer;
