"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLServer = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const schema_1 = require("@graphql-tools/schema");
const ws_1 = require("graphql-ws/lib/use/ws");
const ws_2 = require("ws");
const schema_2 = require("./schema");
const resolvers_1 = __importDefault(require("./resolvers"));
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
const config_1 = require("../config/config");
class GraphQLServer {
    constructor(_customerController, _healthController, httpServer) {
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        const schema = (0, schema_1.makeExecutableSchema)({
            typeDefs: schema_2.typeDefs,
            resolvers: resolvers_1.default,
        });
        const wsServer = new ws_2.WebSocketServer({
            server: httpServer,
            path: '/graphql-ws',
        });
        const serverCleanup = (0, ws_1.useServer)({
            schema,
            context: async (ctx) => {
                return await this.buildContext(ctx.connectionParams);
            },
            onConnect: async (ctx) => {
                this.logger.info('WebSocket client connected', {
                    connectionParams: ctx.connectionParams
                });
            },
            onDisconnect: async (_ctx, code, reason) => {
                this.logger.info('WebSocket client disconnected', {
                    code,
                    reason: reason.toString()
                });
            },
            onError: async (_ctx, msg, errors) => {
                this.logger.error('WebSocket error', new Error(`${msg}: ${errors.map((e) => e.message).join(', ')}`));
            },
        }, wsServer);
        this.apolloServer = new apollo_server_express_1.ApolloServer({
            schema,
            context: async ({ req }) => {
                return await this.buildContext(req);
            },
            introspection: config_1.config.graphql?.introspection || true,
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
            formatError: (error) => {
                this.logger.error('GraphQL error', error);
                return {
                    message: error.message,
                    code: error.extensions?.code,
                    timestamp: new Date().toISOString(),
                };
            },
        });
    }
    async buildContext(req) {
        const context = {
            requestId: req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
        };
        const authHeader = req.headers?.authorization || req.connectionParams?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                context.token = token;
            }
            catch (error) {
                this.logger.warn('Failed to parse authorization token', error);
            }
        }
        return context;
    }
    async start() {
        await this.apolloServer.start();
        this.logger.info('GraphQL server started successfully');
    }
    getMiddleware() {
        return this.apolloServer.getMiddleware({
            path: '/graphql',
            cors: {
                origin: config_1.config.cors?.origins || ['http://localhost:3000', 'http://localhost:4200'],
                credentials: true,
            },
        });
    }
    async stop() {
        await this.apolloServer.stop();
        this.logger.info('GraphQL server stopped');
    }
    getContextBuilder() {
        return this.buildContext.bind(this);
    }
    publishEvent(eventType, data, customerId) {
        const topic = customerId ? `${eventType}_${customerId}` : eventType;
        this.pubsub.publish(topic, data);
        this.logger.debug(`Published event: ${topic}`, { data });
    }
    getServerInfo() {
        return {
            graphqlEndpoint: '/graphql',
            websocketEndpoint: '/graphql-ws',
            introspection: config_1.config.graphql?.introspection || true,
        };
    }
}
exports.GraphQLServer = GraphQLServer;
exports.default = GraphQLServer;
//# sourceMappingURL=GraphQLServer.js.map