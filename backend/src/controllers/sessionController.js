const { asyncHandler } = require('../middlewares/errorHandler');
const { getUserSessions, deleteSession, deleteAllUserSessions, updateSessionActivity } = require('../services/sessionRepo');
const { getIOInstance } = require('../services/socketService');
const { audit } = require('../services/userRepo');

// @desc    Get all active sessions for current user
// @route   GET /api/auth/sessions
// @access  Private
const getSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const sessions = await getUserSessions(userId);
  
  res.json({
    success: true,
    data: sessions
  });
});

// @desc    Logout from a specific session
// @route   DELETE /api/auth/sessions/:sessionToken
// @access  Private
const logoutSession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionToken } = req.params;
  
  // Verify the session belongs to the user
  const sessions = await getUserSessions(userId);
  const session = sessions.find(s => s.sessionToken === sessionToken);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }
  
  // Delete the session
  const deleted = await deleteSession(sessionToken);
  
  if (!deleted) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete session'
    });
  }
  
  // Broadcast session update via Socket.io
  const io = getIOInstance();
  if (io) {
    const updatedSessions = await getUserSessions(userId);
    io.to(`user:${userId}`).emit('sessions:update', updatedSessions);
  }
  
  // Log the action
  await audit({
    action: 'logout',
    entity: 'session',
    entityId: session.id,
    performedBy: userId,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    changes: { sessionToken, device: `${session.browser} on ${session.os}` }
  });
  
  res.json({
    success: true,
    message: 'Session logged out successfully'
  });
});

// @desc    Logout from all devices
// @route   DELETE /api/auth/sessions
// @access  Private
const logoutAllSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const currentToken = req.header('Authorization')?.replace('Bearer ', '');
  
  // Delete all sessions except current (if keepCurrent is true)
  const deleted = await deleteAllUserSessions(userId, true);
  
  // Also delete current session if it exists
  if (currentToken) {
    await deleteSession(currentToken);
  }
  
  // Broadcast session update via Socket.io
  const io = getIOInstance();
  if (io) {
    const updatedSessions = await getUserSessions(userId);
    io.to(`user:${userId}`).emit('sessions:update', updatedSessions);
    // Also disconnect all sockets for this user
    io.to(`user:${userId}`).emit('sessions:logout-all');
  }
  
  // Log the action
  await audit({
    action: 'logout',
    entity: 'session',
    entityId: userId,
    performedBy: userId,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    changes: { action: 'logout_all', sessionsDeleted: deleted + 1 }
  });
  
  res.json({
    success: true,
    message: 'Logged out from all devices successfully',
    data: { sessionsDeleted: deleted + 1 }
  });
});

// @desc    Update session activity
// @route   POST /api/auth/sessions/activity
// @access  Private
const updateActivity = asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const userId = req.user.id;
  
  if (token) {
    await updateSessionActivity(token);
    
    // Broadcast session update via Socket.io
    const io = getIOInstance();
    if (io) {
      const sessions = await getUserSessions(userId);
      io.to(`user:${userId}`).emit('sessions:update', sessions);
    }
  }
  
  res.json({
    success: true,
    message: 'Activity updated'
  });
});

module.exports = {
  getSessions,
  logoutSession,
  logoutAllSessions,
  updateActivity
};

