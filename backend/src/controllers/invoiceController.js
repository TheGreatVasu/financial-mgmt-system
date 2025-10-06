const { asyncHandler } = require('../middlewares/errorHandler');

// Placeholder controllers - will be implemented later

const getInvoices = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get invoices - Coming soon',
    data: []
  });
});

const getInvoice = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get invoice - Coming soon',
    data: { id: req.params.id }
  });
});

const createInvoice = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Create invoice - Coming soon',
    data: req.body
  });
});

const updateInvoice = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Update invoice - Coming soon',
    data: { id: req.params.id, ...req.body }
  });
});

const deleteInvoice = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Delete invoice - Coming soon',
    data: { id: req.params.id }
  });
});

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
