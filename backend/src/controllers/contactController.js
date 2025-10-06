const emailService = require('../services/emailService')
const { asyncHandler } = require('../middlewares/errorHandler')

exports.submitContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required' })
  }
  // Send email via emailService (stubbed success)
  await emailService.sendEmail('support@rmproject.com', `Contact: ${name}`, `From: ${email}\n\n${message}`)
  res.json({ success: true, message: 'Message received' })
})


