const nodemailer = require('nodemailer');

/**
 * EmailService - Handles all email communications
 */
class EmailService {
  constructor(config) {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password
      }
    });
    this.fromEmail = config.fromEmail;
  }

  /**
   * Send voucher codes to customer
   */
  async sendVoucherCodes(toEmail, productName, codes) {
    const codesList = codes.map((code, index) => `${index + 1}. ${code}`).join('\n');

    const mailOptions = {
      from: this.fromEmail,
      to: toEmail,
      subject: `Your PakGifts Voucher Codes - ${productName}`,
      html: `
        <h2>Your Voucher Codes</h2>
        <p>Thank you for your purchase! Here are your voucher codes for <strong>${productName}</strong>:</p>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
${codesList}
        </pre>
        <p>Please save these codes securely. For any issues, contact our support team.</p>
        <p>Best regards,<br>PakGifts Team</p>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(toEmail, orderNumber, totalAmount) {
    const mailOptions = {
      from: this.fromEmail,
      to: toEmail,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <h2>Order Confirmed</h2>
        <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <p>Total Amount: PKR ${totalAmount}</p>
        <p>We will notify you once your items are delivered.</p>
        <p>Best regards,<br>PakGifts Team</p>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send payment verification email
   */
  async sendPaymentVerified(toEmail, orderNumber) {
    const mailOptions = {
      from: this.fromEmail,
      to: toEmail,
      subject: `Payment Verified - ${orderNumber}`,
      html: `
        <h2>Payment Verified</h2>
        <p>Your payment for order <strong>${orderNumber}</strong> has been verified.</p>
        <p>Your order is now being processed.</p>
        <p>Best regards,<br>PakGifts Team</p>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;
