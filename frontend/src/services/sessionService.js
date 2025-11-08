import { createApiClient } from './apiClient';

export async function getSessions(token) {
  const api = createApiClient(token);
  try {
    const { data } = await api.get('/auth/sessions');
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch sessions');
    return data.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch sessions';
    throw new Error(errorMessage);
  }
}

export async function logoutSession(token, sessionToken) {
  const api = createApiClient(token);
  try {
    const { data } = await api.delete(`/auth/sessions/${sessionToken}`);
    if (!data?.success) throw new Error(data?.message || 'Failed to logout session');
    return true;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to logout session';
    throw new Error(errorMessage);
  }
}

export async function logoutAllSessions(token) {
  const api = createApiClient(token);
  try {
    const { data } = await api.delete('/auth/sessions');
    if (!data?.success) throw new Error(data?.message || 'Failed to logout all sessions');
    return true;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to logout all sessions';
    throw new Error(errorMessage);
  }
}

export async function updateSessionActivity(token) {
  const api = createApiClient(token);
  try {
    await api.post('/auth/sessions/activity');
  } catch (err) {
    // Silently fail - activity updates are not critical
    console.warn('Failed to update session activity:', err);
  }
}

// Format time ago
export function formatTimeAgo(dateString) {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  // Format as date if older
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

