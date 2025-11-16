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
 * Required columns that must be present for import to succeed
 */
const REQUIRED_COLUMNS = [
  'GST Tax Invoice No',
  'Customer Name'
];

/**
 * Normalizes a header string for flexible matching:
 * - Trims leading/trailing spaces
 * - Collapses multiple spaces to single space
 * - Converts to lowercase
 * - Normalizes separators (underscores, hyphens, etc. to spaces)
 * - Removes special characters that don't affect meaning (keeps alphanumeric, spaces, and common separators)
 */
function normalizeHeader(header) {
  if (!header || typeof header !== 'string') return '';
  
  return header
    .toString()
    .trim()
    .replace(/[_\-\/]/g, ' ') // Replace underscores, hyphens, slashes with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces to single space
    .toLowerCase()
    .replace(/[^\w\s@%()&]/g, '') // Remove special chars except @, %, (, ), & (keep alphanumeric and spaces)
    .trim();
}

/**
 * Calculates similarity between two strings using Levenshtein distance
 * Returns a score between 0 and 1 (1 = identical, 0 = completely different)
 */
function calculateSimilarity(str1, str2) {
  const s1 = normalizeHeader(str1);
  const s2 = normalizeHeader(str2);
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  
  // Check if one contains the other (partial match)
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    return minLen / maxLen;
  }
  
  // Levenshtein distance
  const matrix = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  const distance = matrix[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - (distance / maxLen);
}

/**
 * Maps detected headers to expected columns using smart matching
 * Returns a mapping object: { detectedHeader: expectedColumn }
 */
function mapHeaders(detectedHeaders, expectedColumns) {
  const mapping = {};
  const usedExpected = new Set();
  const headerMappingLog = [];
  
  console.log('🔍 Header Mapping Started:', {
    detectedCount: detectedHeaders.length,
    expectedCount: expectedColumns.length,
    detectedHeaders: detectedHeaders.slice(0, 10) // Log first 10
  });
  
  // First pass: exact matches (after normalization)
  for (const detected of detectedHeaders) {
    const normalizedDetected = normalizeHeader(detected);
    
    for (const expected of expectedColumns) {
      if (usedExpected.has(expected)) continue;
      
      const normalizedExpected = normalizeHeader(expected);
      if (normalizedDetected === normalizedExpected) {
        mapping[detected] = expected;
        usedExpected.add(expected);
        headerMappingLog.push({
          detected,
          expected,
          method: 'exact',
          similarity: 1.0
        });
        break;
      }
    }
  }
  
  // Second pass: fuzzy matching for unmapped headers
  for (const detected of detectedHeaders) {
    if (mapping[detected]) continue; // Already mapped
    
    let bestMatch = null;
    let bestScore = 0.6; // Minimum similarity threshold
    
    for (const expected of expectedColumns) {
      if (usedExpected.has(expected)) continue;
      
      const similarity = calculateSimilarity(detected, expected);
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = expected;
      }
    }
    
    if (bestMatch) {
      mapping[detected] = bestMatch;
      usedExpected.add(bestMatch);
      headerMappingLog.push({
        detected,
        expected: bestMatch,
        method: 'fuzzy',
        similarity: bestScore.toFixed(3)
      });
    }
  }
  
  console.log('✅ Header Mapping Complete:', {
    mappedCount: Object.keys(mapping).length,
    unmappedCount: detectedHeaders.length - Object.keys(mapping).length,
    mappings: headerMappingLog.slice(0, 20) // Log first 20 mappings
  });
  
  return mapping;
}

/**
 * Validates headers and creates mapping to expected columns
 * Never fails on unknown columns - only maps matching ones
 * Returns { valid, missing, errors, headerMap, matchedColumns, ignoredColumns }
 */
function validateAndMapHeaders(detectedHeaders) {
  const errors = [];
  const missing = [];
  
  // Normalize detected headers
  const normalizedDetected = detectedHeaders.map(h => normalizeHeader(h));
  
  // Create header mapping - this will map detected headers to expected columns
  const headerMap = mapHeaders(detectedHeaders, EXPECTED_COLUMNS);
  
  // Identify matched and ignored columns
  const matchedColumns = [];
  const ignoredColumns = [];
  
  detectedHeaders.forEach(detected => {
    if (headerMap[detected]) {
      matchedColumns.push({
        detected: detected,
        mapped: headerMap[detected]
      });
    } else {
      ignoredColumns.push(detected);
    }
  });
  
  // Check for required columns (warn but don't fail - allow import to proceed)
  for (const required of REQUIRED_COLUMNS) {
    const normalizedRequired = normalizeHeader(required);
    const found = Object.values(headerMap).some(mapped => 
      normalizeHeader(mapped) === normalizedRequired
    );
    
    if (!found) {
      // Check if any detected header is similar to required
      const similarFound = detectedHeaders.some(detected => {
        const similarity = calculateSimilarity(detected, required);
        return similarity >= 0.7; // 70% similarity threshold
      });
      
      if (!similarFound) {
        missing.push(required);
        errors.push(`Missing required column: ${required}`);
      }
    }
  }
  
  // Format errors as requested: { error: 'Missing required column: GST Tax Invoice No' }
  const formattedErrors = errors.length > 0 ? errors.map(err => ({ error: err })) : [];
  
  // Log validation results with detailed information
  console.log('📋 Header Validation Results:', {
    detectedHeaders: detectedHeaders.length,
    detectedHeadersList: detectedHeaders,
    expectedColumns: EXPECTED_COLUMNS.length,
    mappedHeaders: Object.keys(headerMap).length,
    matchedColumns: matchedColumns.length,
    matchedColumnsList: matchedColumns,
    ignoredColumns: ignoredColumns.length,
    ignoredColumnsList: ignoredColumns,
    missingRequired: missing,
    errors: errors.length,
    headerMap: headerMap
  });
  
  // Always return valid=true - we never fail on unknown columns, only warn about missing required ones
  return {
    valid: true, // Always valid - unknown columns are just ignored
    missing,
    errors: formattedErrors,
    headerMap,
    matchedColumns,
    ignoredColumns
  };
}

/**
 * Parses Excel file (xlsx or xls) with smart header mapping
 */
async function parseExcelFile(fileBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excel file must contain at least one sheet');
  }

  // Extract headers from first row
  const detectedHeaders = [];
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
    const value = cell.value?.toString() || '';
    detectedHeaders.push(value);
  });

  // Also try to get all cells including empty ones to catch spacing issues
  const allHeaders = [];
  for (let col = 1; col <= worksheet.columnCount; col++) {
    const cell = worksheet.getRow(1).getCell(col);
    const value = cell.value?.toString() || '';
    if (value.trim()) {
      allHeaders.push(value);
    }
  }

  console.log('📊 Detected Headers (Excel):', {
    count: detectedHeaders.length,
    allHeaders: detectedHeaders,
    totalColumns: worksheet.columnCount,
    totalRows: worksheet.rowCount,
    firstRowSample: worksheet.getRow(2).getCell(1)?.value
  });

  // Validate and map headers - never fails, only maps matching columns
  const validation = validateAndMapHeaders(detectedHeaders);
  
  // Log mapping results
  console.log('✅ Header mapping complete:', {
    matched: validation.matchedColumns.length,
    ignored: validation.ignoredColumns.length,
    missingRequired: validation.missing.length
  });

  // Parse data rows using header mapping - only include matched columns
  const rows = [];
  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);
    if (!row.getCell(1).value) break; // Empty row

    // Build normalized row data with only matched fields
    const rowData = {};
    
    // First, extract all detected values
    const detectedValues = {};
    detectedHeaders.forEach((detectedHeader, index) => {
      const cell = row.getCell(index + 1);
      let value = cell.value;

      // Handle date cells
      if (value instanceof Date) {
        value = value;
      } else if (typeof value === 'number' && 
                 (detectedHeader.toLowerCase().includes('date') || detectedHeader.toLowerCase().includes('due'))) {
        try {
        value = ExcelJS.DateTime.fromExcelSerialNumber(value);
        } catch (e) {
          // If not a valid Excel date, keep as number
        }
      }

      detectedValues[detectedHeader] = value;
    });
    
    // Now build normalized dataset with only matched fields
    // Use mapped header name (expected column name) as key
    Object.keys(validation.headerMap).forEach(detectedHeader => {
      const mappedHeader = validation.headerMap[detectedHeader];
      rowData[mappedHeader] = detectedValues[detectedHeader];
    });
    
    // All unmatched expected columns will be null by default (handled in getColumnValue)
    rows.push(rowData);
  }

  return { 
    headers: Object.values(validation.headerMap), 
    rows, 
    headerMap: validation.headerMap,
    matchedColumns: validation.matchedColumns,
    ignoredColumns: validation.ignoredColumns
  };
}

/**
 * Parses CSV file with smart header mapping
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

  const detectedHeaders = Object.keys(jsonData[0]);
  
  console.log('📊 Detected Headers (CSV):', {
    count: detectedHeaders.length,
    headers: detectedHeaders.slice(0, 10)
  });

  // Validate and map headers - never fails, only maps matching columns
  const validation = validateAndMapHeaders(detectedHeaders);
  
  // Log mapping results
  console.log('✅ Header mapping complete (CSV):', {
    matched: validation.matchedColumns.length,
    ignored: validation.ignoredColumns.length,
    missingRequired: validation.missing.length
  });

  // Transform rows using header mapping - only include matched columns
  const rows = jsonData.map((row, rowIndex) => {
    // Build normalized row data with only matched fields
    const rowData = {};
    
    // Extract all detected values first
    const detectedValues = {};
    detectedHeaders.forEach(detectedHeader => {
      let value = row[detectedHeader];
      
      // Try to parse dates
      if (value && (detectedHeader.toLowerCase().includes('date') || detectedHeader.toLowerCase().includes('due'))) {
        const parsedDate = parseDate(value);
        if (parsedDate) {
          value = parsedDate;
        }
      }
      
      detectedValues[detectedHeader] = value;
    });
    
    // Now build normalized dataset with only matched fields
    // Use mapped header name (expected column name) as key
    Object.keys(validation.headerMap).forEach(detectedHeader => {
      const mappedHeader = validation.headerMap[detectedHeader];
      rowData[mappedHeader] = detectedValues[detectedHeader];
    });
    
    // All unmatched expected columns will be null by default (handled in getColumnValue)
    return rowData;
  });

  return { 
    headers: Object.values(validation.headerMap), 
    rows, 
    headerMap: validation.headerMap,
    matchedColumns: validation.matchedColumns,
    ignoredColumns: validation.ignoredColumns
  };
}

/**
 * Gets column value from row data using smart header matching
 */
function getColumnValue(rowData, expectedColumnName) {
  // First try exact match (case-insensitive)
  const normalizedExpected = normalizeHeader(expectedColumnName);
  
  for (const key in rowData) {
    const normalizedKey = normalizeHeader(key);
    if (normalizedKey === normalizedExpected) {
      return rowData[key];
    }
  }
  
  // Try fuzzy match
  let bestMatch = null;
  let bestScore = 0.7; // Minimum similarity threshold
  
  for (const key in rowData) {
    const similarity = calculateSimilarity(key, expectedColumnName);
    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatch = key;
    }
  }
  
  return bestMatch ? rowData[bestMatch] : null;
}

/**
 * Parses date value from various formats with extensive format support
 */
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    // Validate the date
    if (isNaN(value.getTime())) return null;
    return value;
  }
  
  if (typeof value === 'number') {
    // Excel serial number
    try {
    return ExcelJS.DateTime.fromExcelSerialNumber(value);
    } catch (e) {
      // If not Excel date, try as Unix timestamp
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date;
    }
    return null;
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    
    // Try standard Date parsing first
    let date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date;
    
    // Try common date formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,           // MM/DD/YYYY or DD/MM/YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,            // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,             // DD-MM-YYYY or MM-DD-YYYY
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,          // DD.MM.YYYY
      /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,          // YYYY/MM/DD
    ];
    
    for (const format of formats) {
      const match = trimmed.match(format);
      if (match) {
        let year, month, day;
        if (format === formats[0] || format === formats[2]) {
          // MM/DD/YYYY or DD/MM/YYYY - try both interpretations
          const part1 = parseInt(match[1], 10);
          const part2 = parseInt(match[2], 10);
          const part3 = parseInt(match[3], 10);
          
          // Heuristic: if part1 > 12, it's likely DD/MM/YYYY
          if (part1 > 12) {
            day = part1;
            month = part2 - 1; // JS months are 0-indexed
            year = part3;
          } else {
            month = part1 - 1;
            day = part2;
            year = part3;
          }
        } else if (format === formats[1] || format === formats[4]) {
          // YYYY-MM-DD or YYYY/MM/DD
          year = parseInt(match[1], 10);
          month = parseInt(match[2], 10) - 1;
          day = parseInt(match[3], 10);
        } else {
          // DD.MM.YYYY
          day = parseInt(match[1], 10);
          month = parseInt(match[2], 10) - 1;
          year = parseInt(match[3], 10);
        }
        
        date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  
  return null;
}

/**
 * Parses numeric value, safely converting to number or returning 0
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    // Remove common number formatting
    const cleaned = trimmed.replace(/[,\s]/g, '').replace(/[₹$€£]/g, '');
    const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * POST /api/import/sales-invoice
 * Import sales invoice data from Excel with all 93 columns
 */
exports.importSalesInvoice = asyncHandler(async (req, res) => {
  // CRITICAL: Get user ID from authenticated request - REQUIRED for user data isolation
  const userId = req.user?.id || null;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to import sales invoices',
      error: 'AUTHENTICATION_REQUIRED'
    });
  }

  console.log(`📤 Sales Invoice Import Request for user ID: ${userId} (Email: ${req.user?.email || 'N/A'})`, {
    hasFile: !!req.file,
    fileName: req.file?.originalname,
    fileSize: req.file?.size,
    fileMimetype: req.file?.mimetype,
    hasBuffer: !!req.file?.buffer,
    bufferLength: req.file?.buffer?.length,
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    }
  });

  const db = getDb();
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available',
      error: 'DATABASE_UNAVAILABLE'
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
      message: 'Unsupported file format. Only .xlsx, .xls, and .csv files are allowed',
      error: 'INVALID_FILE_FORMAT'
    });
  }

  let headers, rows, headerMap, matchedColumns, ignoredColumns;

  try {
    console.log('📊 Parsing file...', { isExcel, isCSV, fileName: req.file.originalname });
    if (isCSV) {
      ({ headers, rows, headerMap, matchedColumns, ignoredColumns } = parseCSVFile(req.file.buffer));
    } else {
      ({ headers, rows, headerMap, matchedColumns, ignoredColumns } = await parseExcelFile(req.file.buffer));
    }
    console.log('✅ File parsed successfully:', { 
      headerCount: headers?.length, 
      rowCount: rows?.length,
      mappedHeaders: Object.keys(headerMap || {}).length,
      matchedColumns: matchedColumns?.length || 0,
      ignoredColumns: ignoredColumns?.length || 0,
      firstFewHeaders: headers?.slice(0, 5)
    });
  } catch (error) {
    console.error('❌ File parsing error:', {
      message: error.message,
      stack: error.stack,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      validationErrors: error.validationErrors,
      missingColumns: error.missingColumns,
      errorName: error.name,
      errorCode: error.code
    });
    
    // Return JSON error - never HTML
    // Include validation errors if available
    const response = {
      success: false,
      message: `File parsing failed: ${error.message}`,
      error: error.message,
      errorCode: 'PARSE_ERROR',
      details: 'Please check your Excel file format and column names.',
      fileName: req.file.originalname
    };
    
    // Add validation errors if present
    if (error.validationErrors && Array.isArray(error.validationErrors)) {
      response.errors = error.validationErrors;
    }
    
    if (error.missingColumns && Array.isArray(error.missingColumns)) {
      response.missingColumns = error.missingColumns;
    }
    
    console.log('📤 Sending 400 error response:', response);
    return res.status(400).json(response);
  }

  // Validate that we have headers FIRST
  if (!headers || headers.length === 0) {
    console.error('❌ No headers found after parsing:', {
      matchedColumns: matchedColumns?.length || 0,
      ignoredColumns: ignoredColumns?.length || 0,
      headerMap: Object.keys(headerMap || {}).length
    });
    return res.status(400).json({
      success: false,
      message: 'Excel file appears to be empty or missing headers. Please check your file format.',
      error: 'NO_HEADERS',
      errorCode: 'NO_HEADERS',
      details: 'No columns were matched from your Excel file. Please ensure your file contains column headers that match the expected format.',
      detectedHeaders: matchedColumns?.length > 0 ? matchedColumns.map(m => m.detected) : [],
      expectedColumns: EXPECTED_COLUMNS.slice(0, 10),
      matchedCount: matchedColumns?.length || 0
    });
  }

  // Validate that we have data rows
  if (!rows || rows.length === 0) {
    console.error('❌ No data rows found after parsing:', {
      headersCount: headers.length,
      matchedColumns: matchedColumns?.length || 0
    });
    return res.status(400).json({
      success: false,
      message: 'Excel file contains no data rows. Please ensure your file has data below the header row.',
      error: 'NO_DATA_ROWS',
      errorCode: 'NO_DATA_ROWS',
      details: `Found ${headers.length} matched columns but no data rows. Please add data below the header row.`,
      matchedColumns: headers.length
    });
  }

  console.log('✅ Validation passed:', {
    headersCount: headers.length,
    rowsCount: rows.length,
    matchedColumns: matchedColumns?.length || 0,
    ignoredColumns: ignoredColumns?.length || 0
  });

  let importedCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Track merge changes
  let newRecordsCount = 0;
  let updatedRecordsCount = 0;
  const updatedInvoiceNos = [];
  const newInvoiceNos = [];

  console.log('🔄 Starting data import process...', {
    totalRows: rows.length,
    matchedColumns: matchedColumns?.length || 0,
    ignoredColumns: ignoredColumns?.length || 0,
    headerMapKeys: Object.keys(headerMap || {}).length,
    sampleRow: rows[0] ? Object.keys(rows[0]).slice(0, 5) : []
  });

  // Process rows with transaction support
  console.log('🔄 Starting database transaction...');
  const trx = await db.transaction();
  console.log('✅ Transaction started');
  
  try {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const rowData = rows[rowIndex];
    const rowNum = rowIndex + 2;

    try {
        // Extract all 93 columns using smart header matching
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
        created_by: userId, // CRITICAL: Set from authenticated user (already validated above)
        created_at: new Date(),
        updated_at: new Date()
      };

      // Validate required fields
      // CRITICAL: Database requires gst_tax_invoice_no to be NOT NULL
      // So we must ensure it's present, even if we have internal_invoice_no
      if (!invoiceData.gst_tax_invoice_no) {
        // If we have internal_invoice_no but no gst_tax_invoice_no, use it as fallback
        if (invoiceData.internal_invoice_no) {
          invoiceData.gst_tax_invoice_no = invoiceData.internal_invoice_no;
          console.log(`⚠️ Row ${rowNum}: Using Internal Invoice No as GST Tax Invoice No`);
        } else {
          errors.push(`Row ${rowNum}: Missing GST Tax Invoice No (required by database)`);
        errorCount++;
        continue;
        }
      }

      if (!invoiceData.customer_name) {
        errors.push(`Row ${rowNum}: Missing Customer Name (required by database)`);
        errorCount++;
        continue;
      }

      console.log(`📝 Row ${rowNum}: Processing invoice - GST: ${invoiceData.gst_tax_invoice_no}, Customer: ${invoiceData.customer_name}`);

      // CRITICAL: Check if invoice already exists FOR THIS USER ONLY
      // Users can have invoices with the same invoice number, but they belong to different users
      let existingInvoice = null;
      try {
        if (invoiceData.gst_tax_invoice_no) {
          existingInvoice = await trx('sales_invoice_master')
            .where('gst_tax_invoice_no', invoiceData.gst_tax_invoice_no)
            .where('created_by', userId) // CRITICAL: Only check within user's own invoices
            .whereNotNull('created_by')
            .first();
        }
        if (!existingInvoice && invoiceData.internal_invoice_no) {
          existingInvoice = await trx('sales_invoice_master')
            .where('internal_invoice_no', invoiceData.internal_invoice_no)
            .where('created_by', userId) // CRITICAL: Only check within user's own invoices
            .whereNotNull('created_by')
            .first();
        }
      } catch (dbError) {
        console.error(`❌ Row ${rowNum}: Database query error:`, {
          error: dbError.message,
          code: dbError.code,
          sqlState: dbError.sqlState,
          sqlMessage: dbError.sqlMessage
        });
        errors.push(`Row ${rowNum}: Database query error - ${dbError.message}`);
        errorCount++;
        continue;
      }

      try {
        if (existingInvoice) {
          // Update existing invoice - verify it belongs to the user
          if (existingInvoice.created_by !== userId) {
            errors.push(`Row ${rowNum}: Invoice already exists but belongs to another user. Cannot update.`);
            errorCount++;
            continue;
          }
          
          console.log(`🔄 Row ${rowNum}: Updating existing invoice ID ${existingInvoice.id} for user ${userId}`);
          const updateResult = await trx('sales_invoice_master')
            .where('id', existingInvoice.id)
            .where('created_by', userId) // CRITICAL: Ensure user can only update their own invoices
            .update({
              ...invoiceData,
              created_by: userId, // Ensure created_by is preserved
              updated_at: new Date()
            });
            
          if (updateResult > 0) {
            importedCount++;
            updatedRecordsCount++;
            updatedInvoiceNos.push(invoiceData.gst_tax_invoice_no || invoiceData.internal_invoice_no);
            console.log(`✅ Row ${rowNum}: Successfully updated invoice ID ${existingInvoice.id}`);
          } else {
            console.warn(`⚠️ Row ${rowNum}: Update returned 0 rows affected`);
            errors.push(`Row ${rowNum}: Update failed - no rows affected`);
            errorCount++;
          }
        } else {
          // Insert new invoice - ensure created_by is set
          console.log(`➕ Row ${rowNum}: Inserting new invoice for user ${userId}`);
          // Ensure created_by is explicitly set (it should already be in invoiceData, but double-check)
          invoiceData.created_by = userId;
          const insertResult = await trx('sales_invoice_master').insert(invoiceData);
          const insertedId = Array.isArray(insertResult) ? insertResult[0] : insertResult;
          importedCount++;
          newRecordsCount++;
          newInvoiceNos.push(invoiceData.gst_tax_invoice_no || invoiceData.internal_invoice_no);
          console.log(`✅ Row ${rowNum}: Successfully inserted new invoice with ID ${insertedId || 'unknown'}`);
        }
      } catch (dbError) {
        // Handle database errors (constraints, data type issues, etc.)
        console.error(`❌ Row ${rowNum}: Database operation error:`, {
          error: dbError.message,
          code: dbError.code,
          sqlState: dbError.sqlState,
          sqlMessage: dbError.sqlMessage,
          invoiceData: {
            gst_tax_invoice_no: invoiceData.gst_tax_invoice_no,
            customer_name: invoiceData.customer_name,
            hasAllFields: Object.keys(invoiceData).length
          }
        });
          
        const errorMsg = dbError.code === 'ER_DUP_ENTRY' 
          ? 'Duplicate invoice entry'
          : dbError.message || 'Database error';
        errors.push(`Row ${rowNum}: ${errorMsg}`);
        errorCount++;
      }

    } catch (error) {
        console.error(`❌ Row ${rowNum}: Processing error:`, {
          error: error.message,
          stack: error.stack
        });
      errors.push(`Row ${rowNum}: ${error.message}`);
      errorCount++;
    }
    }

    // Commit transaction if we have any successful imports
    if (importedCount > 0) {
      await trx.commit();
      console.log('✅ Transaction committed successfully');
    } else {
      await trx.rollback();
      console.log('⚠️ No records imported, transaction rolled back');
    }
  } catch (transactionError) {
    await trx.rollback();
    console.error('❌ Transaction error, rolling back:', {
      error: transactionError.message,
      stack: transactionError.stack,
      importedCount,
      errorCount
    });
    
    // Return error response instead of throwing to prevent HTML error page
    return res.status(500).json({
      success: false,
      message: `Import failed: ${transactionError.message}`,
      error: transactionError.message,
      errorCode: 'TRANSACTION_ERROR',
      importedCount: importedCount || 0,
      errorCount: errorCount || 0,
      details: 'Database transaction failed. Please check the logs for details.'
    });
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

  console.log('✅ Import completed:', { 
    importedCount, 
    errorCount, 
    totalRows: rows.length,
    success: importedCount > 0,
    matchedColumns: matchedColumns?.length || 0,
    ignoredColumns: ignoredColumns?.length || 0
  });

  // Always return JSON with matched/ignored columns summary
  // Use importedCount as requested by user
  const response = {
    success: true,
    message: `Import completed: ${importedCount} records imported, ${errorCount} errors`,
    importedCount: importedCount, // Main field for frontend
    data: {
      imported: importedCount, // Keep for backward compatibility
      importedCount: importedCount, // Explicit count
      errors: errorCount,
      errorCount: errorCount,
      errorDetails: errors.slice(0, 20),
      totalRows: rows.length,
      columnMapping: {
        matched: matchedColumns || [],
        ignored: ignoredColumns || [],
        matchedCount: matchedColumns?.length || 0,
        ignoredCount: ignoredColumns?.length || 0,
        totalDetected: (matchedColumns?.length || 0) + (ignoredColumns?.length || 0)
      },
      mergeSummary: {
        newRecords: newRecordsCount,
        updatedRecords: updatedRecordsCount,
        deletedRecords: 0, // Not tracking deletions in current implementation
        newInvoiceNos: newInvoiceNos.slice(0, 10), // Sample of new invoice numbers
        updatedInvoiceNos: updatedInvoiceNos.slice(0, 10) // Sample of updated invoice numbers
      }
    }
  };

  console.log('📤 Sending response to frontend:', {
    success: response.success,
    importedCount: response.importedCount,
    errorCount: response.data.errorCount
  });

  return res.json(response);
});
