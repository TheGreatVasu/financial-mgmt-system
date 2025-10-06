const nodemailer = require('nodemailer');
const config = require('../config/cloudConfig');

// Email service placeholder
class EmailService {
  constructor() {
    // Disabled external SMTP; stub transporter
    this.transporter = null;
  }

  async sendEmail(to, subject, text, html) {
    // Offline stub: pretend success
    return { success: true, messageId: 'stubbed-message-id' };
  }

  async sendInvoiceEmail(customerEmail, invoiceData) {
    const subject = `Invoice ${invoiceData.invoiceNumber} - Payment Due`;
    const text = `Dear Customer,\n\nYour invoice ${invoiceData.invoiceNumber} is due for payment.\nAmount: $${invoiceData.totalAmount}\nDue Date: ${invoiceData.dueDate}\n\nThank you for your business.`;
    
    return await this.sendEmail(customerEmail, subject, text);
  }

  async sendPaymentConfirmation(customerEmail, paymentData) {
    const subject = `Payment Confirmation - ${paymentData.paymentId}`;
    const text = `Dear Customer,\n\nWe have received your payment of $${paymentData.amount}.\nPayment ID: ${paymentData.paymentId}\nDate: ${paymentData.paymentDate}\n\nThank you for your payment.`;
    
    return await this.sendEmail(customerEmail, subject, text);
  }
}

module.exports = new EmailService();
