const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importExcel, downloadTemplate } = require('../controllers/importController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Configure multer for file upload
const storage = multer.memoryStorage(); // Store in memory
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

// POST /api/import/excel - Upload and import Excel file
router.post('/excel', upload.single('file'), importExcel);

// GET /api/import/template - Download Excel template
router.get('/template', downloadTemplate);

module.exports = router;

