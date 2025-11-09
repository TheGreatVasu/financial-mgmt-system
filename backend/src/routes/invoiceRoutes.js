const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorHandler');
const ctrl = require('../controllers/invoiceController');
const pdfService = require('../services/pdfService');

const router = express.Router();

router.use(authMiddleware);
router.get('/next-number', ctrl.getNextInvoiceNumber);
router.get('/', ctrl.getInvoices);
router.get('/:id', ctrl.getInvoice);
router.get('/:id/pdf', asyncHandler(async (req, res) => {
  try {
  const { getDb } = require('../config/db');
  const db = getDb();
  const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invoice ID is required' });
    }
    
    // Convert ID to number if it's a string (MySQL uses numeric IDs)
    const invoiceId = isNaN(id) ? id : Number(id);
  
  let invoiceData;
  if (db) {
      // Fetch fresh data from database with customer information
    const row = await db('invoices as i')
      .leftJoin('customers as c', 'c.id', 'i.customer_id')
        .where('i.id', invoiceId)
      .select('i.*', 'c.company_name as customer_name')
      .first();
    
    if (!row) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
      // Parse items JSON if present (keep as string for PDF service to handle)
      // PDF service will parse it itself to ensure consistency
    invoiceData = row;
  } else {
    const Invoice = require('../models/Invoice');
      const doc = await Invoice.findById(invoiceId).populate('customer', 'companyName');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    invoiceData = doc.toObject ? doc.toObject() : doc;
  }
  
    // Generate PDF with fresh data
    const pdfDoc = pdfService.createInvoicePDF(invoiceData);
    
    // Set response headers
    const invoiceNumber = invoiceData.invoiceNumber || invoiceData.invoice_number || invoiceId;
  res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNumber}-${Date.now()}.pdf`);
    
    // Stream PDF to response
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate invoice PDF' 
    });
  }
}));
router.post('/', ctrl.createInvoice);
router.put('/:id', ctrl.updateInvoice);
router.delete('/:id', ctrl.deleteInvoice);

module.exports = router;
