const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function createImportTemplate() {
  const workbook = new ExcelJS.Workbook();

  // Create Customers sheet
  const customersSheet = workbook.addWorksheet('Customers');
  customersSheet.columns = [
    { header: 'Customer Code', key: 'customerCode', width: 20 },
    { header: 'Company Name', key: 'companyName', width: 30 },
    { header: 'Contact Email', key: 'contactEmail', width: 30 },
    { header: 'Contact Phone', key: 'contactPhone', width: 20 }
  ];

  // Add sample data row
  customersSheet.addRow({
    customerCode: 'CUST001',
    companyName: 'Example Company Ltd',
    contactEmail: 'contact@example.com',
    contactPhone: '+91-9876543210'
  });

  // Style header row
  customersSheet.getRow(1).font = { bold: true };
  customersSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Create Invoices sheet
  const invoicesSheet = workbook.addWorksheet('Invoices');
  invoicesSheet.columns = [
    { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
    { header: 'Customer Code', key: 'customerCode', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Issue Date', key: 'issueDate', width: 15 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  // Add sample data row
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);

  invoicesSheet.addRow({
    invoiceNumber: 'INV20250001',
    customerCode: 'CUST001',
    amount: 50000,
    issueDate: today,
    dueDate: dueDate,
    status: 'sent'
  });

  // Style header row
  invoicesSheet.getRow(1).font = { bold: true };
  invoicesSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Format date columns
  invoicesSheet.getColumn('issueDate').numFmt = 'mm/dd/yyyy';
  invoicesSheet.getColumn('dueDate').numFmt = 'mm/dd/yyyy';

  // Create Payments sheet
  const paymentsSheet = workbook.addWorksheet('Payments');
  paymentsSheet.columns = [
    { header: 'Payment Code', key: 'paymentCode', width: 20 },
    { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Payment Date', key: 'paymentDate', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 20 }
  ];

  // Add sample data row
  paymentsSheet.addRow({
    paymentCode: 'PAY001',
    invoiceNumber: 'INV20250001',
    amount: 50000,
    paymentDate: today,
    paymentMethod: 'bank_transfer'
  });

  // Style header row
  paymentsSheet.getRow(1).font = { bold: true };
  paymentsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Format date column
  paymentsSheet.getColumn('paymentDate').numFmt = 'mm/dd/yyyy';

  // Save the workbook
  const templatesDir = path.join(__dirname, '../templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  const filePath = path.join(templatesDir, 'import_format.xlsx');
  await workbook.xlsx.writeFile(filePath);

  console.log('✅ Excel template created successfully at:', filePath);
  console.log('\nTemplate includes:');
  console.log('  - Customers sheet with columns: Customer Code, Company Name, Contact Email, Contact Phone');
  console.log('  - Invoices sheet with columns: Invoice Number, Customer Code, Amount, Issue Date, Due Date, Status');
  console.log('  - Payments sheet with columns: Payment Code, Invoice Number, Amount, Payment Date, Payment Method');
}

createImportTemplate().catch(console.error);

