const PaymentMOM = require('../models/PaymentMOM');
const AuditLog = require('../models/AuditLog');
const { generateMomSummary } = require('../services/aiService');
const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = require('../services/calendarService');

function computeSmart({ paymentAmount = 0, interestRate = 0, dueDate }) {
  const today = new Date();
  const due = dueDate ? new Date(dueDate) : null;
  let computedInterest = 0;
  let pendingDues = paymentAmount;
  if (due && today > due && interestRate > 0) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysLate = Math.floor((today - due) / msPerDay);
    computedInterest = Number(((paymentAmount * (interestRate / 100)) / 30) * daysLate).toFixed(2) * 1;
  }
  const totalPayable = paymentAmount + computedInterest;
  return { totalPayable, pendingDues, computedInterest };
}

exports.list = async (req, res) => {
  const { page = 1, limit = 20, status, from, to, client, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (client) filter.customer = client;
  if (from || to) {
    filter.meetingDate = {};
    if (from) filter.meetingDate.$gte = new Date(from);
    if (to) filter.meetingDate.$lte = new Date(to);
  }
  if (q) {
    filter.$or = [
      { meetingTitle: new RegExp(q, 'i') },
      { agenda: new RegExp(q, 'i') },
      { discussionNotes: new RegExp(q, 'i') }
    ];
  }

  const docs = await PaymentMOM.find(filter)
    .populate('customer linkedInvoice createdBy', '-password')
    .sort({ meetingDate: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  const count = await PaymentMOM.countDocuments(filter);
  res.json({ success: true, data: docs, meta: { page: Number(page), limit: Number(limit), total: count } });
};

exports.getById = async (req, res) => {
  const doc = await PaymentMOM.findById(req.params.id).populate('customer linkedInvoice createdBy', '-password');
  if (!doc) return res.status(404).json({ success: false, message: 'MOM not found' });
  res.json({ success: true, data: doc });
};

exports.create = async (req, res) => {
  const payload = req.body;
  const smart = computeSmart({ paymentAmount: payload.paymentAmount, interestRate: payload.interestRate, dueDate: payload.dueDate });
  const aiSummary = payload.aiSummary || await generateMomSummary(payload);
  const doc = await PaymentMOM.create({ ...payload, smart, aiSummary, createdBy: req.user._id });

  // create calendar event stub
  try {
    const eventId = await createCalendarEvent(doc);
    if (eventId) {
      doc.calendar = { ...(doc.calendar || {}), eventId };
      await doc.save();
    }
  } catch (_) {}

  await AuditLog.create({
    entityType: 'PaymentMOM',
    entityId: doc._id,
    action: 'create',
    actor: req.user._id,
    meta: { aiSummary }
  });

  res.status(201).json({ success: true, data: doc });
};

exports.update = async (req, res) => {
  const payload = req.body;
  if (payload.paymentAmount != null || payload.interestRate != null || payload.dueDate != null) {
    const smart = computeSmart({ paymentAmount: payload.paymentAmount ?? 0, interestRate: payload.interestRate ?? 0, dueDate: payload.dueDate });
    payload.smart = smart;
  }
  if (!payload.aiSummary && (payload.paymentAmount != null || payload.interestRate != null || payload.dueDate != null || payload.paymentType || payload.meetingTitle || payload.meetingDate)) {
    payload.aiSummary = await generateMomSummary({ ...payload });
  }
  const doc = await PaymentMOM.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'MOM not found' });

  // update calendar event stub
  try {
    if (doc.calendar && doc.calendar.eventId) {
      await updateCalendarEvent(doc.calendar.eventId, doc);
    }
  } catch (_) {}

  await AuditLog.create({ entityType: 'PaymentMOM', entityId: doc._id, action: 'update', actor: req.user._id, meta: {} });

  res.json({ success: true, data: doc });
};

exports.remove = async (req, res) => {
  const doc = await PaymentMOM.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'MOM not found' });
  try {
    if (doc.calendar && doc.calendar.eventId) {
      await deleteCalendarEvent(doc.calendar.eventId);
    }
  } catch (_) {}
  await AuditLog.create({ entityType: 'PaymentMOM', entityId: doc._id, action: 'delete', actor: req.user._id, meta: {} });
  res.json({ success: true });
};


