const { asyncHandler } = require('../middleware/errorHandler')
const { getDb } = require('../config/db')
const { findById } = require('../services/userRepo')

// Get user settings
exports.getSettings = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    })
  }

  try {
    const user = await findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get user preferences from database or use defaults
    let preferences = {}
    if (user.preferences) {
      try {
        preferences = typeof user.preferences === 'string' 
          ? JSON.parse(user.preferences) 
          : user.preferences
      } catch (e) {
        preferences = {}
      }
    }

    // Default settings structure
    const settings = {
      theme: preferences.theme || 'system',
      notifications: {
        product: preferences.notifications?.product !== false,
        payments: preferences.notifications?.payments !== false,
        reports: preferences.notifications?.reports || false,
        invoices: preferences.notifications?.invoices !== false,
        customers: preferences.notifications?.customers || false,
        system: preferences.notifications?.system !== false
      },
      email: {
        invoiceReminders: preferences.email?.invoiceReminders !== false,
        paymentConfirmations: preferences.email?.paymentConfirmations !== false,
        weeklyReports: preferences.email?.weeklyReports || false
      },
      general: {
        language: preferences.general?.language || 'en',
        timezone: preferences.general?.timezone || 'Asia/Kolkata',
        dateFormat: preferences.general?.dateFormat || 'DD/MM/YYYY',
        currency: preferences.general?.currency || 'INR'
      }
    }

    res.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    })
  }
})

// Update user settings
exports.updateSettings = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id
  const { theme, notifications, email, general } = req.body

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    })
  }

  try {
    const db = getDb()
    const user = await findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get existing preferences
    let preferences = {}
    if (user.preferences) {
      try {
        preferences = typeof user.preferences === 'string' 
          ? JSON.parse(user.preferences) 
          : user.preferences
      } catch (e) {
        preferences = {}
      }
    }

    // Merge new settings with existing preferences
    if (theme !== undefined) preferences.theme = theme
    if (notifications) preferences.notifications = { ...preferences.notifications, ...notifications }
    if (email) preferences.email = { ...preferences.email, ...email }
    if (general) preferences.general = { ...preferences.general, ...general }

    // Update user preferences in database
    if (db) {
      try {
        await db('users')
          .where({ id: userId })
          .update({
            preferences: JSON.stringify(preferences),
            updated_at: new Date()
          })
      } catch (updateError) {
        // If preferences column doesn't exist, log and continue
        console.warn('Preferences column not found, update skipped:', updateError.message)
      }
    }

    // Build response with updated settings
    const updatedSettings = {
      theme: preferences.theme || 'system',
      notifications: {
        product: preferences.notifications?.product !== false,
        payments: preferences.notifications?.payments !== false,
        reports: preferences.notifications?.reports || false,
        invoices: preferences.notifications?.invoices !== false,
        customers: preferences.notifications?.customers || false,
        system: preferences.notifications?.system !== false
      },
      email: {
        invoiceReminders: preferences.email?.invoiceReminders !== false,
        paymentConfirmations: preferences.email?.paymentConfirmations !== false,
        weeklyReports: preferences.email?.weeklyReports || false
      },
      general: {
        language: preferences.general?.language || 'en',
        timezone: preferences.general?.timezone || 'Asia/Kolkata',
        dateFormat: preferences.general?.dateFormat || 'DD/MM/YYYY',
        currency: preferences.general?.currency || 'INR'
      }
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    })
  }
})

