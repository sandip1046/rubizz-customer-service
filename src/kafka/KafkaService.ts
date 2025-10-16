import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { Logger } from '@sandip1046/rubizz-shared-libs';
import { config } from '../config/config';

export interface KafkaEvent {
  eventType: string;
  serviceName: string;
  data: any;
  metadata: {
    timestamp: string;
    requestId?: string;
    customerId?: string;
    [key: string]: any;
  };
}

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private logger: Logger;
  private isInitialized: boolean = false;

  constructor() {
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
    
    this.kafka = new Kafka({
      clientId: config.kafka?.clientId || 'rubizz-customer-service',
      brokers: config.kafka?.brokers || ['localhost:9092'],
      retry: {
        initialRetryTime: config.kafka?.retryDelay || 1000,
        retries: config.kafka?.retryAttempts || 3,
      },
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });

    this.consumer = this.kafka.consumer({
      groupId: config.kafka?.groupId || 'rubizz-customer-service-group',
      sessionTimeout: config.kafka?.sessionTimeout || 30000,
      heartbeatInterval: config.kafka?.heartbeatInterval || 3000,
    });
  }

  /**
   * Initialize Kafka service
   */
  public async initialize(): Promise<void> {
    try {
      // Connect producer
      await this.producer.connect();
      this.logger.info('Kafka producer connected successfully');

      // Connect consumer
      await this.consumer.connect();
      this.logger.info('Kafka consumer connected successfully');

      // Subscribe to relevant topics
      await this.subscribeToTopics();

      // Start consuming messages
      await this.startConsuming();

      this.isInitialized = true;
      this.logger.info('Kafka service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Kafka service', error as Error);
      throw error;
    }
  }

  /**
   * Subscribe to relevant Kafka topics
   */
  private async subscribeToTopics(): Promise<void> {
    const topics = [
      config.kafka?.topics?.events || 'rubizz.events',
      config.kafka?.topics?.notifications || 'rubizz.notifications',
      config.kafka?.topics?.analytics || 'rubizz.analytics',
    ];

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
      this.logger.info(`Subscribed to Kafka topic: ${topic}`);
    }
  }

  /**
   * Start consuming messages
   */
  private async startConsuming(): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        try {
          await this.handleMessage(topic, partition, message);
        } catch (error) {
          this.logger.error(`Failed to handle message from topic ${topic}`, error as Error);
        }
      },
    });
  }

  /**
   * Handle incoming Kafka messages
   */
  private async handleMessage(topic: string, partition: number, message: any): Promise<void> {
    try {
      const messageData = JSON.parse(message.value?.toString() || '{}');
      
      this.logger.debug(`Received message from topic ${topic}`, {
        partition,
        offset: message.offset,
        eventType: messageData.eventType,
        serviceName: messageData.serviceName,
      });

      // Handle different event types
      switch (topic) {
        case config.kafka?.topics?.events || 'rubizz.events':
          await this.handleEventMessage(messageData);
          break;
        case config.kafka?.topics?.notifications || 'rubizz.notifications':
          await this.handleNotificationMessage(messageData);
          break;
        case config.kafka?.topics?.analytics || 'rubizz.analytics':
          await this.handleAnalyticsMessage(messageData);
          break;
        default:
          this.logger.warn(`Unknown topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process message from topic ${topic}`, error as Error);
    }
  }

  /**
   * Handle event messages
   */
  private async handleEventMessage(eventData: KafkaEvent): Promise<void> {
    try {
      this.logger.info(`Processing event: ${eventData.eventType}`, {
        serviceName: eventData.serviceName,
        customerId: eventData.metadata.customerId,
      });

      // Handle different event types
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
    } catch (error) {
      this.logger.error('Failed to handle event message', error as Error);
    }
  }

  /**
   * Handle notification messages
   */
  private async handleNotificationMessage(notificationData: any): Promise<void> {
    try {
      this.logger.info('Processing notification message', {
        type: notificationData.type,
        customerId: notificationData.customerId,
      });

      // Process notification logic here
      // This could involve sending emails, SMS, push notifications, etc.
    } catch (error) {
      this.logger.error('Failed to handle notification message', error as Error);
    }
  }

  /**
   * Handle analytics messages
   */
  private async handleAnalyticsMessage(analyticsData: any): Promise<void> {
    try {
      this.logger.debug('Processing analytics message', {
        type: analyticsData.type,
        customerId: analyticsData.customerId,
      });

      // Process analytics logic here
      // This could involve updating customer analytics, tracking behavior, etc.
    } catch (error) {
      this.logger.error('Failed to handle analytics message', error as Error);
    }
  }

  /**
   * Handle user registered event
   */
  private async handleUserRegisteredEvent(eventData: KafkaEvent): Promise<void> {
    try {
      // Create customer record if user is registered
      if (eventData.data?.user) {
        this.logger.info('User registered event received', {
          userId: eventData.data.user.id,
          email: eventData.data.user.email,
        });

        // You could create a customer record here or update existing one
        // This depends on your business logic
      }
    } catch (error) {
      this.logger.error('Failed to handle user registered event', error as Error);
    }
  }

  /**
   * Handle user login event
   */
  private async handleUserLoginEvent(eventData: KafkaEvent): Promise<void> {
    try {
      if (eventData.data?.user?.id) {
        this.logger.info('User login event received', {
          userId: eventData.data.user.id,
          email: eventData.data.user.email,
        });

        // Update last login for customer
        // This would typically call your customer service methods
      }
    } catch (error) {
      this.logger.error('Failed to handle user login event', error as Error);
    }
  }

  /**
   * Handle booking created event
   */
  private async handleBookingCreatedEvent(eventData: KafkaEvent): Promise<void> {
    try {
      if (eventData.data?.booking?.customerId) {
        this.logger.info('Booking created event received', {
          customerId: eventData.data.booking.customerId,
          bookingId: eventData.data.booking.id,
        });

        // Update customer activity or send notification
        // This would typically call your customer service methods
      }
    } catch (error) {
      this.logger.error('Failed to handle booking created event', error as Error);
    }
  }

  /**
   * Handle order placed event
   */
  private async handleOrderPlacedEvent(eventData: KafkaEvent): Promise<void> {
    try {
      if (eventData.data?.order?.customerId) {
        this.logger.info('Order placed event received', {
          customerId: eventData.data.order.customerId,
          orderId: eventData.data.order.id,
        });

        // Update customer activity or send notification
        // This would typically call your customer service methods
      }
    } catch (error) {
      this.logger.error('Failed to handle order placed event', error as Error);
    }
  }

  /**
   * Publish event to Kafka
   */
  public async publishEvent(event: KafkaEvent): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to publish event to Kafka', error as Error);
      throw error;
    }
  }

  /**
   * Get appropriate topic for event type
   */
  private getTopicForEventType(eventType: string): string {
    // Map event types to topics
    if (eventType.startsWith('CUSTOMER_')) {
      return config.kafka?.topics?.events || 'rubizz.events';
    } else if (eventType.includes('NOTIFICATION')) {
      return config.kafka?.topics?.notifications || 'rubizz.notifications';
    } else if (eventType.includes('ANALYTICS')) {
      return config.kafka?.topics?.analytics || 'rubizz.analytics';
    } else {
      return config.kafka?.topics?.events || 'rubizz.events';
    }
  }

  /**
   * Publish customer created event
   */
  public async publishCustomerCreatedEvent(customer: any, requestId?: string): Promise<void> {
    const event: KafkaEvent = {
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

  /**
   * Publish customer updated event
   */
  public async publishCustomerUpdatedEvent(customer: any, requestId?: string): Promise<void> {
    const event: KafkaEvent = {
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

  /**
   * Publish customer verified event
   */
  public async publishCustomerVerifiedEvent(customer: any, requestId?: string): Promise<void> {
    const event: KafkaEvent = {
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

  /**
   * Publish customer address added event
   */
  public async publishCustomerAddressAddedEvent(customerId: string, address: any, requestId?: string): Promise<void> {
    const event: KafkaEvent = {
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

  /**
   * Publish customer notification sent event
   */
  public async publishCustomerNotificationSentEvent(customerId: string, notification: any, requestId?: string): Promise<void> {
    const event: KafkaEvent = {
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

  /**
   * Get consumer lag information
   */
  public async getConsumerLag(): Promise<any> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();

      const groupId = config.kafka?.groupId || 'rubizz-customer-service-group';
      const lag = await admin.fetchOffsets({ groupId });

      await admin.disconnect();
      return lag;
    } catch (error) {
      this.logger.error('Failed to get consumer lag', error as Error);
      return null;
    }
  }

  /**
   * Disconnect from Kafka
   */
  public async disconnect(): Promise<void> {
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
    } catch (error) {
      this.logger.error('Error disconnecting from Kafka', error as Error);
    }
  }

  /**
   * Check if Kafka service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export default KafkaService;
