const ExcelJS = require('exceljs');

// Excel service placeholder
class ExcelService {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
  }

  createInvoiceExcel(invoices) {
    const worksheet = this.workbook.addWorksheet('Invoices');
    
    // Add headers
    worksheet.columns = [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 15 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Issue Date', key: 'issueDate', width: 12 },
      { header: 'Due Date', key: 'dueDate', width: 12 },
      { header: 'Amount', key: 'totalAmount', width: 12 },
      { header: 'Paid', key: 'paidAmount', width: 12 },
      { header: 'Outstanding', key: 'outstandingAmount', width: 12 },
      { header: 'Status', key: 'status', width: 10 }
    ];
    
    // Add data
    invoices.forEach(invoice => {
      worksheet.addRow({
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer.companyName,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        outstandingAmount: invoice.outstandingAmount,
        status: invoice.status
      });
    });
    
    return this.workbook;
  }

  createCustomerExcel(customers) {
    const worksheet = this.workbook.addWorksheet('Customers');
    
    worksheet.columns = [
      { header: 'Customer ID', key: 'customerId', width: 12 },
      { header: 'Company Name', key: 'companyName', width: 25 },
      { header: 'Contact Person', key: 'contactPerson', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Status', key: 'status', width: 10 }
    ];
    
    customers.forEach(customer => {
      worksheet.addRow({
        customerId: customer.customerId,
        companyName: customer.companyName,
        contactPerson: `${customer.contactPerson.firstName} ${customer.contactPerson.lastName}`,
        email: customer.contactPerson.email,
        phone: customer.contactPerson.phone,
        city: customer.address.city,
        status: customer.status
      });
    });
    
    return this.workbook;
  }

  createReportExcel(reportData) {
    const worksheet = this.workbook.addWorksheet('Report');
    
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 }
    ];
    
    Object.entries(reportData).forEach(([key, value]) => {
      worksheet.addRow({
        metric: key,
        value: value
      });
    });
    
    return this.workbook;
  }
}

module.exports = new ExcelService();
