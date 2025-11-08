const { getDb } = require('../config/db');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Parse user agent to extract browser and OS
function parseUserAgent(userAgent) {
  if (!userAgent) return { browser: 'Unknown', os: 'Unknown' };
  
  const ua = userAgent.toLowerCase();
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os') || ua.includes('macos')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  return { browser, os };
}

// Create or update session
async function createOrUpdateSession(userId, token, req) {
  const db = getDb();
  if (!db) return null;
  
  try {
    // Check if table exists (for backward compatibility)
    const tableExists = await db.schema.hasTable('user_sessions');
    if (!tableExists) {
      console.warn('user_sessions table does not exist. Please run migrations.');
      return null;
    }
    
    // Decode token to get expiration
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;
    
    // Parse user agent
    const userAgent = req.get('User-Agent') || '';
    const { browser, os } = parseUserAgent(userAgent);
    const ipAddress = req.ip || req.connection?.remoteAddress || 'Unknown';
    
    // Check if session exists for this token
    const existing = await db('user_sessions')
      .where({ session_token: token })
      .first();
    
    if (existing) {
      // Update existing session
      await db('user_sessions')
        .where({ id: existing.id })
        .update({
          last_active: db.fn.now(),
          ip_address: ipAddress,
          user_agent: userAgent,
          browser,
          os,
          expires_at: expiresAt
        });
      
      return await db('user_sessions').where({ id: existing.id }).first();
    } else {
      // Mark all other sessions for this user as not current
      await db('user_sessions')
        .where({ user_id: userId })
        .update({ is_current: 0 });
      
      // Create new session
      const [id] = await db('user_sessions').insert({
        user_id: userId,
        session_token: token,
        browser,
        os,
        ip_address: ipAddress,
        user_agent: userAgent,
        is_current: 1,
        last_active: db.fn.now(),
        expires_at: expiresAt,
        created_at: db.fn.now()
      });
      
      return await db('user_sessions').where({ id }).first();
    }
  } catch (error) {
    console.error('Error creating/updating session:', error);
    throw error;
  }
}

// Get all active sessions for a user
async function getUserSessions(userId) {
  const db = getDb();
  if (!db) return [];
  
  try {
    // Check if table exists (for backward compatibility)
    const tableExists = await db.schema.hasTable('user_sessions');
    if (!tableExists) {
      return [];
    }
    const sessions = await db('user_sessions')
      .where({ user_id: userId })
      .where(function() {
        this.whereNull('expires_at').orWhere('expires_at', '>', db.fn.now());
      })
      .orderBy('last_active', 'desc');
    
    return sessions.map(session => ({
      id: session.id,
      sessionToken: session.session_token,
      deviceType: session.device_type || 'Desktop',
      browser: session.browser || 'Unknown',
      os: session.os || 'Unknown',
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      isCurrent: session.is_current === 1,
      lastActive: session.last_active,
      createdAt: session.created_at,
      expiresAt: session.expires_at
    }));
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
}

// Delete a specific session
async function deleteSession(sessionToken) {
  const db = getDb();
  if (!db) return false;
  
  try {
    // Check if table exists (for backward compatibility)
    const tableExists = await db.schema.hasTable('user_sessions');
    if (!tableExists) {
      return false;
    }
    const deleted = await db('user_sessions')
      .where({ session_token: sessionToken })
      .delete();
    
    return deleted > 0;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}

// Delete all sessions for a user (except current if specified)
async function deleteAllUserSessions(userId, keepCurrent = false) {
  const db = getDb();
  if (!db) return 0;
  
  try {
    // Check if table exists (for backward compatibility)
    const tableExists = await db.schema.hasTable('user_sessions');
    if (!tableExists) {
      return 0;
    }
    let query = db('user_sessions').where({ user_id: userId });
    
    if (keepCurrent) {
      query = query.where({ is_current: 0 });
    }
    
    const deleted = await query.delete();
    return deleted;
  } catch (error) {
    console.error('Error deleting all user sessions:', error);
    return 0;
  }
}

// Update session last active time
async function updateSessionActivity(sessionToken) {
  const db = getDb();
  if (!db) return false;
  
  try {
    // Check if table exists (for backward compatibility)
    const tableExists = await db.schema.hasTable('user_sessions');
    if (!tableExists) {
      return false;
    }
    const updated = await db('user_sessions')
      .where({ session_token: sessionToken })
      .update({ last_active: db.fn.now() });
    
    return updated > 0;
  } catch (error) {
    console.error('Error updating session activity:', error);
    return false;
  }
}

// Clean up expired sessions
async function cleanupExpiredSessions() {
  const db = getDb();
  if (!db) return 0;
  
  try {
    const deleted = await db('user_sessions')
      .where('expires_at', '<', db.fn.now())
      .delete();
    
    return deleted;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
}

module.exports = {
  createOrUpdateSession,
  getUserSessions,
  deleteSession,
  deleteAllUserSessions,
  updateSessionActivity,
  cleanupExpiredSessions,
  parseUserAgent
};

