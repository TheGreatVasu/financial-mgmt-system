const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { getDaysDifference } = require('./formatDate');

const calculatePayments = async (customerId, startDate, endDate) => {
  try {
    // Get all invoices for the customer in the date range
    const invoices = await Invoice.find({
      customer: customerId,
      issueDate: { $gte: startDate, $lte: endDate }
    }).populate('customer');

    // Get all payments for the customer in the date range
    const payments = await Payment.find({
      customer: customerId,
      paymentDate: { $gte: startDate, $lte: endDate }
    }).populate('invoice');

    // Calculate totals
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOutstanding = totalInvoiced - totalPaid;

    // Calculate DSO (Days Sales Outstanding)
    const dso = calculateDSO(invoices, payments);

    // Calculate aging analysis
    const agingAnalysis = calculateAgingAnalysis(invoices);

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      dso,
      agingAnalysis,
      invoiceCount: invoices.length,
      paymentCount: payments.length
    };
  } catch (error) {
    throw new Error(`Error calculating payments: ${error.message}`);
  }
};

const calculateDSO = (invoices, payments) => {
  if (invoices.length === 0) return 0;

  const totalOutstanding = invoices.reduce((sum, invoice) => {
    return sum + (invoice.totalAmount - invoice.paidAmount);
  }, 0);

  if (totalOutstanding === 0) return 0;

  // Calculate average daily sales
  const totalSales = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const dateRange = getDaysDifference(
    Math.min(...invoices.map(i => i.issueDate)),
    Math.max(...invoices.map(i => i.issueDate))
  );
  const averageDailySales = totalSales / Math.max(dateRange, 1);

  // Calculate DSO
  const dso = totalOutstanding / Math.max(averageDailySales, 1);
  return Math.round(dso);
};

const calculateAgingAnalysis = (invoices) => {
  const today = new Date();
  const aging = {
    current: 0,      // 0-30 days
    days31to60: 0,  // 31-60 days
    days61to90: 0,  // 61-90 days
    over90: 0       // Over 90 days
  };

  invoices.forEach(invoice => {
    const daysOverdue = getDaysDifference(invoice.dueDate, today);
    const outstandingAmount = invoice.totalAmount - invoice.paidAmount;

    if (daysOverdue <= 30) {
      aging.current += outstandingAmount;
    } else if (daysOverdue <= 60) {
      aging.days31to60 += outstandingAmount;
    } else if (daysOverdue <= 90) {
      aging.days61to90 += outstandingAmount;
    } else {
      aging.over90 += outstandingAmount;
    }
  });

  return aging;
};

const calculateCustomerMetrics = async (customerId) => {
  try {
    const invoices = await Invoice.find({ customer: customerId });
    const payments = await Payment.find({ customer: customerId });

    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOutstanding = totalInvoiced - totalPaid;

    const averageInvoiceAmount = invoices.length > 0 ? totalInvoiced / invoices.length : 0;
    const paymentRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      averageInvoiceAmount,
      paymentRate,
      invoiceCount: invoices.length,
      paymentCount: payments.length
    };
  } catch (error) {
    throw new Error(`Error calculating customer metrics: ${error.message}`);
  }
};

module.exports = {
  calculatePayments,
  calculateDSO,
  calculateAgingAnalysis,
  calculateCustomerMetrics
};
