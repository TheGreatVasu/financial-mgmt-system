const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importExcel, downloadTemplate } = require('../controllers/importController');
const { importSalesInvoice } = require('../controllers/salesInvoiceImportController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Configure multer for file upload
const storage = multer.memoryStorage(); // Store in memory
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel and CSV files
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv' // .csv (alternative)
    ];
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    if (isValidMimeType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) and CSV files (.csv) are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

// POST /api/import/excel - Upload and import Excel file (legacy format)
router.post('/excel', upload.single('file'), importExcel);

// POST /api/import/sales-invoice - Upload and import Sales Invoice Excel (93 columns)
router.post('/sales-invoice', (req, res, next) => {
  console.log('📥 Route: /sales-invoice - Multer processing file upload...', {
    hasFile: !!req.file,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  });
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error in route:', {
        error: err.message,
        code: err.code,
        name: err.name,
        isMulterError: err instanceof multer.MulterError
      });
      
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds the maximum limit of 10MB',
            error: 'FILE_TOO_LARGE',
            errorCode: 'LIMIT_FILE_SIZE'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field. Please use the field name "file"',
            error: 'INVALID_FIELD_NAME',
            errorCode: 'LIMIT_UNEXPECTED_FILE'
          });
        }
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
          error: err.message,
          errorCode: err.code
        });
      }
      // Handle other errors (like fileFilter errors)
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
        error: err.message,
        errorCode: 'UPLOAD_ERROR'
      });
    }
    
    console.log('✅ Multer processed file successfully:', {
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      hasBuffer: !!req.file?.buffer
    });
    
    next();
  });
}, importSalesInvoice);

// GET /api/import/template - Download Excel template
router.get('/template', downloadTemplate);

module.exports = router;

