"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const kafkajs_1 = require("kafkajs");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
const config_1 = require("../config/config");
class KafkaService {
    constructor() {
        this.isInitialized = false;
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        this.kafka = new kafkajs_1.Kafka({
            clientId: config_1.config.kafka?.clientId || 'rubizz-customer-service',
            brokers: config_1.config.kafka?.brokers || ['localhost:9092'],
            retry: {
                initialRetryTime: config_1.config.kafka?.retryDelay || 1000,
                retries: config_1.config.kafka?.retryAttempts || 3,
            },
        });
        this.producer = this.kafka.producer({
            maxInFlightRequests: 1,
            idempotent: true,
            transactionTimeout: 30000,
        });
        this.consumer = this.kafka.consumer({
            groupId: config_1.config.kafka?.groupId || 'rubizz-customer-service-group',
            sessionTimeout: config_1.config.kafka?.sessionTimeout || 30000,
            heartbeatInterval: config_1.config.kafka?.heartbeatInterval || 3000,
        });
    }
    async initialize() {
        try {
            await this.producer.connect();
            this.logger.info('Kafka producer connected successfully');
            await this.consumer.connect();
            this.logger.info('Kafka consumer connected successfully');
            await this.subscribeToTopics();
            await this.startConsuming();
            this.isInitialized = true;
            this.logger.info('Kafka service initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Kafka service', error);
            throw error;
        }
    }
    async subscribeToTopics() {
        const topics = [
            config_1.config.kafka?.topics?.events || 'rubizz.events',
            config_1.config.kafka?.topics?.notifications || 'rubizz.notifications',
            config_1.config.kafka?.topics?.analytics || 'rubizz.analytics',
        ];
        for (const topic of topics) {
            await this.consumer.subscribe({ topic, fromBeginning: false });
            this.logger.info(`Subscribed to Kafka topic: ${topic}`);
        }
    }
    async startConsuming() {
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    await this.handleMessage(topic, partition, message);
                }
                catch (error) {
                    this.logger.error(`Failed to handle message from topic ${topic}`, error);
                }
            },
        });
    }
    async handleMessage(topic, partition, message) {
        try {
            const messageData = JSON.parse(message.value?.toString() || '{}');
            this.logger.debug(`Received message from topic ${topic}`, {
                partition,
                offset: message.offset,
                eventType: messageData.eventType,
                serviceName: messageData.serviceName,
            });
            switch (topic) {
                case config_1.config.kafka?.topics?.events || 'rubizz.events':
                    await this.handleEventMessage(messageData);
                    break;
                case config_1.config.kafka?.topics?.notifications || 'rubizz.notifications':
                    await this.handleNotificationMessage(messageData);
                    break;
                case config_1.config.kafka?.topics?.analytics || 'rubizz.analytics':
                    await this.handleAnalyticsMessage(messageData);
                    break;
                default:
                    this.logger.warn(`Unknown topic: ${topic}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process message from topic ${topic}`, error);
        }
    }
    async handleEventMessage(eventData) {
        try {
            this.logger.info(`Processing event: ${eventData.eventType}`, {
                serviceName: eventData.serviceName,
                customerId: eventData.metadata.customerId,
            });
            switch (eventData.eventType) {
                case 'USER_REGISTERED':
                    await this.handleUserRegisteredEvent(eventData);
                    break;
                case 'USER_LOGIN':
                    await this.handleUserLoginEvent(eventData);
                    break;
                case 'BOOKING_CREATED':
                    await this.handleBookingCreatedEvent(eventData);
                    break;
                case 'ORDER_PLACED':
                    await this.handleOrderPlacedEvent(eventData);
                    break;
                default:
                    this.logger.debug(`Unhandled event type: ${eventData.eventType}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to handle event message', error);
        }
    }
    async handleNotificationMessage(notificationData) {
        try {
            this.logger.info('Processing notification message', {
                type: notificationData.type,
                customerId: notificationData.customerId,
            });
        }
        catch (error) {
            this.logger.error('Failed to handle notification message', error);
        }
    }
    async handleAnalyticsMessage(analyticsData) {
        try {
            this.logger.debug('Processing analytics message', {
                type: analyticsData.type,
                customerId: analyticsData.customerId,
            });
        }
        catch (error) {
            this.logger.error('Failed to handle analytics message', error);
        }
    }
    async handleUserRegisteredEvent(eventData) {
        try {
            if (eventData.data?.user) {
                this.logger.info('User registered event received', {
                    userId: eventData.data.user.id,
                    email: eventData.data.user.email,
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to handle user registered event', error);
        }
    }
    async handleUserLoginEvent(eventData) {
        try {
            if (eventData.data?.user?.id) {
                this.logger.info('User login event received', {
                    userId: eventData.data.user.id,
                    email: eventData.data.user.email,
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to handle user login event', error);
        }
    }
    async handleBookingCreatedEvent(eventData) {
        try {
            if (eventData.data?.booking?.customerId) {
                this.logger.info('Booking created event received', {
                    customerId: eventData.data.booking.customerId,
                    bookingId: eventData.data.booking.id,
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to handle booking created event', error);
        }
    }
    async handleOrderPlacedEvent(eventData) {
        try {
            if (eventData.data?.order?.customerId) {
                this.logger.info('Order placed event received', {
                    customerId: eventData.data.order.customerId,
                    orderId: eventData.data.order.id,
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to handle order placed event', error);
        }
    }
    async publishEvent(event) {
        try {
            if (!this.isInitialized) {
                throw new Error('Kafka service not initialized');
            }
            const topic = this.getTopicForEventType(event.eventType);
            const message = {
                key: event.metadata.customerId || event.metadata.requestId || 'default',
                value: JSON.stringify(event),
                timestamp: Date.now().toString(),
                headers: {
                    eventType: event.eventType,
                    serviceName: event.serviceName,
                    timestamp: event.metadata.timestamp,
                },
            };
            await this.producer.send({
                topic,
                messages: [message],
            });
            this.logger.info(`Published event to Kafka`, {
                topic,
                eventType: event.eventType,
                customerId: event.metadata.customerId,
            });
        }
        catch (error) {
            this.logger.error('Failed to publish event to Kafka', error);
            throw error;
        }
    }
    getTopicForEventType(eventType) {
        if (eventType.startsWith('CUSTOMER_')) {
            return config_1.config.kafka?.topics?.events || 'rubizz.events';
        }
        else if (eventType.includes('NOTIFICATION')) {
            return config_1.config.kafka?.topics?.notifications || 'rubizz.notifications';
        }
        else if (eventType.includes('ANALYTICS')) {
            return config_1.config.kafka?.topics?.analytics || 'rubizz.analytics';
        }
        else {
            return config_1.config.kafka?.topics?.events || 'rubizz.events';
        }
    }
    async publishCustomerCreatedEvent(customer, requestId) {
        const event = {
            eventType: 'CUSTOMER_CREATED',
            serviceName: 'customer-service',
            data: { customer },
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                customerId: customer.id,
            },
        };
        await this.publishEvent(event);
    }
    async publishCustomerUpdatedEvent(customer, requestId) {
        const event = {
            eventType: 'CUSTOMER_UPDATED',
            serviceName: 'customer-service',
            data: { customer },
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                customerId: customer.id,
            },
        };
        await this.publishEvent(event);
    }
    async publishCustomerVerifiedEvent(customer, requestId) {
        const event = {
            eventType: 'CUSTOMER_VERIFIED',
            serviceName: 'customer-service',
            data: { customer },
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                customerId: customer.id,
            },
        };
        await this.publishEvent(event);
    }
    async publishCustomerAddressAddedEvent(customerId, address, requestId) {
        const event = {
            eventType: 'CUSTOMER_ADDRESS_ADDED',
            serviceName: 'customer-service',
            data: { customerId, address },
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                customerId,
            },
        };
        await this.publishEvent(event);
    }
    async publishCustomerNotificationSentEvent(customerId, notification, requestId) {
        const event = {
            eventType: 'CUSTOMER_NOTIFICATION_SENT',
            serviceName: 'customer-service',
            data: { customerId, notification },
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                customerId,
            },
        };
        await this.publishEvent(event);
    }
    async getConsumerLag() {
        try {
            const admin = this.kafka.admin();
            await admin.connect();
            const groupId = config_1.config.kafka?.groupId || 'rubizz-customer-service-group';
            const lag = await admin.fetchOffsets({ groupId });
            await admin.disconnect();
            return lag;
        }
        catch (error) {
            this.logger.error('Failed to get consumer lag', error);
            return null;
        }
    }
    async disconnect() {
        try {
            if (this.producer) {
                await this.producer.disconnect();
                this.logger.info('Kafka producer disconnected');
            }
            if (this.consumer) {
                await this.consumer.disconnect();
                this.logger.info('Kafka consumer disconnected');
            }
            this.isInitialized = false;
            this.logger.info('Kafka service disconnected successfully');
        }
        catch (error) {
            this.logger.error('Error disconnecting from Kafka', error);
        }
    }
    isServiceInitialized() {
        return this.isInitialized;
    }
}
exports.KafkaService = KafkaService;
exports.default = KafkaService;
//# sourceMappingURL=KafkaService.js.map