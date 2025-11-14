const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { generateInvoiceNumber } = require('../utils/generateInvoiceNumber');

// POST /api/import/excel
// Import data from Excel file with Customers, Invoices, and Payments sheets
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

  const workbook = new ExcelJS.Workbook();
  let fileBuffer;

  try {
    // Read file buffer
    if (req.file.buffer) {
      fileBuffer = req.file.buffer;
    } else {
      fileBuffer = fs.readFileSync(req.file.path);
    }

    await workbook.xlsx.load(fileBuffer);

    // Validate required sheets exist
    const requiredSheets = ['Customers', 'Invoices', 'Payments'];
    const sheetNames = workbook.worksheets.map(ws => ws.name);
    const missingSheets = requiredSheets.filter(sheet => !sheetNames.includes(sheet));

    if (missingSheets.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required sheets: ${missingSheets.join(', ')}`,
        requiredSheets
      });
    }

    const customersSheet = workbook.getWorksheet('Customers');
    const invoicesSheet = workbook.getWorksheet('Invoices');
    const paymentsSheet = workbook.getWorksheet('Payments');

    // Validate column headers
    const validateHeaders = (sheet, requiredHeaders) => {
      const headers = [];
      sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
        headers.push(cell.value?.toString().trim().toLowerCase());
      });
      
      const missing = requiredHeaders.filter(h => !headers.includes(h.toLowerCase()));
      if (missing.length > 0) {
        throw new Error(`Missing columns in ${sheet.name} sheet: ${missing.join(', ')}`);
      }
      return headers;
    };

    // Validate Customers sheet
    const customerHeaders = validateHeaders(customersSheet, [
      'Customer Code', 'Company Name', 'Contact Email', 'Contact Phone'
    ]);

    // Validate Invoices sheet
    const invoiceHeaders = validateHeaders(invoicesSheet, [
      'Invoice Number', 'Customer Code', 'Amount', 'Issue Date', 'Due Date', 'Status'
    ]);

    // Validate Payments sheet
    const paymentHeaders = validateHeaders(paymentsSheet, [
      'Payment Code', 'Invoice Number', 'Amount', 'Payment Date', 'Payment Method'
    ]);

    // Parse and import Customers
    const customerMap = new Map(); // customer_code -> customer_id
    let customerCount = 0;
    let customerErrors = [];

    for (let rowNum = 2; rowNum <= customersSheet.rowCount; rowNum++) {
      const row = customersSheet.getRow(rowNum);
      if (!row.getCell(1).value) break; // Empty row

      try {
        const customerCode = row.getCell(customerHeaders.indexOf('customer code') + 1).value?.toString().trim();
        const companyName = row.getCell(customerHeaders.indexOf('company name') + 1).value?.toString().trim();
        const contactEmail = row.getCell(customerHeaders.indexOf('contact email') + 1).value?.toString().trim();
        const contactPhone = row.getCell(customerHeaders.indexOf('contact phone') + 1).value?.toString().trim();

        if (!customerCode || !companyName || !contactEmail || !contactPhone) {
          customerErrors.push(`Row ${rowNum}: Missing required fields`);
          continue;
        }

        // Check if customer already exists
        const existing = await db('customers')
          .where({ customer_code: customerCode })
          .first();

        if (existing) {
          customerMap.set(customerCode, existing.id);
          continue;
        }

        // Insert customer
        const [customerId] = await db('customers').insert({
          customer_code: customerCode,
          company_name: companyName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          status: 'active',
          created_by: req.user?.id || null,
          created_at: new Date(),
          updated_at: new Date()
        });

        customerMap.set(customerCode, customerId);
        customerCount++;
      } catch (error) {
        customerErrors.push(`Row ${rowNum}: ${error.message}`);
      }
    }

    // Parse and import Invoices
    const invoiceMap = new Map(); // invoice_number -> invoice_id
    let invoiceCount = 0;
    let invoiceErrors = [];

    for (let rowNum = 2; rowNum <= invoicesSheet.rowCount; rowNum++) {
      const row = invoicesSheet.getRow(rowNum);
      if (!row.getCell(1).value) break; // Empty row

      try {
        const invoiceNumber = row.getCell(invoiceHeaders.indexOf('invoice number') + 1).value?.toString().trim();
        const customerCode = row.getCell(invoiceHeaders.indexOf('customer code') + 1).value?.toString().trim();
        const amount = parseFloat(row.getCell(invoiceHeaders.indexOf('amount') + 1).value) || 0;
        const issueDate = row.getCell(invoiceHeaders.indexOf('issue date') + 1).value;
        const dueDate = row.getCell(invoiceHeaders.indexOf('due date') + 1).value;
        const status = row.getCell(invoiceHeaders.indexOf('status') + 1).value?.toString().trim().toLowerCase() || 'draft';

        if (!invoiceNumber || !customerCode || amount <= 0) {
          invoiceErrors.push(`Row ${rowNum}: Missing required fields or invalid amount`);
          continue;
        }

        const customerId = customerMap.get(customerCode);
        if (!customerId) {
          invoiceErrors.push(`Row ${rowNum}: Customer code "${customerCode}" not found`);
          continue;
        }

        // Check if invoice already exists
        const existing = await db('invoices')
          .where({ invoice_number: invoiceNumber })
          .first();

        if (existing) {
          invoiceMap.set(invoiceNumber, existing.id);
          continue;
        }

        // Parse dates
        let parsedIssueDate, parsedDueDate;
        if (issueDate instanceof Date) {
          parsedIssueDate = issueDate;
        } else if (typeof issueDate === 'number') {
          // Excel date serial number
          parsedIssueDate = ExcelJS.DateTime.fromExcelSerialNumber(issueDate);
        } else {
          parsedIssueDate = new Date(issueDate);
        }

        if (dueDate instanceof Date) {
          parsedDueDate = dueDate;
        } else if (typeof dueDate === 'number') {
          parsedDueDate = ExcelJS.DateTime.fromExcelSerialNumber(dueDate);
        } else {
          parsedDueDate = new Date(dueDate);
        }

        // Validate status
        const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
        const invoiceStatus = validStatuses.includes(status) ? status : 'draft';

        // Insert invoice
        const [invoiceId] = await db('invoices').insert({
          invoice_number: invoiceNumber,
          customer_id: customerId,
          issue_date: parsedIssueDate,
          due_date: parsedDueDate,
          subtotal: amount,
          tax_rate: 0,
          tax_amount: 0,
          total_amount: amount,
          paid_amount: 0,
          status: invoiceStatus,
          created_by: req.user?.id || null,
          created_at: new Date(),
          updated_at: new Date()
        });

        invoiceMap.set(invoiceNumber, invoiceId);
        invoiceCount++;
      } catch (error) {
        invoiceErrors.push(`Row ${rowNum}: ${error.message}`);
      }
    }

    // Parse and import Payments
    let paymentCount = 0;
    let paymentErrors = [];

    for (let rowNum = 2; rowNum <= paymentsSheet.rowCount; rowNum++) {
      const row = paymentsSheet.getRow(rowNum);
      if (!row.getCell(1).value) break; // Empty row

      try {
        const paymentCode = row.getCell(paymentHeaders.indexOf('payment code') + 1).value?.toString().trim();
        const invoiceNumber = row.getCell(paymentHeaders.indexOf('invoice number') + 1).value?.toString().trim();
        const amount = parseFloat(row.getCell(paymentHeaders.indexOf('amount') + 1).value) || 0;
        const paymentDate = row.getCell(paymentHeaders.indexOf('payment date') + 1).value;
        const paymentMethod = row.getCell(paymentHeaders.indexOf('payment method') + 1).value?.toString().trim().toLowerCase() || 'other';

        if (!paymentCode || !invoiceNumber || amount <= 0) {
          paymentErrors.push(`Row ${rowNum}: Missing required fields or invalid amount`);
          continue;
        }

        const invoiceId = invoiceMap.get(invoiceNumber);
        if (!invoiceId) {
          paymentErrors.push(`Row ${rowNum}: Invoice number "${invoiceNumber}" not found`);
          continue;
        }

        // Get customer_id from invoice
        const invoice = await db('invoices').where({ id: invoiceId }).first();
        if (!invoice) {
          paymentErrors.push(`Row ${rowNum}: Invoice not found`);
          continue;
        }

        // Check if payment already exists
        const existing = await db('payments')
          .where({ payment_code: paymentCode })
          .first();

        if (existing) {
          continue;
        }

        // Parse payment date
        let parsedPaymentDate;
        if (paymentDate instanceof Date) {
          parsedPaymentDate = paymentDate;
        } else if (typeof paymentDate === 'number') {
          parsedPaymentDate = ExcelJS.DateTime.fromExcelSerialNumber(paymentDate);
        } else {
          parsedPaymentDate = new Date(paymentDate);
        }

        // Validate payment method
        const validMethods = ['cash', 'check', 'bank_transfer', 'credit_card', 'upi', 'other'];
        const method = validMethods.includes(paymentMethod) ? paymentMethod : 'other';

        // Insert payment
        await db('payments').insert({
          payment_code: paymentCode,
          invoice_id: invoiceId,
          customer_id: invoice.customer_id,
          amount: amount,
          payment_date: parsedPaymentDate,
          method: method,
          reference: paymentCode,
          status: 'completed',
          processed_by: req.user?.id || null,
          created_at: new Date(),
          updated_at: new Date()
        });

        // Update invoice paid_amount
        await db('invoices')
          .where({ id: invoiceId })
          .increment('paid_amount', amount);

        // Update invoice status if fully paid
        const updatedInvoice = await db('invoices').where({ id: invoiceId }).first();
        if (updatedInvoice.paid_amount >= updatedInvoice.total_amount && updatedInvoice.status !== 'paid') {
          await db('invoices')
            .where({ id: invoiceId })
            .update({ status: 'paid' });
        }

        paymentCount++;
      } catch (error) {
        paymentErrors.push(`Row ${rowNum}: ${error.message}`);
      }
    }

    // Broadcast update via Socket.io
    const { getIOInstance, broadcastDashboardUpdate } = require('../services/socketService');
    const io = getIOInstance();
    if (io) {
      // Broadcast dashboard update to refresh all connected clients
      await broadcastDashboardUpdate();
    }

    // Clean up uploaded file if it was saved to disk
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      message: 'Import completed successfully',
      data: {
        customers: {
          imported: customerCount,
          errors: customerErrors.length,
          errorDetails: customerErrors.slice(0, 10) // Limit error details
        },
        invoices: {
          imported: invoiceCount,
          errors: invoiceErrors.length,
          errorDetails: invoiceErrors.slice(0, 10)
        },
        payments: {
          imported: paymentCount,
          errors: paymentErrors.length,
          errorDetails: paymentErrors.slice(0, 10)
        }
      }
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(400).json({
      success: false,
      message: 'Failed to process Excel file',
      error: error.message
    });
  }
});

// GET /api/import/template
// Download Excel template file
exports.downloadTemplate = asyncHandler(async (req, res) => {
  const templatePath = path.join(__dirname, '../../templates/import_format.xlsx');
  
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

