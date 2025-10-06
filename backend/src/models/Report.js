const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['receivables_summary', 'dso_analysis', 'aging_report', 'customer_analysis', 'payment_trends'],
    required: [true, 'Report type is required']
  },
  title: {
    type: String,
    required: [true, 'Report title is required']
  },
  description: String,
  parameters: {
    startDate: Date,
    endDate: Date,
    customerIds: [mongoose.Schema.Types.ObjectId],
    status: [String],
    customFilters: mongoose.Schema.Types.Mixed
  },
  data: mongoose.Schema.Types.Mixed,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduleFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly'],
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
