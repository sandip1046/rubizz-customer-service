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
export declare class EmailService {
    private transporter;
    private logger;
    constructor();
    private verifyConnection;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendWelcomeEmail(customerEmail: string, customerName: string): Promise<boolean>;
    sendVerificationEmail(customerEmail: string, customerName: string, verificationToken: string): Promise<boolean>;
    sendPasswordResetEmail(customerEmail: string, customerName: string, resetToken: string): Promise<boolean>;
    sendBookingConfirmationEmail(customerEmail: string, customerName: string, bookingDetails: {
        type: string;
        reference: string;
        date: string;
        amount: number;
    }): Promise<boolean>;
    sendOrderConfirmationEmail(customerEmail: string, customerName: string, orderDetails: {
        orderNumber: string;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
        total: number;
        deliveryAddress?: string;
    }): Promise<boolean>;
    sendNotificationEmail(customerEmail: string, customerName: string, notification: {
        title: string;
        message: string;
        type: string;
    }): Promise<boolean>;
}
export default EmailService;
//# sourceMappingURL=EmailService.d.ts.map