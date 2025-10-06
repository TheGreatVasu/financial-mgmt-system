const { asyncHandler } = require('../middlewares/errorHandler');

// Placeholder controllers - will be implemented later

const getCustomers = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get customers - Coming soon',
    data: []
  });
});

const getCustomer = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get customer - Coming soon',
    data: { id: req.params.id }
  });
});

const createCustomer = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Create customer - Coming soon',
    data: req.body
  });
});

const updateCustomer = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Update customer - Coming soon',
    data: { id: req.params.id, ...req.body }
  });
});

const deleteCustomer = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Delete customer - Coming soon',
    data: { id: req.params.id }
  });
});

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
