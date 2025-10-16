// Simple AI summary stub; replace with real LLM integration later
async function generateMomSummary(payload) {
  const { meetingTitle, meetingDate, paymentAmount, interestRate, dueDate, paymentType } = payload;
  const amountStr = typeof paymentAmount === 'number' ? `₹${paymentAmount.toLocaleString('en-IN')}` : 'N/A';
  const dateStr = dueDate ? new Date(dueDate).toDateString() : 'unspecified date';
  const rateStr = interestRate ? `${interestRate}%` : 'no interest';
  const typeStr = paymentType || 'payment';
  return `Agreed to release ${amountStr} by ${dateStr} for ${typeStr} with ${rateStr}. (${meetingTitle} on ${new Date(meetingDate).toDateString()})`;
}

module.exports = { generateMomSummary };


