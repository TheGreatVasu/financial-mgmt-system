const emailService = require('./emailService');

// Very lightweight in-process reminder scheduler.
// For production, replace with a durable job queue (e.g., BullMQ/Redis or cron).

class ReminderService {
  constructor() {
    this.jobs = new Map(); // key: actionItemId -> timeoutId
  }

  scheduleOneDayBefore({ id, title, ownerName, ownerEmail, dueDate }) {
    if (!ownerEmail || !dueDate) return;
    const due = new Date(dueDate);
    const runAt = new Date(due.getTime() - 24 * 60 * 60 * 1000);
    const delayMs = Math.max(0, runAt.getTime() - Date.now());
    if (this.jobs.has(id)) {
      clearTimeout(this.jobs.get(id));
      this.jobs.delete(id);
    }
    const timeoutId = setTimeout(async () => {
      try {
        const subject = `Reminder: Action Item due ${due.toISOString().slice(0,10)}`;
        const text = `Hi ${ownerName || ''},\n\nThis is a reminder that the action item:\n\n${title}\n\nIs due on ${due.toISOString().slice(0,10)}.\n\nPlease ensure it is completed in time.\n`;
        await emailService.sendEmail(ownerEmail, subject, text);
      } finally {
        this.jobs.delete(id);
      }
    }, delayMs);
    this.jobs.set(id, timeoutId);
  }
}

module.exports = new ReminderService();


