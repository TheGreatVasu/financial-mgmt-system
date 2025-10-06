const { asyncHandler } = require('../middlewares/errorHandler');

// Placeholder controllers - will be implemented later

const getReports = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get reports - Coming soon',
    data: []
  });
});

const getDSOReport = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'DSO report - Coming soon',
    data: []
  });
});

const getAgingReport = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Aging report - Coming soon',
    data: []
  });
});

module.exports = {
  getReports,
  getDSOReport,
  getAgingReport
};
