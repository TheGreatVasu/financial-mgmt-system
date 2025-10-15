const { asyncHandler } = require('../middlewares/errorHandler');
const repo = require('../services/repositories');

// Placeholder controllers - will be implemented later

const getNotifications = asyncHandler(async (req, res) => {
  const rows = await repo.listAlerts(20);
  res.json({ success: true, data: rows });
});

const markAsRead = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Mark notification as read - Coming soon',
    data: req.body
  });
});

module.exports = {
  getNotifications,
  markAsRead
};
