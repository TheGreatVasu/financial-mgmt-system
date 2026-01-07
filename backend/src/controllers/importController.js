const { asyncHandler } = require('../middleware/errorHandler');
const { getDb } = require('../config/db');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Required column headers for the import file
 * These must match exactly (case-insensitive) in the uploaded file
 */
const REQUIRED_COLUMNS = [
  'Invoice Number',
  'Invoice Date',
  'Customer Name',
  'Customer Email',
  'Customer Phone',
  'Billing Address',
  'Shipping Address',
  'Product Name',
  'Product Description',
  'HSN/SAC Code',
  'Quantity',
  'Unit Price',
  'Discount',
  'Tax Percentage',
  'Tax Amount',
  'Total Amount',
  'Payment Status',
  'Payment Method',
  'Due Date',
  'Notes'
];

/**
 * Validates file format and column headers
 * @param {Array} headers - Array of header strings from the file
 * @returns {Object} - { valid: boolean, missing: Array, errors: Array }
 */
function validateHeaders(headers) {
  const errors = [];
  const missing = [];
  const normalizedHeaders = headers.map(h => h?.toString().trim() || '');
  const normalizedRequired = REQUIRED_COLUMNS.map(c => c.toLowerCase().trim());

  // Check for missing columns
  REQUIRED_COLUMNS.forEach(requiredCol => {
    const found = normalizedHeaders.some(h => 
      h.toLowerCase().trim() === requiredCol.toLowerCase().trim()
    );
    if (!found) {
      missing.push(requiredCol);
    }
  });

  if (missing.length > 0) {
    errors.push(`Missing required columns: ${missing.join(', ')}`);
  }

  return {
    valid: missing.length === 0,
    missing,
    errors
  };
}

/**
 * Parses Excel file (xlsx or xls)
 * @param {Buffer} fileBuffer - File buffer
 * @returns {Array} - Array of row objects
 */
async function parseExcelFile(fileBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  
  // Get the first worksheet
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excel file must contain at least one sheet');
  }

  // Extract headers from first row
  const headers = [];
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
    headers.push(cell.value?.toString().trim() || '');
  });

  // Validate headers
  const validation = validateHeaders(headers);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }

  // Parse data rows
  const rows = [];
  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);
    if (!row.getCell(1).value) break; // Empty row

    const rowData = {};
    headers.forEach((header, index) => {
      const cell = row.getCell(index + 1);
      let value = cell.value;

      // Handle date cells
      if (value instanceof Date) {
        value = value;
      } else if (typeof value === 'number' && 
                 (header.toLowerCase().includes('date') || header.toLowerCase().includes('due'))) {
        // Excel date serial number
        value = ExcelJS.DateTime.fromExcelSerialNumber(value);
      }

      rowData[header] = value;
    });
    rows.push(rowData);
  }

  return { headers, rows };
}

/**
 * Parses CSV file
 * @param {Buffer} fileBuffer - File buffer
 * @returns {Array} - Array of row objects
 */
function parseCSVFile(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('CSV file must contain data');
  }

  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (jsonData.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Extract headers from first row
  const headers = Object.keys(jsonData[0]).map(h => h.trim());

  // Validate headers
  const validation = validateHeaders(headers);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }

  // Convert to array format matching Excel parser
  const rows = jsonData.map(row => {
    const rowData = {};
    headers.forEach(header => {
      let value = row[header];
      
      // Handle date strings
      if (value && (header.toLowerCase().includes('date') || header.toLowerCase().includes('due'))) {
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
          value = dateValue;
        }
      }
      
      rowData[header] = value;
    });
    return rowData;
  });

  return { headers, rows };
}

/**
 * Gets column value from row data (case-insensitive)
 * @param {Object} rowData - Row data object
 * @param {String} columnName - Column name to find
 * @returns {*} - Column value
 */
function getColumnValue(rowData, columnName) {
  const normalizedColumn = columnName.toLowerCase().trim();
  for (const key in rowData) {
    if (key.toLowerCase().trim() === normalizedColumn) {
      return rowData[key];
    }
  }
  return null;
}

/**
 * Parses date value from various formats
 * @param {*} value - Date value (Date, number, string)
 * @returns {Date} - Parsed date
 */
function parseDate(value) {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    // Excel serial number
    return ExcelJS.DateTime.fromExcelSerialNumber(value);
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  throw new Error('Invalid date format');
}

/**
 * POST /api/import/excel
 * Import data from Excel or CSV file with single sheet format
 */
exports.importExcel = asyncHandler(async (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Validate file format
  const fileName = req.file.originalname.toLowerCase();
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
  const isCSV = fileName.endsWith('.csv');

  if (!isExcel && !isCSV) {
    return res.status(400).json({
      success: false,
      message: 'Unsupported file format. Only .xlsx, .xls, and .csv files are allowed'
    });
  }

  let headers, rows;

  try {
    // Parse file based on format
    if (isCSV) {
      ({ headers, rows } = parseCSVFile(req.file.buffer));
    } else {
      ({ headers, rows } = await parseExcelFile(req.file.buffer));
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `File validation failed: ${error.message}`,
      error: error.message
    });
  }

  // Import data
  const customerMap = new Map(); // customer_email -> customer_id
  const invoiceMap = new Map(); // invoice_number -> invoice_id
  let importedCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const rowData = rows[rowIndex];
    const rowNum = rowIndex + 2; // +2 because row 1 is headers

    try {
      // Extract all column values
      const invoiceNumber = getColumnValue(rowData, 'Invoice Number')?.toString().trim();
      const invoiceDate = getColumnValue(rowData, 'Invoice Date');
      const customerName = getColumnValue(rowData, 'Customer Name')?.toString().trim();
      const customerEmail = getColumnValue(rowData, 'Customer Email')?.toString().trim();
      const customerPhone = getColumnValue(rowData, 'Customer Phone')?.toString().trim();
      const billingAddress = getColumnValue(rowData, 'Billing Address')?.toString().trim() || '';
      const shippingAddress = getColumnValue(rowData, 'Shipping Address')?.toString().trim() || '';
      const productName = getColumnValue(rowData, 'Product Name')?.toString().trim() || '';
      const productDescription = getColumnValue(rowData, 'Product Description')?.toString().trim() || '';
      const hsnSacCode = getColumnValue(rowData, 'HSN/SAC Code')?.toString().trim() || '';
      const quantity = parseFloat(getColumnValue(rowData, 'Quantity')) || 0;
      const unitPrice = parseFloat(getColumnValue(rowData, 'Unit Price')) || 0;
      const discount = parseFloat(getColumnValue(rowData, 'Discount')) || 0;
      const taxPercentage = parseFloat(getColumnValue(rowData, 'Tax Percentage')) || 0;
      const taxAmount = parseFloat(getColumnValue(rowData, 'Tax Amount')) || 0;
      const totalAmount = parseFloat(getColumnValue(rowData, 'Total Amount')) || 0;
      const paymentStatus = getColumnValue(rowData, 'Payment Status')?.toString().trim().toLowerCase() || 'pending';
      const paymentMethod = getColumnValue(rowData, 'Payment Method')?.toString().trim().toLowerCase() || 'other';
      const dueDate = getColumnValue(rowData, 'Due Date');
      const notes = getColumnValue(rowData, 'Notes')?.toString().trim() || '';

      // Validate required fields
      if (!invoiceNumber || !customerName || !customerEmail || !customerPhone) {
        errors.push(`Row ${rowNum}: Missing required fields (Invoice Number, Customer Name, Email, or Phone)`);
        errorCount++;
        continue;
      }

      if (!invoiceDate || !dueDate) {
        errors.push(`Row ${rowNum}: Missing required date fields`);
        errorCount++;
        continue;
      }

      // Parse dates
      let parsedInvoiceDate, parsedDueDate;
      try {
        parsedInvoiceDate = parseDate(invoiceDate);
        parsedDueDate = parseDate(dueDate);
      } catch (error) {
        errors.push(`Row ${rowNum}: Invalid date format - ${error.message}`);
        errorCount++;
        continue;
      }

      // Get or create customer
      let customerId = customerMap.get(customerEmail);
      if (!customerId) {
        // Check if customer exists
        const existingCustomer = await db('customers')
          .where({ contact_email: customerEmail })
          .first();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // Create new customer
          // Generate customer code from name
          const customerCode = `CUST${Date.now()}${Math.floor(Math.random() * 1000)}`;
          
          [customerId] = await db('customers').insert({
            customer_code: customerCode,
            company_name: customerName,
            contact_email: customerEmail,
            contact_phone: customerPhone,
            status: 'active',
            created_by: req.user?.id || null,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
        customerMap.set(customerEmail, customerId);
      }

      // Check if invoice already exists
      const existingInvoice = await db('invoices')
        .where({ invoice_number: invoiceNumber })
        .first();

      if (existingInvoice) {
        errors.push(`Row ${rowNum}: Invoice "${invoiceNumber}" already exists`);
        errorCount++;
        continue;
      }

      // Validate payment status
      const validStatuses = ['draft', 'sent', 'paid', 'pending', 'overdue', 'cancelled'];
      const invoiceStatus = validStatuses.includes(paymentStatus) ? paymentStatus : 'draft';

      // Validate payment method
      const validMethods = ['cash', 'check', 'bank_transfer', 'credit_card', 'upi', 'other'];
      const method = validMethods.includes(paymentMethod) ? paymentMethod : 'other';

      // Calculate amounts if not provided
      const calculatedSubtotal = (quantity * unitPrice) - discount;
      const calculatedTaxAmount = calculatedSubtotal * (taxPercentage / 100);
      const calculatedTotal = calculatedSubtotal + calculatedTaxAmount;

      // Use provided values or calculated values
      const finalSubtotal = totalAmount > 0 ? (totalAmount - taxAmount) : calculatedSubtotal;
      const finalTaxAmount = taxAmount > 0 ? taxAmount : calculatedTaxAmount;
      const finalTotal = totalAmount > 0 ? totalAmount : calculatedTotal;

      // Create invoice items array
      const invoiceItems = [{
        name: productName,
        description: productDescription,
        hsn_sac_code: hsnSacCode,
        quantity: quantity,
        unit_price: unitPrice,
        discount: discount,
        tax_rate: taxPercentage,
        tax_amount: finalTaxAmount,
        total: finalTotal
      }];

      // Insert invoice
      const [invoiceId] = await db('invoices').insert({
        invoice_number: invoiceNumber,
        customer_id: customerId,
        issue_date: parsedInvoiceDate,
        due_date: parsedDueDate,
        subtotal: finalSubtotal,
        tax_rate: taxPercentage,
        tax_amount: finalTaxAmount,
        total_amount: finalTotal,
        paid_amount: 0,
        status: invoiceStatus,
        items: JSON.stringify(invoiceItems),
        notes: notes,
        created_by: req.user?.id || null,
        created_at: new Date(),
        updated_at: new Date()
      });

      invoiceMap.set(invoiceNumber, invoiceId);
      importedCount++;

    } catch (error) {
      errors.push(`Row ${rowNum}: ${error.message}`);
      errorCount++;
    }
  }

  // Broadcast update via Socket.io
  const { getIOInstance, broadcastDashboardUpdate } = require('../services/socketService');
  const io = getIOInstance();
  if (io) {
    await broadcastDashboardUpdate();
  }

  // Clean up uploaded file if it was saved to disk
  if (req.file.path && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }

  res.json({
    success: true,
    message: `Import completed: ${importedCount} records imported, ${errorCount} errors`,
    data: {
      imported: importedCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 20) // Limit error details
    }
  });
});

/**
 * GET /api/import/template
 * Download Excel template file
 */
exports.downloadTemplate = asyncHandler(async (req, res) => {
  const templatePath = path.join(__dirname, '../../templates/import_format.xlsx');
  
  if (!fs.existsSync(templatePath)) {
    // Generate template if it doesn't exist
    const { execSync } = require('child_process');
    try {
      execSync('node scripts/create-import-template.js', {
        cwd: path.join(__dirname, '../../'),
        stdio: 'inherit'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate template file'
      });
    }
  }

  if (!fs.existsSync(templatePath)) {
    return res.status(404).json({
      success: false,
      message: 'Template file not found'
    });
  }

  res.download(templatePath, 'import_format.xlsx', (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to download template'
      });
    }
  });
});
