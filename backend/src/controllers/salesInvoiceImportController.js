const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Expected column headers from Sales_Invoice_Import_Format.xlsx (93 columns)
 */
const EXPECTED_COLUMNS = [
  'Key ID', 'GST Tax Invoice No', 'GST Tax Invoice Date', 'Internal Invoice No', 'Invoice Type',
  'Business Unit', 'Customer Name', 'Segment', 'Region', 'Zone',
  'Sales Order No', 'Account Manager Name', 'PO No / Reference', 'PO Date', 'Bill to Party',
  'Material Description', 'State of Supply', 'Qty', 'Unit', 'Currency',
  'Basic Rate', 'Basic Value', 'Freight Invoice No', 'Freight Rate', 'Freight Value',
  'SGST Output', 'CGST Output', 'IGST Output', 'UGST Output', 'TCS',
  'SubTotal', 'Total Invoice Value', 'Consignee Name & Address', 'Consignee City', 'Payer Name & Address',
  'City', 'LR No', 'LR Date', 'Delivery Challan No', 'Delivery Challan Date',
  'Inspection Offer Date', 'Inspection Date', 'Delivery Instruction Date', 'Last Date of Dispatch',
  'Last Date of Material Receipt', 'Invoice Ready Date', 'Courier Document No', 'Courier Document Date',
  'Courier Name', 'Invoice Receipt Date', 'Payment Text', 'Payment Terms',
  '1st Due Date', '1st Due Amount', 'Payment Received Amount (1st Due)', 'Receipt Date (1st Due)',
  '1st Due Balance', 'Not Due (1st Due)', 'Over Due (1st Due)', 'No of Days of Payment Receipt (1st Due)',
  '2nd Due Date', '2nd Due Amount', 'Payment Received Amount (2nd Due)', 'Receipt Date (2nd Due)',
  '2nd Due Balance', 'Not Due (2nd Due)', 'Over Due (2nd Due)', 'No of Days of Payment Receipt (2nd Due)',
  '3rd Due Date', '3rd Due Amount', 'Payment Received Amount (3rd Due)', 'Receipt Date (3rd Due)',
  '3rd Due Balance', 'Not Due (3rd Due)', 'Over Due (3rd Due)', 'No of Days of Payment Receipt (3rd Due)',
  'Total Balance', 'Not Due Total', 'Over Due Total',
  'IT TDS @2% (on Service Part)', 'IT TDS @1% (u/s 194Q Supply)', 'LCess / BOQ @1% (Works)',
  'TDS @2% (CGST@1% SGST@1%)', 'TDS on CGST @1%', 'TDS on SGST @1%',
  'Excess Supply Qty', 'Interest on Advance', 'Any Hold', 'Penalty / LD Deduction',
  'Bank Charges', 'LC Discrepancy Charge', 'Provision for Bad Debts', 'Bad Debts'
];

/**
 * Validates file format and column headers
 */
function validateHeaders(headers) {
  const errors = [];
  const missing = [];
  const normalizedHeaders = headers.map(h => h?.toString().trim() || '');
  const normalizedExpected = EXPECTED_COLUMNS.map(c => c.toLowerCase().trim());

  // Check for missing columns (flexible - warn but don't fail)
  EXPECTED_COLUMNS.forEach(expectedCol => {
    const found = normalizedHeaders.some(h => 
      h.toLowerCase().trim() === expectedCol.toLowerCase().trim()
    );
    if (!found) {
      missing.push(expectedCol);
    }
  });

  if (missing.length > 0 && missing.length > EXPECTED_COLUMNS.length * 0.3) {
    // Only add error if more than 30% of columns are missing
    errors.push(`Missing ${missing.length} columns. Please ensure your Excel file contains all 93 required columns.`);
  }

  // Accept file if at least 70% of expected columns are present (flexible validation)
  // This allows for minor column name variations while ensuring the file is valid
  return {
    valid: missing.length < EXPECTED_COLUMNS.length * 0.3, // Allow if at least 70% columns present
    missing,
    errors
  };
}

/**
 * Parses Excel file (xlsx or xls)
 */
async function parseExcelFile(fileBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  
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
 */
function parseCSVFile(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('CSV file must contain data');
  }

  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (jsonData.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = Object.keys(jsonData[0]).map(h => h.trim());
  const validation = validateHeaders(headers);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }

  const rows = jsonData.map(row => {
    const rowData = {};
    headers.forEach(header => {
      let value = row[header];
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
 */
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    return ExcelJS.DateTime.fromExcelSerialNumber(value);
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

/**
 * Parses numeric value
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * POST /api/import/sales-invoice
 * Import sales invoice data from Excel with all 93 columns
 */
exports.importSalesInvoice = asyncHandler(async (req, res) => {
  console.log('📤 Sales Invoice Import Request:', {
    hasFile: !!req.file,
    fileName: req.file?.originalname,
    fileSize: req.file?.size,
    fileMimetype: req.file?.mimetype,
    hasBuffer: !!req.file?.buffer,
    bufferLength: req.file?.buffer?.length
  });

  const db = getDb();
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  // Validate file was uploaded
  if (!req.file) {
    console.error('❌ No file in request');
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please select an Excel file to import.',
      error: 'MISSING_FILE'
    });
  }

  // Validate file buffer exists
  if (!req.file.buffer || req.file.buffer.length === 0) {
    console.error('❌ File buffer is empty');
    return res.status(400).json({
      success: false,
      message: 'Uploaded file is empty or corrupted',
      error: 'EMPTY_FILE'
    });
  }

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
    console.log('📊 Parsing file...', { isExcel, isCSV, fileName: req.file.originalname });
    if (isCSV) {
      ({ headers, rows } = parseCSVFile(req.file.buffer));
    } else {
      ({ headers, rows } = await parseExcelFile(req.file.buffer));
    }
    console.log('✅ File parsed successfully:', { 
      headerCount: headers?.length, 
      rowCount: rows?.length,
      firstFewHeaders: headers?.slice(0, 5)
    });
  } catch (error) {
    console.error('❌ File parsing error:', {
      message: error.message,
      stack: error.stack,
      fileName: req.file.originalname
    });
    return res.status(400).json({
      success: false,
      message: `File parsing failed: ${error.message}`,
      error: error.message,
      details: 'Please ensure your Excel file contains all 93 required columns and is not corrupted.'
    });
  }

  // Validate that we have data rows
  if (!rows || rows.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Excel file contains no data rows. Please ensure your file has data below the header row.',
      error: 'NO_DATA_ROWS'
    });
  }

  // Validate that we have headers
  if (!headers || headers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Excel file appears to be empty or missing headers. Please check your file format.',
      error: 'NO_HEADERS'
    });
  }

  let importedCount = 0;
  let errorCount = 0;
  const errors = [];

  // Process rows in transaction
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const rowData = rows[rowIndex];
    const rowNum = rowIndex + 2;

    try {
      // Extract all 93 columns
      const invoiceData = {
        key_id: getColumnValue(rowData, 'Key ID')?.toString().trim() || null,
        gst_tax_invoice_no: getColumnValue(rowData, 'GST Tax Invoice No')?.toString().trim() || null,
        gst_tax_invoice_date: parseDate(getColumnValue(rowData, 'GST Tax Invoice Date')),
        internal_invoice_no: getColumnValue(rowData, 'Internal Invoice No')?.toString().trim() || null,
        invoice_type: getColumnValue(rowData, 'Invoice Type')?.toString().trim() || null,
        business_unit: getColumnValue(rowData, 'Business Unit')?.toString().trim() || null,
        customer_name: getColumnValue(rowData, 'Customer Name')?.toString().trim() || null,
        segment: getColumnValue(rowData, 'Segment')?.toString().trim() || null,
        region: getColumnValue(rowData, 'Region')?.toString().trim() || null,
        zone: getColumnValue(rowData, 'Zone')?.toString().trim() || null,
        sales_order_no: getColumnValue(rowData, 'Sales Order No')?.toString().trim() || null,
        account_manager_name: getColumnValue(rowData, 'Account Manager Name')?.toString().trim() || null,
        po_no_reference: getColumnValue(rowData, 'PO No / Reference')?.toString().trim() || null,
        po_date: parseDate(getColumnValue(rowData, 'PO Date')),
        bill_to_party: getColumnValue(rowData, 'Bill to Party')?.toString().trim() || null,
        material_description: getColumnValue(rowData, 'Material Description')?.toString().trim() || null,
        state_of_supply: getColumnValue(rowData, 'State of Supply')?.toString().trim() || null,
        qty: parseNumber(getColumnValue(rowData, 'Qty')),
        unit: getColumnValue(rowData, 'Unit')?.toString().trim() || null,
        currency: getColumnValue(rowData, 'Currency')?.toString().trim() || 'INR',
        basic_rate: parseNumber(getColumnValue(rowData, 'Basic Rate')),
        basic_value: parseNumber(getColumnValue(rowData, 'Basic Value')),
        freight_invoice_no: getColumnValue(rowData, 'Freight Invoice No')?.toString().trim() || null,
        freight_rate: parseNumber(getColumnValue(rowData, 'Freight Rate')),
        freight_value: parseNumber(getColumnValue(rowData, 'Freight Value')),
        sgst_output: parseNumber(getColumnValue(rowData, 'SGST Output')),
        cgst_output: parseNumber(getColumnValue(rowData, 'CGST Output')),
        igst_output: parseNumber(getColumnValue(rowData, 'IGST Output')),
        ugst_output: parseNumber(getColumnValue(rowData, 'UGST Output')),
        tcs: parseNumber(getColumnValue(rowData, 'TCS')),
        subtotal: parseNumber(getColumnValue(rowData, 'SubTotal')),
        total_invoice_value: parseNumber(getColumnValue(rowData, 'Total Invoice Value')),
        consignee_name_address: getColumnValue(rowData, 'Consignee Name & Address')?.toString().trim() || null,
        consignee_city: getColumnValue(rowData, 'Consignee City')?.toString().trim() || null,
        payer_name_address: getColumnValue(rowData, 'Payer Name & Address')?.toString().trim() || null,
        city: getColumnValue(rowData, 'City')?.toString().trim() || null,
        lr_no: getColumnValue(rowData, 'LR No')?.toString().trim() || null,
        lr_date: parseDate(getColumnValue(rowData, 'LR Date')),
        delivery_challan_no: getColumnValue(rowData, 'Delivery Challan No')?.toString().trim() || null,
        delivery_challan_date: parseDate(getColumnValue(rowData, 'Delivery Challan Date')),
        inspection_offer_date: parseDate(getColumnValue(rowData, 'Inspection Offer Date')),
        inspection_date: parseDate(getColumnValue(rowData, 'Inspection Date')),
        delivery_instruction_date: parseDate(getColumnValue(rowData, 'Delivery Instruction Date')),
        last_date_of_dispatch: parseDate(getColumnValue(rowData, 'Last Date of Dispatch')),
        last_date_of_material_receipt: parseDate(getColumnValue(rowData, 'Last Date of Material Receipt')),
        invoice_ready_date: parseDate(getColumnValue(rowData, 'Invoice Ready Date')),
        courier_document_no: getColumnValue(rowData, 'Courier Document No')?.toString().trim() || null,
        courier_document_date: parseDate(getColumnValue(rowData, 'Courier Document Date')),
        courier_name: getColumnValue(rowData, 'Courier Name')?.toString().trim() || null,
        invoice_receipt_date: parseDate(getColumnValue(rowData, 'Invoice Receipt Date')),
        payment_text: getColumnValue(rowData, 'Payment Text')?.toString().trim() || null,
        payment_terms: getColumnValue(rowData, 'Payment Terms')?.toString().trim() || null,
        first_due_date: parseDate(getColumnValue(rowData, '1st Due Date')),
        first_due_amount: parseNumber(getColumnValue(rowData, '1st Due Amount')),
        payment_received_amount_first_due: parseNumber(getColumnValue(rowData, 'Payment Received Amount (1st Due)')),
        receipt_date_first_due: parseDate(getColumnValue(rowData, 'Receipt Date (1st Due)')),
        first_due_balance: parseNumber(getColumnValue(rowData, '1st Due Balance')),
        not_due_first_due: parseNumber(getColumnValue(rowData, 'Not Due (1st Due)')),
        over_due_first_due: parseNumber(getColumnValue(rowData, 'Over Due (1st Due)')),
        no_of_days_of_payment_receipt_first_due: parseNumber(getColumnValue(rowData, 'No of Days of Payment Receipt (1st Due)')),
        second_due_date: parseDate(getColumnValue(rowData, '2nd Due Date')),
        second_due_amount: parseNumber(getColumnValue(rowData, '2nd Due Amount')),
        payment_received_amount_second_due: parseNumber(getColumnValue(rowData, 'Payment Received Amount (2nd Due)')),
        receipt_date_second_due: parseDate(getColumnValue(rowData, 'Receipt Date (2nd Due)')),
        second_due_balance: parseNumber(getColumnValue(rowData, '2nd Due Balance')),
        not_due_second_due: parseNumber(getColumnValue(rowData, 'Not Due (2nd Due)')),
        over_due_second_due: parseNumber(getColumnValue(rowData, 'Over Due (2nd Due)')),
        no_of_days_of_payment_receipt_second_due: parseNumber(getColumnValue(rowData, 'No of Days of Payment Receipt (2nd Due)')),
        third_due_date: parseDate(getColumnValue(rowData, '3rd Due Date')),
        third_due_amount: parseNumber(getColumnValue(rowData, '3rd Due Amount')),
        payment_received_amount_third_due: parseNumber(getColumnValue(rowData, 'Payment Received Amount (3rd Due)')),
        receipt_date_third_due: parseDate(getColumnValue(rowData, 'Receipt Date (3rd Due)')),
        third_due_balance: parseNumber(getColumnValue(rowData, '3rd Due Balance')),
        not_due_third_due: parseNumber(getColumnValue(rowData, 'Not Due (3rd Due)')),
        over_due_third_due: parseNumber(getColumnValue(rowData, 'Over Due (3rd Due)')),
        no_of_days_of_payment_receipt_third_due: parseNumber(getColumnValue(rowData, 'No of Days of Payment Receipt (3rd Due)')),
        total_balance: parseNumber(getColumnValue(rowData, 'Total Balance')),
        not_due_total: parseNumber(getColumnValue(rowData, 'Not Due Total')),
        over_due_total: parseNumber(getColumnValue(rowData, 'Over Due Total')),
        it_tds_2_percent_service: parseNumber(getColumnValue(rowData, 'IT TDS @2% (on Service Part)')),
        it_tds_1_percent_194q_supply: parseNumber(getColumnValue(rowData, 'IT TDS @1% (u/s 194Q Supply)')),
        lcess_boq_1_percent_works: parseNumber(getColumnValue(rowData, 'LCess / BOQ @1% (Works)')),
        tds_2_percent_cgst_sgst: parseNumber(getColumnValue(rowData, 'TDS @2% (CGST@1% SGST@1%)')),
        tds_on_cgst_1_percent: parseNumber(getColumnValue(rowData, 'TDS on CGST @1%')),
        tds_on_sgst_1_percent: parseNumber(getColumnValue(rowData, 'TDS on SGST @1%')),
        excess_supply_qty: parseNumber(getColumnValue(rowData, 'Excess Supply Qty')),
        interest_on_advance: parseNumber(getColumnValue(rowData, 'Interest on Advance')),
        any_hold: getColumnValue(rowData, 'Any Hold')?.toString().trim() || null,
        penalty_ld_deduction: parseNumber(getColumnValue(rowData, 'Penalty / LD Deduction')),
        bank_charges: parseNumber(getColumnValue(rowData, 'Bank Charges')),
        lc_discrepancy_charge: parseNumber(getColumnValue(rowData, 'LC Discrepancy Charge')),
        provision_for_bad_debts: parseNumber(getColumnValue(rowData, 'Provision for Bad Debts')),
        bad_debts: parseNumber(getColumnValue(rowData, 'Bad Debts')),
        created_by: req.user?.id || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Validate required fields
      if (!invoiceData.gst_tax_invoice_no && !invoiceData.internal_invoice_no) {
        errors.push(`Row ${rowNum}: Missing GST Tax Invoice No or Internal Invoice No`);
        errorCount++;
        continue;
      }

      if (!invoiceData.customer_name) {
        errors.push(`Row ${rowNum}: Missing Customer Name`);
        errorCount++;
        continue;
      }

      // Check if invoice already exists
      let existingInvoice = null;
      try {
        if (invoiceData.gst_tax_invoice_no) {
          existingInvoice = await db('sales_invoice_master')
            .where('gst_tax_invoice_no', invoiceData.gst_tax_invoice_no)
            .first();
        }
        if (!existingInvoice && invoiceData.internal_invoice_no) {
          existingInvoice = await db('sales_invoice_master')
            .where('internal_invoice_no', invoiceData.internal_invoice_no)
            .first();
        }
      } catch (dbError) {
        errors.push(`Row ${rowNum}: Database query error - ${dbError.message}`);
        errorCount++;
        continue;
      }

      try {
        if (existingInvoice) {
          // Update existing invoice
          await db('sales_invoice_master')
            .where('id', existingInvoice.id)
            .update({
              ...invoiceData,
              updated_at: new Date()
            });
          importedCount++;
        } else {
          // Insert new invoice
          await db('sales_invoice_master').insert(invoiceData);
          importedCount++;
        }
      } catch (dbError) {
        // Handle database errors (constraints, data type issues, etc.)
        const errorMsg = dbError.code === 'ER_DUP_ENTRY' 
          ? 'Duplicate invoice entry'
          : dbError.message || 'Database error';
        errors.push(`Row ${rowNum}: ${errorMsg}`);
        errorCount++;
      }

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

  // Clean up uploaded file
  if (req.file.path && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }

  console.log('✅ Import completed:', { importedCount, errorCount, totalRows: rows.length });

  res.json({
    success: true,
    message: `Import completed: ${importedCount} records imported, ${errorCount} errors`,
    data: {
      imported: importedCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 20)
    }
  });
});

