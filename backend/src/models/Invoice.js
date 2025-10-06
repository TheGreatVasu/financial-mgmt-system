const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    uppercase: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  items: [{
    description: {
      type: String,
      required: [true, 'Item description is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    total: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  outstandingAmount: {
    type: Number,
    required: true,
    min: [0, 'Outstanding amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentTerms: {
    type: String,
    enum: ['net15', 'net30', 'net45', 'net60'],
    default: 'net30'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: new Date(year, 0, 1) }
    });
    this.invoiceNumber = `INV${year}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.totalAmount = this.subtotal + this.taxAmount;
  this.outstandingAmount = this.totalAmount - this.paidAmount;
  
  // Set status based on outstanding amount and due date
  if (this.outstandingAmount === 0) {
    this.status = 'paid';
  } else if (this.dueDate < new Date() && this.outstandingAmount > 0) {
    this.status = 'overdue';
  } else if (this.status === 'draft' && this.outstandingAmount > 0) {
    this.status = 'sent';
  }
  
  next();
});

// Calculate days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'overdue') {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    return Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

module.exports = mongoose.model('Invoice', invoiceSchema);
