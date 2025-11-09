const emailService = require('../services/emailService')
const { asyncHandler } = require('../middlewares/errorHandler')

exports.submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body
  
  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, email, subject, and message are required' 
    })
  }

  // Email validation
  const emailRegex = /.+@.+\..+/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid email address' 
    })
  }

  try {
    // Format email content
    const emailContent = `
Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Financial Management System contact form.
    `.trim()

    // Send email via emailService
    await emailService.sendEmail(
      'support@financialmgmt.com', 
      `Contact Form: ${subject}`, 
      emailContent
    )

    res.json({ 
      success: true, 
      message: 'Your message has been sent successfully. We will get back to you soon.' 
    })
  } catch (error) {
    console.error('Error sending contact email:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    })
  }
})


