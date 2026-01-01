const { validationResult, body } = require('express-validator');
const repo = require('../services/actionItemsRepo');

exports.validateCreate = [
  body('title').isString().trim().notEmpty(),
  body('ownerEmail').isEmail(),
  body('dueDate').isISO8601().withMessage('dueDate must be YYYY-MM-DD'),
  body('ownerName').optional().isString(),
  body('notes').optional().isString(),
];

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { actionId, title, ownerName, ownerEmail, dueDate, notes } = req.body;
  const item = await repo.createActionItem({ actionId, title, ownerName, ownerEmail, dueDate, status: 'open', notes });
  res.status(201).json({ success: true, data: item });
};

exports.bulkCreateFromMom = async (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'items[] required' });
  const created = [];
  for (const raw of items) {
    if (!raw?.title || !raw?.ownerEmail || !raw?.dueDate) continue;
    const item = await repo.createActionItem({
      actionId: raw.actionId,
      title: raw.title,
      ownerName: raw.ownerName,
      ownerEmail: raw.ownerEmail,
      dueDate: raw.dueDate,
      status: raw.status || 'open',
      notes: raw.notes || undefined,
    });
    created.push(item);
  }
  res.status(201).json({ success: true, data: created });
};

exports.list = async (req, res) => {
  const rows = await repo.list({ ownerEmail: req.query.ownerEmail, status: req.query.status });
  res.json({ success: true, data: rows });
};

exports.update = async (req, res) => {
  const item = await repo.update(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  if (req.body?.dueDate || req.body?.ownerEmail) {
    reminderService.scheduleOneDayBefore({ id: item.id, title: item.title, ownerName: item.ownerName, ownerEmail: item.ownerEmail, dueDate: item.dueDate });
  }
  res.json({ success: true, data: item });
};


