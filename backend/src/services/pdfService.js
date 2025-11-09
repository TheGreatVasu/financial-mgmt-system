const PDFDocument = require('pdfkit');

// PDF service placeholder
class PDFService {
  constructor() {
    this.doc = null;
  }

  createInvoicePDF(invoiceData) {
    this.doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Header
    this.doc.fontSize(24).text('INVOICE', 50, 50);
    this.doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, 50, 80);
    
    let yPosition = 120;
    
    // Invoice Information - handle both camelCase and snake_case field names
    const invoiceNumber = invoiceData.invoiceNumber || invoiceData.invoice_number || 'N/A';
    const issueDate = invoiceData.issueDate || invoiceData.issue_date;
    const dueDate = invoiceData.dueDate || invoiceData.due_date;
    const status = invoiceData.status || 'draft';
    
    this.doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`, 50, yPosition);
    yPosition += 20;
    this.doc.text(`Issue Date: ${issueDate ? new Date(issueDate).toLocaleDateString('en-IN') : 'N/A'}`, 50, yPosition);
    yPosition += 20;
    this.doc.text(`Due Date: ${dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : 'N/A'}`, 50, yPosition);
    yPosition += 20;
    this.doc.text(`Status: ${status}`, 50, yPosition);
    yPosition += 30;
    
    // Customer info - handle both camelCase and snake_case
    const customerName = invoiceData.customer_name || invoiceData.customer?.companyName || invoiceData.customer?.company_name || 'N/A';
    this.doc.fontSize(12).text('Bill To:', 50, yPosition);
    yPosition += 20;
    this.doc.fontSize(11).text(customerName, 50, yPosition);
    yPosition += 30;
    
    // Items table header
    this.doc.fontSize(11).font('Helvetica-Bold');
    this.doc.text('Description', 50, yPosition);
    this.doc.text('Qty', 350, yPosition);
    this.doc.text('Unit Price', 400, yPosition);
    this.doc.text('Total', 480, yPosition);
    yPosition += 20;
    
    // Draw line
    this.doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;
    
    // Items - parse if string, use array if already parsed
    let items = [];
    if (invoiceData.items) {
      if (typeof invoiceData.items === 'string') {
        try {
          items = JSON.parse(invoiceData.items);
        } catch (e) {
          items = [];
        }
      } else if (Array.isArray(invoiceData.items)) {
        items = invoiceData.items;
      }
    }
    
    // Items
    this.doc.font('Helvetica').fontSize(10);
    items.forEach(item => {
      if (yPosition > 700) {
        this.doc.addPage();
        yPosition = 50;
      }
      
      const description = item.description || 'N/A';
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      // Use stored total if available, otherwise calculate
      const total = Number(item.total !== undefined ? item.total : (quantity * unitPrice));
      
      // Wrap description if too long
      const descLines = this.doc.heightOfString(description, { width: 280 });
      this.doc.text(description, 50, yPosition, { width: 280 });
      this.doc.text(quantity.toString(), 350, yPosition);
      this.doc.text(`₹${unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 400, yPosition);
      this.doc.text(`₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 480, yPosition);
      yPosition += Math.max(20, descLines + 5);
    });
    
    yPosition += 20;
    
    // Totals - use stored values from database, matching frontend calculation
    // Handle both camelCase and snake_case field names
    const subtotal = invoiceData.subtotal !== undefined ? Number(invoiceData.subtotal) : 
                     (items.reduce((sum, item) => {
                       const itemTotal = Number(item.total !== undefined ? item.total : (Number(item.quantity || 0) * Number(item.unitPrice || 0)));
                       return sum + itemTotal;
                     }, 0));
    
    const taxRate = Number(invoiceData.taxRate !== undefined ? invoiceData.taxRate : 
                          (invoiceData.tax_rate !== undefined ? invoiceData.tax_rate : 0));
    
    // Use stored tax amount if available, otherwise calculate (matching frontend logic)
    const taxAmount = invoiceData.taxAmount !== undefined ? Number(invoiceData.taxAmount) :
                      (invoiceData.tax_amount !== undefined ? Number(invoiceData.tax_amount) :
                       Math.round((subtotal * taxRate) / 100 * 100) / 100);
    
    // Use stored total amount if available, otherwise calculate (matching frontend logic)
    const totalAmount = invoiceData.totalAmount !== undefined ? Number(invoiceData.totalAmount) :
                        (invoiceData.total_amount !== undefined ? Number(invoiceData.total_amount) :
                         Math.round((subtotal + taxAmount) * 100) / 100);
    
    const paidAmount = Number(invoiceData.paidAmount !== undefined ? invoiceData.paidAmount :
                              (invoiceData.paid_amount !== undefined ? invoiceData.paid_amount : 0));
    
    const outstandingAmount = Math.round((totalAmount - paidAmount) * 100) / 100;
    
    this.doc.fontSize(11);
    this.doc.text(`Subtotal:`, 400, yPosition);
    this.doc.text(`₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 480, yPosition);
    yPosition += 20;
    
    this.doc.text(`Tax (${taxRate}%):`, 400, yPosition);
    this.doc.text(`₹${taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 480, yPosition);
    yPosition += 20;
    
    this.doc.font('Helvetica-Bold').fontSize(12);
    this.doc.text(`Total Amount:`, 400, yPosition);
    this.doc.text(`₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 480, yPosition);
    yPosition += 20;
    
    this.doc.font('Helvetica').fontSize(11);
    this.doc.text(`Paid Amount:`, 400, yPosition);
    this.doc.text(`₹${paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 480, yPosition);
    yPosition += 20;
    
    this.doc.font('Helvetica-Bold').fontSize(11);
    this.doc.text(`Outstanding:`, 400, yPosition);
    this.doc.text(`₹${outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 480, yPosition);
    
    // Notes - handle both camelCase and snake_case
    const notes = invoiceData.notes || null;
    if (notes) {
      yPosition += 30;
      this.doc.font('Helvetica').fontSize(10);
      this.doc.text('Notes:', 50, yPosition);
      yPosition += 15;
      this.doc.text(notes, 50, yPosition, { width: 500 });
    }
    
    // Footer
    this.doc.fontSize(8).text('This invoice was generated automatically by the Financial Management System', 50, this.doc.page.height - 50);
    
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

  createDashboardPDF(dashboardData) {
    this.doc = new PDFDocument({ margin: 50 });
    
    // Header
    this.doc.fontSize(24).text('Receivables Dashboard Report', 50, 50);
    this.doc.fontSize(10).text(`Generated: ${new Date(dashboardData.generatedAt || Date.now()).toLocaleString()}`, 50, 80);
    
    let yPosition = 120;

    // KPIs Section
    this.doc.fontSize(16).text('Key Performance Indicators', 50, yPosition);
    yPosition += 30;
    
    const kpis = dashboardData.kpis || {};
    this.doc.fontSize(11).text(`Outstanding Balance: ₹${(kpis.outstanding || 0).toLocaleString('en-IN')}`, 50, yPosition);
    yPosition += 20;
    this.doc.text(`Overdue Invoices: ${kpis.overdue || 0}`, 50, yPosition);
    yPosition += 20;
    this.doc.text(`Days Sales Outstanding (DSO): ${kpis.dso || 0} days`, 50, yPosition);
    yPosition += 20;
    this.doc.text(`Collection Efficiency Index (CEI): ${kpis.cei || 0}%`, 50, yPosition);
    yPosition += 40;

    // Aging Analysis
    if (dashboardData.agingAnalysis && dashboardData.agingAnalysis.length > 0) {
      this.doc.fontSize(16).text('Aging Analysis of AR Balance', 50, yPosition);
      yPosition += 30;
      
      dashboardData.agingAnalysis.forEach(item => {
        this.doc.fontSize(11).text(`${item.period} days: ₹${(item.amount || 0).toLocaleString('en-IN')} (${item.count || 0} invoices)`, 50, yPosition);
        yPosition += 20;
      });
      yPosition += 20;
    }

    // Regional Breakup
    if (dashboardData.regionalBreakup && dashboardData.regionalBreakup.length > 0) {
      this.doc.fontSize(16).text('Regional Breakup', 50, yPosition);
      yPosition += 30;
      
      dashboardData.regionalBreakup.forEach(item => {
        this.doc.fontSize(11).text(`${item.region}: ₹${(item.overdue || 0).toLocaleString('en-IN')} overdue`, 50, yPosition);
        yPosition += 20;
      });
      yPosition += 20;
    }

    // Top Customers
    if (dashboardData.topCustomersOverdue && dashboardData.topCustomersOverdue.length > 0) {
      this.doc.fontSize(16).text('Top Customers by Overdue Amount', 50, yPosition);
      yPosition += 30;
      
      dashboardData.topCustomersOverdue.slice(0, 10).forEach((item, index) => {
        this.doc.fontSize(11).text(`${index + 1}. ${item.customer}: ₹${(item.overdue || 0).toLocaleString('en-IN')}`, 50, yPosition);
        yPosition += 20;
      });
    }

    // Footer
    this.doc.fontSize(8).text('This report was generated automatically by the Financial Management System', 50, this.doc.page.height - 50);
    
    return this.doc;
  }
}

module.exports = new PDFService();
