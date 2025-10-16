const { asyncHandler } = require('../middlewares/errorHandler');
const repo = require('../services/repositories');
const { getDb } = require('../config/db');

const getNotifications = asyncHandler(async (req, res) => {
  const rows = await repo.listAlerts(50);
  res.json({ success: true, data: rows });
});

const markAsRead = asyncHandler(async (req, res) => {
  const db = getDb();
  const { ids = [] } = req.body || {};
  if (db) {
    await db('alerts').whereIn('id', ids).update({ read: 1 });
  }
  res.json({ success: true });
});

module.exports = { getNotifications, markAsRead };
