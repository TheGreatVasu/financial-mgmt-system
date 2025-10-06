const { asyncHandler } = require('../middlewares/errorHandler');

// Placeholder controllers - will be implemented later

const getPayments = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get payments - Coming soon',
    data: []
  });
});

const createPayment = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Create payment - Coming soon',
    data: req.body
  });
});

module.exports = {
  getPayments,
  createPayment
};
