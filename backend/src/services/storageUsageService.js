const { getDb } = require('../config/db');

/**
 * Calculate total database storage usage for a specific user
 * This includes all data created by the user across all tables
 * @param {number} userId - User ID
 * @returns {Promise<number>} Storage usage in GB
 */
async function calculateUserStorageUsage(userId) {
  const db = getDb();
  
  if (!db) {
    console.error('calculateUserStorageUsage: Database not available');
    return 0;
  }

  if (!userId) {
    return 0;
  }

  try {
    // List of tables with created_by column that belong to users
    const userDataTables = [
      { table: 'customers', column: 'created_by' },
      { table: 'invoices', column: 'created_by' },
      { table: 'payments', column: 'processed_by' },
      { table: 'payment_moms', column: 'created_by' },
      { table: 'po_entries', column: 'created_by' },
      { table: 'sales_invoice_master', column: 'created_by' },
      { table: 'user_dashboards', column: 'user_id' },
    ];

    let totalSizeBytes = 0;

    // Calculate size for each table
    for (const { table, column } of userDataTables) {
      try {
        // Check if table exists
        const tableExists = await db.raw(`
          SELECT COUNT(*) as count 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ?
        `, [table]);

        if (tableExists[0][0].count === 0) {
          continue; // Table doesn't exist, skip
        }

        // Check if column exists
        const columnExists = await db.raw(`
          SELECT COUNT(*) as count 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ? 
          AND COLUMN_NAME = ?
        `, [table, column]);

        if (columnExists[0][0].count === 0) {
          continue; // Column doesn't exist, skip
        }

        // Get row count for this user
        const userRows = await db(table)
          .where(column, userId)
          .count('* as count')
          .first();

        const rowCount = userRows?.count || 0;

        if (rowCount === 0) {
          continue; // No rows for this user
        }

        // Get average row size for this table
        const tableStats = await db.raw(`
          SELECT 
            ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS sizeMB,
            TABLE_ROWS as totalRows
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ?
        `, [table]);

        const stats = tableStats[0][0];
        const totalSizeMB = parseFloat(stats.sizeMB || 0);
        const totalRows = parseFloat(stats.totalRows || 1);

        // Calculate average row size
        const avgRowSizeBytes = totalRows > 0 
          ? (totalSizeMB * 1024 * 1024) / totalRows 
          : 0;

        // Calculate user's portion
        const userSizeBytes = avgRowSizeBytes * rowCount;
        totalSizeBytes += userSizeBytes;

      } catch (tableError) {
        // Table or column doesn't exist, skip silently
        console.warn(`Skipping table ${table}: ${tableError.message}`);
        continue;
      }
    }

    // Convert bytes to GB
    const storageGb = totalSizeBytes / (1024 * 1024 * 1024);
    
    // Round to 2 decimal places, minimum 0.01 GB for users with data
    return Math.max(0, parseFloat(storageGb.toFixed(2)));

  } catch (error) {
    console.error('Error calculating user storage usage:', error);
    return 0;
  }
}

/**
 * Calculate and update user's storage usage in the database
 * @param {number} userId - User ID
 * @returns {Promise<number>} Updated storage usage in GB
 */
async function updateUserStorageUsage(userId) {
  const db = getDb();
  
  if (!db || !userId) {
    return 0;
  }

  try {
    const storageGb = await calculateUserStorageUsage(userId);

    // Update user's storage_used field if column exists
    try {
      await db('users')
        .where({ id: userId })
        .update({
          storage_used: storageGb,
          updated_at: new Date()
        });
    } catch (updateError) {
      // Column might not exist, log and continue
      console.warn('storage_used column not found, skipping update:', updateError.message);
    }

    return storageGb;
  } catch (error) {
    console.error('Error updating user storage usage:', error);
    return 0;
  }
}

/**
 * Get quick usage stats for a user (cached or calculated)
 * @param {number} userId - User ID
 * @param {boolean} forceRecalculate - Force recalculation instead of using cached value
 * @returns {Promise<Object>} Usage stats { storageGb, storageLimitGb, usagePercent }
 */
async function getUserUsageStats(userId, forceRecalculate = false) {
  const db = getDb();
  
  if (!db || !userId) {
    return {
      storageGb: 0,
      storageLimitGb: 15,
      usagePercent: 0
    };
  }

  try {
    // Get user's plan and limits
    const user = await db('users')
      .select(
        'storage_used as storageUsed',
        'storage_limit as storageLimit',
        'plan_id as planId'
      )
      .where({ id: userId })
      .first();

    let storageGb = 0;
    let storageLimitGb = 15; // Default to free plan

    if (user) {
      // Determine storage limit based on plan
      const planId = user.planId || 'free';
      if (planId === 'classic' || planId === 'basic') {
        storageLimitGb = 50;
      } else if (planId === 'premium') {
        storageLimitGb = 999999; // Unlimited
      }

      // Use stored limit if available
      if (user.storageLimit && user.storageLimit > 0) {
        storageLimitGb = user.storageLimit;
      }

      // Calculate or use stored value
      if (forceRecalculate) {
        storageGb = await updateUserStorageUsage(userId);
      } else {
        storageGb = parseFloat(user.storageUsed || 0);
        
        // If stored value is 0 or very old, recalculate
        if (storageGb === 0) {
          storageGb = await updateUserStorageUsage(userId);
        }
      }
    } else {
      // User not found, calculate anyway
      storageGb = await calculateUserStorageUsage(userId);
    }

    // Calculate usage percentage
    const usagePercent = storageLimitGb >= 999999 
      ? 0 
      : Math.min(100, Math.round((storageGb / storageLimitGb) * 100));

    return {
      storageGb: parseFloat(storageGb.toFixed(2)),
      storageLimitGb,
      usagePercent
    };

  } catch (error) {
    console.error('Error getting user usage stats:', error);
    return {
      storageGb: 0,
      storageLimitGb: 15,
      usagePercent: 0
    };
  }
}

module.exports = {
  calculateUserStorageUsage,
  updateUserStorageUsage,
  getUserUsageStats
};

