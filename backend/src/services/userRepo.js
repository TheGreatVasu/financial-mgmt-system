const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');

function hasDb() {
  return Boolean(getDb());
}

async function findByEmailWithPassword(email) {
  const db = getDb();
  if (!db) return null;
  // Use case-insensitive email matching
  const normalizedEmail = email?.toLowerCase().trim();
  if (!normalizedEmail) return null;
  return db('users').whereRaw('LOWER(email) = ?', [normalizedEmail]).first();
}

async function findById(id) {
  const db = getDb();
  if (!db) {
    console.error('findById: Database not available');
    return null;
  }
  
  try {
    // First, try to get basic user info
    let user = await db('users')
      .select('id', 'username', 'email', 'phone_number as phoneNumber', 'first_name as firstName', 'last_name as lastName', 'role', 'is_active as isActive', 'last_login as lastLogin')
      .where({ id })
      .first();
    
    if (!user) {
      return null;
    }
    
    // Try to get subscription/billing fields if they exist
    try {
      const subscriptionFields = await db('users')
        .select(
          'plan_id as planId',
          'plan_name as planName',
          'plan_price as planPrice',
          'plan_interval as planInterval',
          'storage_used as storageUsed',
          'storage_limit as storageLimit',
          'invoices_this_month as invoicesThisMonth',
          'invoice_limit as invoiceLimit',
          'billing_status as billingStatus',
          'billing_renews_at as billingRenewsAt',
          'payment_method as paymentMethod'
        )
        .where({ id })
        .first();
      
      if (subscriptionFields) {
        Object.assign(user, subscriptionFields);
      }
    } catch (columnError) {
      // Subscription columns don't exist yet, set defaults
      console.warn('Subscription columns not found, using defaults:', columnError.message);
      user.planId = 'free';
      user.planName = 'Free';
      user.planPrice = 0;
      user.planInterval = 'mo';
      user.storageUsed = 0;
      user.storageLimit = 15;
      user.invoicesThisMonth = 0;
      user.invoiceLimit = 50;
      user.billingStatus = 'active';
      user.billingRenewsAt = null;
      user.paymentMethod = null;
    }
    
    // Try to get additional fields if they exist (for backward compatibility)
    try {
      const extendedUser = await db('users')
        .select('avatar_url as avatarUrl', 'preferences')
        .where({ id })
        .first();
      
      if (extendedUser) {
        user.avatarUrl = extendedUser.avatarUrl || null;
        if (extendedUser.preferences) {
          try {
            user.preferences = typeof extendedUser.preferences === 'string' 
              ? JSON.parse(extendedUser.preferences) 
              : extendedUser.preferences;
          } catch (e) {
            user.preferences = {};
          }
        } else {
          user.preferences = {};
        }
      } else {
        user.avatarUrl = null;
        user.preferences = {};
      }
    } catch (columnError) {
      // Columns don't exist yet (migration not run), set defaults
      console.warn('Extended user columns not found, using defaults:', columnError.message);
      user.avatarUrl = null;
      user.preferences = {};
    }
    
    return user;
  } catch (error) {
    console.error('Error in findById:', error);
    throw error;
  }
}

async function findByEmail(email) {
  const db = getDb();
  if (!db) return null;
  // Use case-insensitive email matching like findByEmailWithPassword
  const normalizedEmail = email?.toLowerCase().trim();
  if (!normalizedEmail) return null;
  return db('users')
    .select('id','username','email','first_name as firstName','last_name as lastName','role','is_active as isActive','last_login as lastLogin')
    .whereRaw('LOWER(email) = ?', [normalizedEmail])
    .first();
}

async function isEmailTaken(email, excludeId) {
  const db = getDb();
  if (!db) return false;
  const q = db('users').where({ email });
  if (excludeId) q.andWhereNot({ id: excludeId });
  const row = await q.first('id');
  return Boolean(row);
}

async function isPhoneTaken(phoneNumber, excludeId) {
  const db = getDb();
  if (!db) return false;
  if (!phoneNumber) return false;
  const q = db('users').where({ phone_number: phoneNumber });
  if (excludeId) q.andWhereNot({ id: excludeId });
  const row = await q.first('id');
  return Boolean(row);
}

async function createUser({ username, email, password, firstName, lastName, phoneNumber, role = 'user' }) {
  const db = getDb();
  if (!db) {
    console.error('❌ createUser: Database not available');
    return null;
  }
  
  if (!password || password.length < 8) {
    console.error('❌ createUser: Invalid password provided');
    throw new Error('Password must be at least 8 characters long');
  }
  
  try {
    const hash = await bcrypt.hash(password, 12);
    // Accept both old role format (admin, user, company) and new professional roles (business_user, company_admin, system_admin)
    const validRoles = ['admin', 'user', 'company', 'business_user', 'company_admin', 'system_admin'];
    const userRole = validRoles.includes(role) ? role : 'business_user';
    
    if (!validRoles.includes(userRole)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }
    
    console.log(`Creating user in database: email=${email}, username=${username}, phone=${phoneNumber || 'N/A'}, role=${userRole}`);
    
    const userData = {
      username,
      email,
      password_hash: hash,
      first_name: firstName,
      last_name: lastName,
      role: userRole,
      is_active: 1,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    };
    
    // Add phone number if provided
    if (phoneNumber) {
      userData.phone_number = phoneNumber;
    }
    
    const [id] = await db('users').insert(userData);
    
    console.log(`✅ User inserted with ID: ${id}`);
    
    // If company role, create company-specific database
    if (userRole === 'company') {
      try {
        await createCompanyDatabase(id, email, username);
      } catch (dbError) {
        console.error(`Failed to create company database for user ${id}:`, dbError);
        // Don't fail user creation if company DB creation fails
      }
    }
    
    const createdUser = await findById(id);
    return createdUser;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
}

async function createOrGetGoogleUser({ email, firstName, lastName }) {
  const db = getDb();
  if (!db) {
    console.error('❌ createOrGetGoogleUser: Database not available');
    return null;
  }
  
  // Normalize email for lookup
  const normalizedEmail = email?.toLowerCase().trim();
  if (!normalizedEmail) {
    console.error('❌ createOrGetGoogleUser: Invalid email provided');
    return null;
  }
  
  // Check if user already exists (case-insensitive)
  const existing = await db('users')
    .whereRaw('LOWER(email) = ?', [normalizedEmail])
    .first();
  
  if (existing) {
    return await findById(existing.id);
  }
  
  // Generate username from email
  const username = normalizedEmail.split('@')[0].slice(0, 30).replace(/[^a-zA-Z0-9_]/g, '_');
  
  try {
    
    const [id] = await db('users').insert({
      username,
      email: normalizedEmail,
      password_hash: null, // NULL for Google OAuth users (no password)
      first_name: firstName || '',
      last_name: lastName || '',
      role: 'user',
      is_active: 1,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });
    
    return await findById(id);
  } catch (error) {
    console.error('❌ Error creating Google user:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    throw error;
  }
}

async function updateProfileById(id, { firstName, lastName, email, phoneNumber, avatarUrl, role }) {
  const db = getDb();
  if (!db) return null;
  const updateData = {
    updated_at: db.fn.now()
  };
  if (firstName !== undefined) updateData.first_name = firstName;
  if (lastName !== undefined) updateData.last_name = lastName;
  if (email !== undefined) updateData.email = email;
  if (phoneNumber !== undefined) updateData.phone_number = phoneNumber;
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
  if (role !== undefined) {
    const validRoles = ['admin', 'user', 'company', 'business_user', 'company_admin', 'system_admin'];
    if (validRoles.includes(role)) {
      updateData.role = role;
    } else {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }
  }
  
  try {
    await db('users').where({ id }).update(updateData);
    return await findById(id);
  } catch (error) {
    // Re-throw with more context for role column issues
    if (error.message && (error.message.includes('Data truncated for column \'role\'') || 
        error.message.includes('role') && error.code === 'ER_DATA_TOO_LONG')) {
      // Try to automatically fix the schema by running the migration
      console.warn('⚠️ Role column truncation detected. Attempting to fix schema automatically...');
      
      try {
        // Simple fix: Convert role column to VARCHAR(255)
        await db.raw(`
          ALTER TABLE users 
          MODIFY COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user'
        `);
        console.log('✅ Successfully fixed role column schema automatically');
        
        // Retry the update
        await db('users').where({ id }).update(updateData);
        return await findById(id);
      } catch (fixError) {
        console.error('❌ Failed to auto-fix role column:', fixError);
        const dbError = new Error('Database schema error: Role column is too small. The system attempted to fix it automatically but failed. Please run the migration manually or contact your administrator.');
        dbError.originalError = error;
        dbError.fixError = fixError.message;
        dbError.code = 'ROLE_COLUMN_TRUNCATION';
        throw dbError;
      }
    }
    throw error;
  }
}

async function updateGoogleTokens(userId, { accessToken, refreshToken, expiresAt }) {
  const db = getDb();
  if (!db) return null;
  
  const updateData = {
    updated_at: db.fn.now()
  };
  if (accessToken !== undefined) updateData.google_access_token = accessToken;
  if (refreshToken !== undefined) updateData.google_refresh_token = refreshToken;
  if (expiresAt !== undefined) updateData.google_token_expires_at = expiresAt;
  
  try {
    await db('users').where({ id: userId }).update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating Google tokens:', error);
    throw error;
  }
}

async function getGoogleTokens(userId) {
  const db = getDb();
  if (!db) return null;
  
  try {
    const user = await db('users')
      .select('google_access_token', 'google_refresh_token', 'google_token_expires_at')
      .where({ id: userId })
      .first();
    
    if (!user) return null;
    
    return {
      accessToken: user.google_access_token,
      refreshToken: user.google_refresh_token,
      expiresAt: user.google_token_expires_at
    };
  } catch (error) {
    console.error('Error getting Google tokens:', error);
    return null;
  }
}

async function updateUserPreferences(id, preferences) {
  const db = getDb();
  if (!db) return null;
  await db('users').where({ id }).update({
    preferences: JSON.stringify(preferences),
    updated_at: db.fn.now()
  });
  return await findById(id);
}

async function updateLastLogin(id) {
  const db = getDb();
  if (!db) return;
  await db('users').where({ id }).update({ last_login: db.fn.now(), updated_at: db.fn.now() });
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

async function changePassword(id, newPassword) {
  const db = getDb();
  if (!db) return;
  const hash = await bcrypt.hash(newPassword, 12);
  await db('users').where({ id }).update({ password_hash: hash, updated_at: db.fn.now() });
}

async function createCompanyDatabase(userId, email, username) {
  const db = getDb();
  if (!db) return;
  
  // Create a sanitized database name from company email/username
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase().substring(0, 30);
  const dbName = `company_${userId}_${sanitizedUsername}`;
  
  try {
    // Create the database
    await db.raw(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Created company database: ${dbName} for user ${userId}`);
    
    // Create company_databases table if it doesn't exist
    try {
      await db.schema.createTable('company_databases', (table) => {
        table.bigInteger('user_id').unsigned().primary();
        table.string('database_name', 100).notNullable().unique();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      });
      console.log('✅ Created company_databases table');
    } catch (tableError) {
      // Table might already exist, which is fine
      if (!tableError.message.includes('already exists')) {
        console.warn('Error creating company_databases table:', tableError.message);
      }
    }
    
    // Store the database name (use insert with ignore or update)
    try {
      await db('company_databases').insert({
        user_id: userId,
        database_name: dbName,
        created_at: db.fn.now()
      });
    } catch (insertError) {
      // If record exists, update it
      if (insertError.code === 'ER_DUP_ENTRY' || insertError.message.includes('Duplicate')) {
        await db('company_databases').where({ user_id: userId }).update({
          database_name: dbName,
          created_at: db.fn.now()
        });
      } else {
        throw insertError;
      }
    }
    
  } catch (error) {
    console.error(`Error creating company database ${dbName}:`, error);
    throw error;
  }
}

async function getCompanyDatabaseName(userId) {
  const db = getDb();
  if (!db) return null;
  const result = await db('company_databases').where({ user_id: userId }).first();
  return result ? result.database_name : null;
}

async function getAllUsers() {
  const db = getDb();
  if (!db) return [];
  return db('users')
    .select('id', 'username', 'email', 'first_name as firstName', 'last_name as lastName', 'role', 'is_active as isActive', 'last_login as lastLogin', 'created_at as createdAt', 'updated_at as updatedAt')
    .orderBy('created_at', 'desc');
}

async function audit({ action, entity, entityId, performedBy, ipAddress, userAgent, changes }) {
  const db = getDb();
  if (!db) return; // no-op in mock mode
  try {
    await db('audit_logs').insert({
      action,
      entity,
      entity_id: entityId,
      performed_by: performedBy,
      ip_address: ipAddress,
      user_agent: userAgent,
      changes: changes ? JSON.stringify(changes) : null,
      created_at: db.fn.now(),
    });
  } catch (e) {
    // Silently ignore if table is missing to avoid blocking critical flows
  }
}

/**
 * Initialize a user's dashboard when they first register/login
 * Creates a dashboard record in user_dashboards table with default configuration
 * @param {number} userId - The user ID
 * @returns {Promise<boolean>} - Returns true if dashboard was initialized, false otherwise
 */
async function initializeUserDashboard(userId) {
  const db = getDb();
  if (!db) {
    console.warn('initializeUserDashboard: Database not available');
    return false;
  }
  
  try {
    // Check if dashboard already exists
    const existing = await db('user_dashboards')
      .where({ user_id: userId })
      .first();
    
    if (existing) {
      console.log(`Dashboard already exists for user ${userId}`);
      return true;
    }
    
    // Create default dashboard configuration
    const defaultConfig = {
      widgets: [],
      layout: 'default',
      preferences: {
        refreshInterval: 30, // seconds
        showEmptyStates: true,
        defaultView: 'overview'
      }
    };
    
    // Insert new dashboard record
    await db('user_dashboards').insert({
      user_id: userId,
      dashboard_config: JSON.stringify(defaultConfig),
      is_initialized: 1,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });
    
    return true;
  } catch (error) {
    if (error.message && error.message.includes("doesn't exist")) {
      console.warn('user_dashboards table missing. Run migration.');
      return false;
    }
    console.error('Dashboard init failed:', error.message);
    return false;
  }
}

module.exports = {
  hasDb,
  findByEmailWithPassword,
  findById,
  findByEmail,
  isEmailTaken,
  isPhoneTaken,
  createUser,
  createOrGetGoogleUser,
  updateProfileById,
  updateUserPreferences,
  updateLastLogin,
  comparePassword,
  changePassword,
  audit,
  createCompanyDatabase,
  getCompanyDatabaseName,
  getAllUsers,
  initializeUserDashboard,
};


