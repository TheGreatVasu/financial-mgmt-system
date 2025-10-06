const PDFDocument = require('pdfkit');

// PDF service placeholder
class PDFService {
  constructor() {
    this.doc = null;
  }

  createInvoicePDF(invoiceData) {
    this.doc = new PDFDocument();
    
    // Add content to PDF
    this.doc.fontSize(20).text('INVOICE', 50, 50);
    this.doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoiceNumber}`, 50, 100);
    this.doc.text(`Date: ${invoiceData.issueDate}`, 50, 120);
    this.doc.text(`Due Date: ${invoiceData.dueDate}`, 50, 140);
    
    // Customer info
    this.doc.text(`Bill To:`, 50, 180);
    this.doc.text(`${invoiceData.customer.companyName}`, 50, 200);
    this.doc.text(`${invoiceData.customer.address.street}`, 50, 220);
    this.doc.text(`${invoiceData.customer.address.city}, ${invoiceData.customer.address.state} ${invoiceData.customer.address.zipCode}`, 50, 240);
    
    // Items table
    this.doc.text('Description', 50, 300);
    this.doc.text('Qty', 300, 300);
    this.doc.text('Price', 350, 300);
    this.doc.text('Total', 450, 300);
    
    let yPosition = 320;
    invoiceData.items.forEach(item => {
      this.doc.text(item.description, 50, yPosition);
      this.doc.text(item.quantity.toString(), 300, yPosition);
      this.doc.text(`$${item.unitPrice}`, 350, yPosition);
      this.doc.text(`$${item.total}`, 450, yPosition);
      yPosition += 20;
    });
    
    // Totals
    this.doc.text(`Subtotal: $${invoiceData.subtotal}`, 350, yPosition + 20);
    this.doc.text(`Tax: $${invoiceData.taxAmount}`, 350, yPosition + 40);
    this.doc.text(`Total: $${invoiceData.totalAmount}`, 350, yPosition + 60);
    
    return this.doc;
  }

  createReportPDF(reportData) {
    this.doc = new PDFDocument();
    
    this.doc.fontSize(20).text('FINANCIAL REPORT', 50, 50);
    this.doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 100);
    
    // Add report content based on type
    if (reportData.type === 'dso') {
      this.doc.text(`Days Sales Outstanding: ${reportData.dso} days`, 50, 150);
      this.doc.text(`Total Outstanding: $${reportData.totalOutstanding}`, 50, 170);
    }
    
    return this.doc;
  }
}

module.exports = new PDFService();
