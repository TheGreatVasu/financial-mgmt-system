const mongoose = require('mongoose');

const paymentMOMSchema = new mongoose.Schema({
  momId: { type: String, unique: true, uppercase: true },
  meetingTitle: { type: String, required: true },
  meetingDate: { type: Date, required: true },
  participants: [{ type: String }],
  agenda: { type: String },
  discussionNotes: { type: String },
  agreedPaymentTerms: { type: String },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  linkedInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  paymentAmount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date },
  paymentType: { type: String, enum: ['advance', 'milestone', 'final', 'refund', 'other'], default: 'milestone' },
  interestRate: { type: Number, min: 0, max: 100 },
  status: { type: String, enum: ['planned', 'due', 'paid', 'overdue', 'cancelled'], default: 'planned' },
  smart: {
    totalPayable: { type: Number, default: 0 },
    pendingDues: { type: Number, default: 0 },
    computedInterest: { type: Number, default: 0 }
  },
  calendar: {
    eventId: { type: String },
    followUpDate: { type: Date },
    reminders: [{ type: Date }],
    provider: { type: String, enum: ['internal', 'google', 'outlook'], default: 'internal' }
  },
  aiSummary: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

paymentMOMSchema.index({ meetingDate: -1 });
paymentMOMSchema.index({ status: 1, dueDate: 1 });
paymentMOMSchema.index({ customer: 1, meetingDate: -1 });

paymentMOMSchema.pre('save', async function(next) {
  if (!this.momId) {
    const count = await this.constructor.countDocuments();
    this.momId = `MOM${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PaymentMOM', paymentMOMSchema);


