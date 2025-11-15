import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config';
import { Logger } from '@sandip1046/rubizz-shared-libs';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  private mailServiceClient: AxiosInstance;
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance('rubizz-customer-service', config.nodeEnv);
    
    // Initialize HTTP client for mail-service
    this.mailServiceClient = axios.create({
      baseURL: config.services.mailService,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Send email (generic method - can be used for custom emails)
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send', {
        to: options.to,
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text,
        attachments: options.attachments,
      });

      if (response.data.success) {
        this.logger.info('Email sent successfully', {
          to: options.to,
          subject: options.subject,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send email', new Error(response.data.error?.message || 'Unknown error'), {
          to: options.to,
          subject: options.subject,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send email', error as Error, {
        to: options.to,
        subject: options.subject,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send welcome email to new customer
  public async sendWelcomeEmail(customerEmail: string, customerName: string): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_welcome',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
        },
      });

      if (response.data.success) {
        this.logger.info('Welcome email sent successfully', {
          customerEmail,
          customerName,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send welcome email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send welcome email', error as Error, {
        customerEmail,
        customerName,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send email verification
  public async sendVerificationEmail(customerEmail: string, customerName: string, verificationToken: string): Promise<boolean> {
    try {
      const verificationUrl = `${config.services.apiGateway}/verify-email?token=${verificationToken}`;
      
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_email_verification',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          verificationUrl,
          verificationToken,
        },
      });

      if (response.data.success) {
        this.logger.info('Verification email sent successfully', {
          customerEmail,
          customerName,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send verification email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send verification email', error as Error, {
        customerEmail,
        customerName,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send password reset email
  public async sendPasswordResetEmail(customerEmail: string, customerName: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${config.services.apiGateway}/reset-password?token=${resetToken}`;
      
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_password_reset',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          resetUrl,
          resetToken,
        },
      });

      if (response.data.success) {
        this.logger.info('Password reset email sent successfully', {
          customerEmail,
          customerName,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send password reset email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send password reset email', error as Error, {
        customerEmail,
        customerName,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send booking confirmation email (generic - for backward compatibility)
  public async sendBookingConfirmationEmail(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      type: string;
      reference: string;
      date: string;
      amount: number;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_booking_confirmation',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingType: bookingDetails.type,
          bookingReference: bookingDetails.reference,
          bookingDate: bookingDetails.date,
          bookingAmount: bookingDetails.amount,
        },
      });

      if (response.data.success) {
        this.logger.info('Booking confirmation email sent successfully', {
          customerEmail,
          customerName,
          bookingReference: bookingDetails.reference,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send booking confirmation email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingReference: bookingDetails.reference,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send booking confirmation email', error as Error, {
        customerEmail,
        customerName,
        bookingReference: bookingDetails.reference,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send room booking confirmation email
  public async sendRoomBookingConfirmation(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      bookingNumber: string;
      roomNumber: string;
      roomType: string;
      checkInDate: string;
      checkOutDate: string;
      totalAmount: number;
      guestCount?: number;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_room_booking_confirmation',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: bookingDetails.bookingNumber,
          roomNumber: bookingDetails.roomNumber,
          roomType: bookingDetails.roomType,
          checkInDate: bookingDetails.checkInDate,
          checkOutDate: bookingDetails.checkOutDate,
          totalAmount: bookingDetails.totalAmount,
          guestCount: bookingDetails.guestCount || 1,
        },
      });

      if (response.data.success) {
        this.logger.info('Room booking confirmation email sent successfully', {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send room booking confirmation email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send room booking confirmation email', error as Error, {
        customerEmail,
        customerName,
        bookingNumber: bookingDetails.bookingNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send room booking cancellation email
  public async sendRoomBookingCancellation(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      bookingNumber: string;
      roomNumber: string;
      cancellationReason?: string;
      refundAmount?: number;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_room_booking_cancellation',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: bookingDetails.bookingNumber,
          roomNumber: bookingDetails.roomNumber,
          cancellationReason: bookingDetails.cancellationReason || 'Customer request',
          refundAmount: bookingDetails.refundAmount || 0,
          hasRefund: bookingDetails.refundAmount ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Room booking cancellation email sent successfully', {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send room booking cancellation email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send room booking cancellation email', error as Error, {
        customerEmail,
        customerName,
        bookingNumber: bookingDetails.bookingNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send table booking confirmation email
  public async sendTableBookingConfirmation(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      bookingNumber: string;
      tableNumber: string;
      bookingDate: string;
      bookingTime: string;
      partySize: number;
      totalAmount: number;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_table_booking_confirmation',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: bookingDetails.bookingNumber,
          tableNumber: bookingDetails.tableNumber,
          bookingDate: bookingDetails.bookingDate,
          bookingTime: bookingDetails.bookingTime,
          partySize: bookingDetails.partySize,
          totalAmount: bookingDetails.totalAmount,
        },
      });

      if (response.data.success) {
        this.logger.info('Table booking confirmation email sent successfully', {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send table booking confirmation email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send table booking confirmation email', error as Error, {
        customerEmail,
        customerName,
        bookingNumber: bookingDetails.bookingNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send table booking cancellation email
  public async sendTableBookingCancellation(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      bookingNumber: string;
      tableNumber: string;
      cancellationReason?: string;
      refundAmount?: number;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_table_booking_cancellation',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: bookingDetails.bookingNumber,
          tableNumber: bookingDetails.tableNumber,
          cancellationReason: bookingDetails.cancellationReason || 'Customer request',
          refundAmount: bookingDetails.refundAmount || 0,
          hasRefund: bookingDetails.refundAmount ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Table booking cancellation email sent successfully', {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send table booking cancellation email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send table booking cancellation email', error as Error, {
        customerEmail,
        customerName,
        bookingNumber: bookingDetails.bookingNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send hall booking confirmation email
  public async sendHallBookingConfirmation(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      bookingNumber: string;
      hallName: string;
      eventDate: string;
      eventTime: string;
      eventType: string;
      totalAmount: number;
      guestCount?: number;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_hall_booking_confirmation',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: bookingDetails.bookingNumber,
          hallName: bookingDetails.hallName,
          eventDate: bookingDetails.eventDate,
          eventTime: bookingDetails.eventTime,
          eventType: bookingDetails.eventType,
          totalAmount: bookingDetails.totalAmount,
          guestCount: bookingDetails.guestCount || 0,
        },
      });

      if (response.data.success) {
        this.logger.info('Hall booking confirmation email sent successfully', {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send hall booking confirmation email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send hall booking confirmation email', error as Error, {
        customerEmail,
        customerName,
        bookingNumber: bookingDetails.bookingNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send hall booking cancellation email
  public async sendHallBookingCancellation(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      bookingNumber: string;
      hallName: string;
      cancellationReason?: string;
      refundAmount?: number;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_hall_booking_cancellation',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: bookingDetails.bookingNumber,
          hallName: bookingDetails.hallName,
          cancellationReason: bookingDetails.cancellationReason || 'Customer request',
          refundAmount: bookingDetails.refundAmount || 0,
          hasRefund: bookingDetails.refundAmount ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Hall booking cancellation email sent successfully', {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send hall booking cancellation email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send hall booking cancellation email', error as Error, {
        customerEmail,
        customerName,
        bookingNumber: bookingDetails.bookingNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send booking reschedule email
  public async sendBookingReschedule(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      bookingNumber: string;
      bookingType: string;
      oldDate: string;
      newDate: string;
      oldTime?: string;
      newTime?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_booking_reschedule',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: bookingDetails.bookingNumber,
          bookingType: bookingDetails.bookingType,
          oldDate: bookingDetails.oldDate,
          newDate: bookingDetails.newDate,
          oldTime: bookingDetails.oldTime || '',
          newTime: bookingDetails.newTime || '',
          hasTime: bookingDetails.oldTime && bookingDetails.newTime ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Booking reschedule email sent successfully', {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send booking reschedule email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send booking reschedule email', error as Error, {
        customerEmail,
        customerName,
        bookingNumber: bookingDetails.bookingNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send check-in reminder email
  public async sendCheckInReminder(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      bookingNumber: string;
      checkInDate: string;
      checkInTime?: string;
      location?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_checkin_reminder',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: bookingDetails.bookingNumber,
          checkInDate: bookingDetails.checkInDate,
          checkInTime: bookingDetails.checkInTime || '',
          location: bookingDetails.location || 'Rubizz Hotel Inn',
          hasTime: bookingDetails.checkInTime ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Check-in reminder email sent successfully', {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send check-in reminder email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send check-in reminder email', error as Error, {
        customerEmail,
        customerName,
        bookingNumber: bookingDetails.bookingNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send check-out reminder email
  public async sendCheckOutReminder(
    customerEmail: string,
    customerName: string,
    bookingDetails: {
      bookingNumber: string;
      checkOutDate: string;
      checkOutTime?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_checkout_reminder',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: bookingDetails.bookingNumber,
          checkOutDate: bookingDetails.checkOutDate,
          checkOutTime: bookingDetails.checkOutTime || '',
          hasTime: bookingDetails.checkOutTime ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Check-out reminder email sent successfully', {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send check-out reminder email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          bookingNumber: bookingDetails.bookingNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send check-out reminder email', error as Error, {
        customerEmail,
        customerName,
        bookingNumber: bookingDetails.bookingNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send order status update email
  public async sendOrderStatusUpdate(
    customerEmail: string,
    customerName: string,
    orderDetails: {
      orderNumber: string;
      status: string;
      statusMessage?: string;
      estimatedTime?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_order_status_update',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          orderNumber: orderDetails.orderNumber,
          status: orderDetails.status,
          statusMessage: orderDetails.statusMessage || `Your order is now ${orderDetails.status}`,
          estimatedTime: orderDetails.estimatedTime || '',
          hasEstimatedTime: orderDetails.estimatedTime ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Order status update email sent successfully', {
          customerEmail,
          customerName,
          orderNumber: orderDetails.orderNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send order status update email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          orderNumber: orderDetails.orderNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send order status update email', error as Error, {
        customerEmail,
        customerName,
        orderNumber: orderDetails.orderNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send order delivered email
  public async sendOrderDelivered(
    customerEmail: string,
    customerName: string,
    orderDetails: {
      orderNumber: string;
      deliveryTime: string;
      deliveryAddress?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_order_delivered',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          orderNumber: orderDetails.orderNumber,
          deliveryTime: orderDetails.deliveryTime,
          deliveryAddress: orderDetails.deliveryAddress || '',
        },
      });

      if (response.data.success) {
        this.logger.info('Order delivered email sent successfully', {
          customerEmail,
          customerName,
          orderNumber: orderDetails.orderNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send order delivered email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          orderNumber: orderDetails.orderNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send order delivered email', error as Error, {
        customerEmail,
        customerName,
        orderNumber: orderDetails.orderNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send order cancellation email
  public async sendOrderCancellation(
    customerEmail: string,
    customerName: string,
    orderDetails: {
      orderNumber: string;
      cancellationReason?: string;
      refundAmount?: number;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_order_cancellation',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          orderNumber: orderDetails.orderNumber,
          cancellationReason: orderDetails.cancellationReason || 'Customer request',
          refundAmount: orderDetails.refundAmount || 0,
          hasRefund: orderDetails.refundAmount ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Order cancellation email sent successfully', {
          customerEmail,
          customerName,
          orderNumber: orderDetails.orderNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send order cancellation email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          orderNumber: orderDetails.orderNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send order cancellation email', error as Error, {
        customerEmail,
        customerName,
        orderNumber: orderDetails.orderNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send account update email
  public async sendAccountUpdate(
    customerEmail: string,
    customerName: string,
    updateDetails: {
      updateType: string;
      updateMessage: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_account_update',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          updateType: updateDetails.updateType,
          updateMessage: updateDetails.updateMessage,
        },
      });

      if (response.data.success) {
        this.logger.info('Account update email sent successfully', {
          customerEmail,
          customerName,
          updateType: updateDetails.updateType,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send account update email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          updateType: updateDetails.updateType,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send account update email', error as Error, {
        customerEmail,
        customerName,
        updateType: updateDetails.updateType,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send offer/promotion email
  public async sendOfferPromotion(
    customerEmail: string,
    customerName: string,
    offerDetails: {
      offerTitle: string;
      offerDescription: string;
      discountCode?: string;
      validUntil?: string;
      offerLink?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_offer_promotion',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          offerTitle: offerDetails.offerTitle,
          offerDescription: offerDetails.offerDescription,
          discountCode: offerDetails.discountCode || '',
          validUntil: offerDetails.validUntil || '',
          offerLink: offerDetails.offerLink || '',
          hasDiscountCode: offerDetails.discountCode ? 'true' : 'false',
          hasValidUntil: offerDetails.validUntil ? 'true' : 'false',
          hasOfferLink: offerDetails.offerLink ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Offer/promotion email sent successfully', {
          customerEmail,
          customerName,
          offerTitle: offerDetails.offerTitle,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send offer/promotion email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          offerTitle: offerDetails.offerTitle,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send offer/promotion email', error as Error, {
        customerEmail,
        customerName,
        offerTitle: offerDetails.offerTitle,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send loyalty points update email
  public async sendLoyaltyPointsUpdate(
    customerEmail: string,
    customerName: string,
    loyaltyDetails: {
      pointsEarned?: number;
      pointsRedeemed?: number;
      currentBalance: number;
      transactionType: string;
      transactionDescription?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_loyalty_points_update',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          pointsEarned: loyaltyDetails.pointsEarned || 0,
          pointsRedeemed: loyaltyDetails.pointsRedeemed || 0,
          currentBalance: loyaltyDetails.currentBalance,
          transactionType: loyaltyDetails.transactionType,
          transactionDescription: loyaltyDetails.transactionDescription || '',
          hasPointsEarned: loyaltyDetails.pointsEarned ? 'true' : 'false',
          hasPointsRedeemed: loyaltyDetails.pointsRedeemed ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Loyalty points update email sent successfully', {
          customerEmail,
          customerName,
          currentBalance: loyaltyDetails.currentBalance,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send loyalty points update email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          currentBalance: loyaltyDetails.currentBalance,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send loyalty points update email', error as Error, {
        customerEmail,
        customerName,
        currentBalance: loyaltyDetails.currentBalance,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send review request email
  public async sendReviewRequest(
    customerEmail: string,
    customerName: string,
    reviewDetails: {
      bookingNumber?: string;
      orderNumber?: string;
      reviewLink: string;
      serviceType: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_review_request',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          bookingNumber: reviewDetails.bookingNumber || '',
          orderNumber: reviewDetails.orderNumber || '',
          reviewLink: reviewDetails.reviewLink,
          serviceType: reviewDetails.serviceType,
          hasBookingNumber: reviewDetails.bookingNumber ? 'true' : 'false',
          hasOrderNumber: reviewDetails.orderNumber ? 'true' : 'false',
        },
      });

      if (response.data.success) {
        this.logger.info('Review request email sent successfully', {
          customerEmail,
          customerName,
          serviceType: reviewDetails.serviceType,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send review request email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          serviceType: reviewDetails.serviceType,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send review request email', error as Error, {
        customerEmail,
        customerName,
        serviceType: reviewDetails.serviceType,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send order confirmation email
  public async sendOrderConfirmationEmail(
    customerEmail: string,
    customerName: string,
    orderDetails: {
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      deliveryAddress?: string;
    }
  ): Promise<boolean> {
    try {
      // Format items for template
      const itemsList = orderDetails.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }));

      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_order_confirmation',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          orderNumber: orderDetails.orderNumber,
          items: JSON.stringify(itemsList),
          itemsCount: orderDetails.items.length,
          orderTotal: orderDetails.total,
          deliveryAddress: orderDetails.deliveryAddress || 'N/A',
        },
      });

      if (response.data.success) {
        this.logger.info('Order confirmation email sent successfully', {
          customerEmail,
          customerName,
          orderNumber: orderDetails.orderNumber,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send order confirmation email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          orderNumber: orderDetails.orderNumber,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send order confirmation email', error as Error, {
        customerEmail,
        customerName,
        orderNumber: orderDetails.orderNumber,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }

  // Send notification email
  public async sendNotificationEmail(
    customerEmail: string,
    customerName: string,
    notification: {
      title: string;
      message: string;
      type: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mailServiceClient.post('/api/v1/mail/send-template', {
        templateName: 'customer_notification',
        to: customerEmail,
        variables: {
          customerName,
          customerEmail,
          notificationTitle: notification.title,
          notificationMessage: notification.message,
          notificationType: notification.type,
        },
      });

      if (response.data.success) {
        this.logger.info('Notification email sent successfully', {
          customerEmail,
          customerName,
          notificationType: notification.type,
          emailId: response.data.data?.emailId,
        });
        return true;
      } else {
        this.logger.error('Failed to send notification email', new Error(response.data.error?.message || 'Unknown error'), {
          customerEmail,
          customerName,
          notificationType: notification.type,
        });
        return false;
      }
    } catch (error: any) {
      this.logger.error('Failed to send notification email', error as Error, {
        customerEmail,
        customerName,
        notificationType: notification.type,
        errorMessage: error.response?.data?.error?.message || error.message,
      });
      return false;
    }
  }
}

export default EmailService;
