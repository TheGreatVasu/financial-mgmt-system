const { getDb } = require('../config/db');
const { asyncHandler } = require('../middlewares/errorHandler');
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

exports.list = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 20, status, from, to, client, q } = req.query;
  
  if (!db) {
    // Return empty result if no DB connection
    return res.json({ success: true, data: [], meta: { page: Number(page), limit: Number(limit), total: 0 } });
  }

  try {
    let qb = db('payment_moms');
    
    if (status) qb = qb.where({ status });
    if (client) qb = qb.where({ customer_id: client });
    if (from) qb = qb.where('meeting_date', '>=', new Date(from));
    if (to) qb = qb.where('meeting_date', '<=', new Date(to));
    if (q) {
      qb = qb.where(function() {
        this.whereILike('meeting_title', `%${q}%`)
          .orWhereILike('agenda', `%${q}%`)
          .orWhereILike('discussion_notes', `%${q}%`);
      });
    }

    const countQuery = qb.clone();
    const [{ c }] = await countQuery.count({ c: '*' });
    
    const rows = await qb
      .orderBy('meeting_date', 'desc')
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit))
      .select('*');

    // Transform rows to match frontend expectations
    const data = rows.map(row => ({
      _id: String(row.id),
      momId: row.mom_id,
      meetingTitle: row.meeting_title,
      meetingDate: row.meeting_date,
      participants: row.participants ? JSON.parse(row.participants) : [],
      agenda: row.agenda,
      discussionNotes: row.discussion_notes,
      agreedPaymentTerms: row.agreed_payment_terms,
      customer: row.customer_id,
      linkedInvoice: row.linked_invoice_id,
      paymentAmount: Number(row.payment_amount || 0),
      dueDate: row.due_date,
      paymentType: row.payment_type,
      interestRate: Number(row.interest_rate || 0),
      status: row.status,
      smart: row.smart ? JSON.parse(row.smart) : computeSmart({ 
        paymentAmount: Number(row.payment_amount || 0), 
        interestRate: Number(row.interest_rate || 0), 
        dueDate: row.due_date 
      }),
      calendar: row.calendar ? JSON.parse(row.calendar) : {},
      aiSummary: row.ai_summary,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({ success: true, data, meta: { page: Number(page), limit: Number(limit), total: Number(c) } });
  } catch (error) {
    // If table doesn't exist, return empty result
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes('doesn\'t exist')) {
      return res.json({ success: true, data: [], meta: { page: Number(page), limit: Number(limit), total: 0 } });
    }
    throw error;
  }
});

exports.getById = asyncHandler(async (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(404).json({ success: false, message: 'MOM not found' });
  }

  const row = await db('payment_moms').where({ id: req.params.id }).first();
  if (!row) {
    return res.status(404).json({ success: false, message: 'MOM not found' });
  }

  const data = {
    _id: String(row.id),
    momId: row.mom_id,
    meetingTitle: row.meeting_title,
    meetingDate: row.meeting_date,
    participants: row.participants ? JSON.parse(row.participants) : [],
    agenda: row.agenda,
    discussionNotes: row.discussion_notes,
    agreedPaymentTerms: row.agreed_payment_terms,
    customer: row.customer_id,
    linkedInvoice: row.linked_invoice_id,
    paymentAmount: Number(row.payment_amount || 0),
    dueDate: row.due_date,
    paymentType: row.payment_type,
    interestRate: Number(row.interest_rate || 0),
    status: row.status,
    smart: row.smart ? JSON.parse(row.smart) : computeSmart({ 
      paymentAmount: Number(row.payment_amount || 0), 
      interestRate: Number(row.interest_rate || 0), 
      dueDate: row.due_date 
    }),
    calendar: row.calendar ? JSON.parse(row.calendar) : {},
    aiSummary: row.ai_summary,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  res.json({ success: true, data });
});

exports.create = asyncHandler(async (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, message: 'Database not available' });
  }

  try {
    const payload = req.body;
  const smart = computeSmart({ 
    paymentAmount: payload.paymentAmount || 0, 
    interestRate: payload.interestRate || 0, 
    dueDate: payload.dueDate 
  });

  // Generate MOM ID
  const [{ c }] = await db('payment_moms').count({ c: '*' });
  const momId = `MOM${String(Number(c) + 1).padStart(4, '0')}`;

  const insertData = {
    mom_id: momId,
    meeting_title: payload.meetingTitle,
    meeting_date: new Date(payload.meetingDate),
    participants: JSON.stringify(payload.participants || []),
    agenda: payload.agenda || null,
    discussion_notes: payload.discussionNotes || null,
    agreed_payment_terms: payload.agreedPaymentTerms || null,
    customer_id: payload.customer || null,
    linked_invoice_id: payload.linkedInvoice || null,
    payment_amount: Number(payload.paymentAmount || 0),
    due_date: payload.dueDate ? new Date(payload.dueDate) : null,
    payment_type: payload.paymentType || 'milestone',
    interest_rate: Number(payload.interestRate || 0),
    status: payload.status || 'planned',
    smart: JSON.stringify(smart),
    calendar: JSON.stringify({}),
    ai_summary: payload.aiSummary || null,
    created_by: req.user.id,
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  };

  const [id] = await db('payment_moms').insert(insertData);
  const row = await db('payment_moms').where({ id }).first();

  // Create calendar event stub
  try {
    const eventId = await createCalendarEvent({ momId, meetingTitle: payload.meetingTitle, meetingDate: payload.meetingDate });
    if (eventId) {
      const calendar = { eventId };
      await db('payment_moms').where({ id }).update({ calendar: JSON.stringify(calendar) });
      row.calendar = JSON.stringify(calendar);
    }
  } catch (_) {}

  const data = {
    _id: String(row.id),
    momId: row.mom_id,
    meetingTitle: row.meeting_title,
    meetingDate: row.meeting_date,
    participants: row.participants ? JSON.parse(row.participants) : [],
    agenda: row.agenda,
    discussionNotes: row.discussion_notes,
    agreedPaymentTerms: row.agreed_payment_terms,
    customer: row.customer_id,
    linkedInvoice: row.linked_invoice_id,
    paymentAmount: Number(row.payment_amount || 0),
    dueDate: row.due_date,
    paymentType: row.payment_type,
    interestRate: Number(row.interest_rate || 0),
    status: row.status,
    smart: row.smart ? JSON.parse(row.smart) : smart,
    calendar: row.calendar ? JSON.parse(row.calendar) : {},
    aiSummary: row.ai_summary,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

    res.status(201).json({ success: true, data });
  } catch (error) {
    // If table doesn't exist, return error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes('doesn\'t exist')) {
      return res.status(500).json({ success: false, message: 'Payment MOM table not found. Please run migrations.' });
    }
    throw error;
  }
});

exports.update = asyncHandler(async (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, message: 'Database not available' });
  }

  const payload = req.body;
  const updateData = {};

  if (payload.meetingTitle != null) updateData.meeting_title = payload.meetingTitle;
  if (payload.meetingDate != null) updateData.meeting_date = new Date(payload.meetingDate);
  if (payload.participants != null) updateData.participants = JSON.stringify(payload.participants);
  if (payload.agenda != null) updateData.agenda = payload.agenda;
  if (payload.discussionNotes != null) updateData.discussion_notes = payload.discussionNotes;
  if (payload.agreedPaymentTerms != null) updateData.agreed_payment_terms = payload.agreedPaymentTerms;
  if (payload.customer != null) updateData.customer_id = payload.customer;
  if (payload.linkedInvoice != null) updateData.linked_invoice_id = payload.linkedInvoice;
  if (payload.paymentAmount != null) updateData.payment_amount = Number(payload.paymentAmount);
  if (payload.dueDate != null) updateData.due_date = payload.dueDate ? new Date(payload.dueDate) : null;
  if (payload.paymentType != null) updateData.payment_type = payload.paymentType;
  if (payload.interestRate != null) updateData.interest_rate = Number(payload.interestRate);
  if (payload.status != null) updateData.status = payload.status;

  // Recalculate smart if payment-related fields changed
  if (payload.paymentAmount != null || payload.interestRate != null || payload.dueDate != null) {
    const row = await db('payment_moms').where({ id: req.params.id }).first();
    if (row) {
      const smart = computeSmart({ 
        paymentAmount: payload.paymentAmount ?? Number(row.payment_amount || 0), 
        interestRate: payload.interestRate ?? Number(row.interest_rate || 0), 
        dueDate: payload.dueDate ?? row.due_date 
      });
      updateData.smart = JSON.stringify(smart);
    }
  }

  updateData.updated_at = db.fn.now();

  const updated = await db('payment_moms').where({ id: req.params.id }).update(updateData);
  if (updated === 0) {
    return res.status(404).json({ success: false, message: 'MOM not found' });
  }

  const row = await db('payment_moms').where({ id: req.params.id }).first();

  // Update calendar event stub
  try {
    const calendar = row.calendar ? JSON.parse(row.calendar) : {};
    if (calendar.eventId) {
      await updateCalendarEvent(calendar.eventId, { momId: row.mom_id, meetingTitle: row.meeting_title, meetingDate: row.meeting_date });
    }
  } catch (_) {}

  const data = {
    _id: String(row.id),
    momId: row.mom_id,
    meetingTitle: row.meeting_title,
    meetingDate: row.meeting_date,
    participants: row.participants ? JSON.parse(row.participants) : [],
    agenda: row.agenda,
    discussionNotes: row.discussion_notes,
    agreedPaymentTerms: row.agreed_payment_terms,
    customer: row.customer_id,
    linkedInvoice: row.linked_invoice_id,
    paymentAmount: Number(row.payment_amount || 0),
    dueDate: row.due_date,
    paymentType: row.payment_type,
    interestRate: Number(row.interest_rate || 0),
    status: row.status,
    smart: row.smart ? JSON.parse(row.smart) : computeSmart({ 
      paymentAmount: Number(row.payment_amount || 0), 
      interestRate: Number(row.interest_rate || 0), 
      dueDate: row.due_date 
    }),
    calendar: row.calendar ? JSON.parse(row.calendar) : {},
    aiSummary: row.ai_summary,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  res.json({ success: true, data });
});

exports.remove = asyncHandler(async (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, message: 'Database not available' });
  }

  const row = await db('payment_moms').where({ id: req.params.id }).first();
  if (!row) {
    return res.status(404).json({ success: false, message: 'MOM not found' });
  }

  // Delete calendar event stub
  try {
    const calendar = row.calendar ? JSON.parse(row.calendar) : {};
    if (calendar.eventId) {
      await deleteCalendarEvent(calendar.eventId);
    }
  } catch (_) {}

  await db('payment_moms').where({ id: req.params.id }).del();
  res.json({ success: true });
});


