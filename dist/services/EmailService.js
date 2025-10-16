"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config/config");
const rubizz_shared_libs_1 = require("@sandip1046/rubizz-shared-libs");
class EmailService {
    constructor() {
        this.logger = rubizz_shared_libs_1.Logger.getInstance('rubizz-customer-service', config_1.config.nodeEnv);
        this.transporter = nodemailer_1.default.createTransport({
            host: config_1.config.email.smtp.host,
            port: config_1.config.email.smtp.port,
            secure: false,
            auth: {
                user: config_1.config.email.smtp.user,
                pass: config_1.config.email.smtp.pass,
            },
        });
        this.verifyConnection();
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            this.logger.info('Email service connection verified');
        }
        catch (error) {
            this.logger.error('Email service connection failed:', error);
        }
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: {
                    name: config_1.config.email.from.name,
                    address: config_1.config.email.from.email,
                },
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments,
            };
            const result = await this.transporter.sendMail(mailOptions);
            this.logger.info('Email sent successfully', { messageId: result.messageId, to: options.to });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send email:', error);
            return false;
        }
    }
    async sendWelcomeEmail(customerEmail, customerName) {
        const subject = 'Welcome to Rubizz Hotel Inn!';
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Rubizz Hotel Inn</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #cb9c03; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #cb9c03; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Rubizz Hotel Inn!</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>Welcome to Rubizz Hotel Inn! We're thrilled to have you as part of our family.</p>
            <p>Your account has been successfully created and you can now:</p>
            <ul>
              <li>Book hotel rooms with exclusive member rates</li>
              <li>Reserve restaurant tables for dining</li>
              <li>Order food for delivery or dine-in</li>
              <li>Book event halls for special occasions</li>
              <li>Earn loyalty points with every booking</li>
            </ul>
            <p>We look forward to providing you with exceptional service!</p>
            <a href="#" class="button">Start Exploring</a>
          </div>
          <div class="footer">
            <p>© 2024 Rubizz Hotel Inn. All rights reserved.</p>
            <p>This email was sent to ${customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return await this.sendEmail({
            to: customerEmail,
            subject,
            html,
        });
    }
    async sendVerificationEmail(customerEmail, customerName, verificationToken) {
        const subject = 'Verify Your Email - Rubizz Hotel Inn';
        const verificationUrl = `${config_1.config.services.apiGateway}/verify-email?token=${verificationToken}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #cb9c03; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #cb9c03; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .code { background-color: #f0f0f0; padding: 10px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>Thank you for registering with Rubizz Hotel Inn. To complete your registration, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Rubizz Hotel Inn. All rights reserved.</p>
            <p>This email was sent to ${customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return await this.sendEmail({
            to: customerEmail,
            subject,
            html,
        });
    }
    async sendPasswordResetEmail(customerEmail, customerName, resetToken) {
        const subject = 'Reset Your Password - Rubizz Hotel Inn';
        const resetUrl = `${config_1.config.services.apiGateway}/reset-password?token=${resetToken}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #cb9c03; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #cb9c03; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>We received a request to reset your password for your Rubizz Hotel Inn account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Rubizz Hotel Inn. All rights reserved.</p>
            <p>This email was sent to ${customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return await this.sendEmail({
            to: customerEmail,
            subject,
            html,
        });
    }
    async sendBookingConfirmationEmail(customerEmail, customerName, bookingDetails) {
        const subject = 'Booking Confirmation - Rubizz Hotel Inn';
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #cb9c03; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .booking-details { background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; }
          .detail-value { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>Your booking has been successfully confirmed. Here are the details:</p>
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Booking Type:</span>
                <span class="detail-value">${bookingDetails.type}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reference Number:</span>
                <span class="detail-value">${bookingDetails.reference}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${bookingDetails.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">$${bookingDetails.amount}</span>
              </div>
            </div>
            <p>Thank you for choosing Rubizz Hotel Inn. We look forward to serving you!</p>
          </div>
          <div class="footer">
            <p>© 2024 Rubizz Hotel Inn. All rights reserved.</p>
            <p>This email was sent to ${customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return await this.sendEmail({
            to: customerEmail,
            subject,
            html,
        });
    }
    async sendOrderConfirmationEmail(customerEmail, customerName, orderDetails) {
        const subject = 'Order Confirmation - Rubizz Hotel Inn';
        const itemsHtml = orderDetails.items.map(item => `
      <div class="detail-row">
        <span class="detail-label">${item.name} x${item.quantity}</span>
        <span class="detail-value">$${item.price * item.quantity}</span>
      </div>
    `).join('');
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #cb9c03; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .order-details { background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; }
          .detail-value { color: #666; }
          .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #cb9c03; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>Your order has been successfully placed. Here are the details:</p>
            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">Order Number:</span>
                <span class="detail-value">${orderDetails.orderNumber}</span>
              </div>
              ${orderDetails.deliveryAddress ? `
                <div class="detail-row">
                  <span class="detail-label">Delivery Address:</span>
                  <span class="detail-value">${orderDetails.deliveryAddress}</span>
                </div>
              ` : ''}
              <h3>Order Items:</h3>
              ${itemsHtml}
              <div class="detail-row total-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value">$${orderDetails.total}</span>
              </div>
            </div>
            <p>Thank you for choosing Rubizz Hotel Inn. We'll prepare your order and notify you when it's ready!</p>
          </div>
          <div class="footer">
            <p>© 2024 Rubizz Hotel Inn. All rights reserved.</p>
            <p>This email was sent to ${customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return await this.sendEmail({
            to: customerEmail,
            subject,
            html,
        });
    }
    async sendNotificationEmail(customerEmail, customerName, notification) {
        const subject = `${notification.title} - Rubizz Hotel Inn`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #cb9c03; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .notification { background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${notification.title}</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <div class="notification">
              <p>${notification.message}</p>
            </div>
            <p>Thank you for being a valued customer of Rubizz Hotel Inn!</p>
          </div>
          <div class="footer">
            <p>© 2024 Rubizz Hotel Inn. All rights reserved.</p>
            <p>This email was sent to ${customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return await this.sendEmail({
            to: customerEmail,
            subject,
            html,
        });
    }
}
exports.EmailService = EmailService;
exports.default = EmailService;
//# sourceMappingURL=EmailService.js.map