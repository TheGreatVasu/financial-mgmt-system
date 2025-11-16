const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Creates an Excel import template with a single sheet containing all required columns
 * for invoice import. The template includes sample data to guide users.
 */
async function createImportTemplate() {
  const workbook = new ExcelJS.Workbook();

  // Create a single sheet for invoice data
  const invoiceSheet = workbook.addWorksheet('Invoice Data');

  // Define all required columns in the exact order specified
  const columns = [
    { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
    { header: 'Invoice Date', key: 'invoiceDate', width: 15 },
    { header: 'Customer Name', key: 'customerName', width: 30 },
    { header: 'Customer Email', key: 'customerEmail', width: 30 },
    { header: 'Customer Phone', key: 'customerPhone', width: 20 },
    { header: 'Billing Address', key: 'billingAddress', width: 40 },
    { header: 'Shipping Address', key: 'shippingAddress', width: 40 },
    { header: 'Product Name', key: 'productName', width: 30 },
    { header: 'Product Description', key: 'productDescription', width: 40 },
    { header: 'HSN/SAC Code', key: 'hsnSacCode', width: 15 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Unit Price', key: 'unitPrice', width: 15 },
    { header: 'Discount', key: 'discount', width: 12 },
    { header: 'Tax Percentage', key: 'taxPercentage', width: 15 },
    { header: 'Tax Amount', key: 'taxAmount', width: 15 },
    { header: 'Total Amount', key: 'totalAmount', width: 15 },
    { header: 'Payment Status', key: 'paymentStatus', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 20 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 }
  ];

  invoiceSheet.columns = columns;

  // Add sample data rows to guide users
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);

  // Sample row 1
  invoiceSheet.addRow({
    invoiceNumber: 'INV-2025-001',
    invoiceDate: today,
    customerName: 'Acme Corporation',
    customerEmail: 'contact@acme.com',
    customerPhone: '+91-9876543210',
    billingAddress: '123 Business Street, City, State 12345',
    shippingAddress: '123 Business Street, City, State 12345',
    productName: 'Software License',
    productDescription: 'Annual software license subscription',
    hsnSacCode: '998314',
    quantity: 1,
    unitPrice: 50000,
    discount: 0,
    taxPercentage: 18,
    taxAmount: 9000,
    totalAmount: 59000,
    paymentStatus: 'pending',
    paymentMethod: 'bank_transfer',
    dueDate: dueDate,
    notes: 'Payment due within 30 days'
  });

  // Sample row 2
  const dueDate2 = new Date(today);
  dueDate2.setDate(dueDate2.getDate() + 45);
  invoiceSheet.addRow({
    invoiceNumber: 'INV-2025-002',
    invoiceDate: today,
    customerName: 'Tech Solutions Ltd',
    customerEmail: 'info@techsolutions.com',
    customerPhone: '+91-9876543211',
    billingAddress: '456 Tech Park, City, State 12346',
    shippingAddress: '456 Tech Park, City, State 12346',
    productName: 'Consulting Services',
    productDescription: 'Monthly consulting and support services',
    hsnSacCode: '998315',
    quantity: 1,
    unitPrice: 75000,
    discount: 5000,
    taxPercentage: 18,
    taxAmount: 12600,
    totalAmount: 82600,
    paymentStatus: 'sent',
    paymentMethod: 'upi',
    dueDate: dueDate2,
    notes: 'Net 45 payment terms'
  });

  // Style header row - make it bold and add background color
  const headerRow = invoiceSheet.getRow(1);
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Format date columns
  invoiceSheet.getColumn('invoiceDate').numFmt = 'mm/dd/yyyy';
  invoiceSheet.getColumn('dueDate').numFmt = 'mm/dd/yyyy';

  // Format numeric columns
  invoiceSheet.getColumn('quantity').numFmt = '#,##0';
  invoiceSheet.getColumn('unitPrice').numFmt = '#,##0.00';
  invoiceSheet.getColumn('discount').numFmt = '#,##0.00';
  invoiceSheet.getColumn('taxPercentage').numFmt = '0.00';
  invoiceSheet.getColumn('taxAmount').numFmt = '#,##0.00';
  invoiceSheet.getColumn('totalAmount').numFmt = '#,##0.00';

  // Freeze header row for better navigation
  invoiceSheet.views = [
    { state: 'frozen', ySplit: 1 }
  ];

  // Save the workbook
  const templatesDir = path.join(__dirname, '../templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  const filePath = path.join(templatesDir, 'import_format.xlsx');
  await workbook.xlsx.writeFile(filePath);

  // Also copy to frontend public directory for static serving
  const frontendPublicDir = path.join(__dirname, '../../frontend/public/sample-files');
  if (!fs.existsSync(frontendPublicDir)) {
    fs.mkdirSync(frontendPublicDir, { recursive: true });
  }
  
  const publicFilePath = path.join(frontendPublicDir, 'import-template.xlsx');
  fs.copyFileSync(filePath, publicFilePath);

  console.log('✅ Excel template created successfully at:', filePath);
  console.log('✅ Template also copied to frontend public directory:', publicFilePath);
  console.log('\nTemplate includes:');
  console.log('  - Single sheet with all required columns');
  console.log('  - 2 sample data rows');
  console.log('  - Formatted headers and date/number columns');
  console.log('\nRequired columns:');
  columns.forEach((col, index) => {
    console.log(`  ${index + 1}. ${col.header}`);
  });
}

createImportTemplate().catch(console.error);
