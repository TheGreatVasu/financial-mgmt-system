const { asyncHandler } = require('../middlewares/errorHandler');

// Placeholder controllers - will be implemented later

const getNotifications = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get notifications - Coming soon',
    data: []
  });
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
