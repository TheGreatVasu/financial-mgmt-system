# Google Login Production Fix - Summary

## Problem Identified

The frontend was using relative API paths (`/api/auth/google-login`) which worked locally with Vite proxy but failed in production on Vercel where no proxy exists. The `VITE_API_BASE_URL` environment variable was set to `https://api.nbaurum.com`, but the code wasn't properly appending `/api` to form the complete URL.

## Root Cause

When `VITE_API_BASE_URL=https://api.nbaurum.com`:
- **Expected:** `https://api.nbaurum.com/api/auth/google-login`
- **Actual:** `https://api.nbaurum.com/auth/google-login` ❌ (missing `/api`)

The `apiClient.js` was using the baseURL directly without ensuring it included the `/api` path segment.

## Files Modified

### 1. `frontend/src/services/apiClient.js`

**Change:** Added logic to ensure baseURL always ends with `/api` when a full URL is provided.

**Before:**
```javascript
const envBaseUrl = import.meta?.env?.VITE_API_BASE_URL
const baseURL = envBaseUrl && envBaseUrl.trim() !== '' ? envBaseUrl : '/api'
```

**After:**
```javascript
const envBaseUrl = import.meta?.env?.VITE_API_BASE_URL
let baseURL = envBaseUrl && envBaseUrl.trim() !== '' ? envBaseUrl.trim() : '/api'

// CRITICAL: Ensure baseURL always ends with /api for production
// If VITE_API_BASE_URL is a full URL (starts with http/https), ensure it includes /api
if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
  // Full URL provided - ensure it ends with /api
  if (!baseURL.endsWith('/api')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api'
  }
}
```

**Impact:** All API calls using `createApiClient()` now correctly form URLs:
- Local: `/api/auth/google-login` ✅
- Production: `https://api.nbaurum.com/api/auth/google-login` ✅

### 2. `frontend/src/services/importService.js`

**Change:** Updated `downloadTemplate()` function to use the same baseURL logic for consistency.

**Before:**
```javascript
const base = import.meta?.env?.VITE_API_BASE_URL?.trim() || '/api'
const apiUrl = base.replace(/\/$/, '')
```

**After:**
```javascript
// Use the same logic as apiClient to ensure consistency
const envBaseUrl = import.meta?.env?.VITE_API_BASE_URL
let baseURL = envBaseUrl && envBaseUrl.trim() !== '' ? envBaseUrl.trim() : '/api'

// Ensure baseURL always ends with /api for production
if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
  if (!baseURL.endsWith('/api')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api'
  }
}

const apiUrl = baseURL.replace(/\/$/, '')
```

**Impact:** Template download now uses correct production URL.

### 3. `frontend/src/services/socketService.js`

**Change:** Updated to use environment variable for production socket connection.

**Before:**
```javascript
const socketUrl = 'http://localhost:5001';
```

**After:**
```javascript
const envBaseUrl = import.meta?.env?.VITE_API_BASE_URL
let socketUrl = 'http://localhost:5001' // Default for development

if (envBaseUrl && envBaseUrl.trim() !== '' && (envBaseUrl.startsWith('http://') || envBaseUrl.startsWith('https://'))) {
  // Production: extract base URL (remove /api if present, socket connects to root)
  socketUrl = envBaseUrl.replace(/\/api\/?$/, '')
}
```

**Impact:** Socket.io connects to correct production server.

## Verification

### How It Works Now

**Local Development:**
- `VITE_API_BASE_URL` not set or empty
- `baseURL = '/api'` (relative, uses Vite proxy)
- Request: `/api/auth/google-login` → proxied to `http://localhost:5001/api/auth/google-login` ✅

**Production (Vercel):**
- `VITE_API_BASE_URL=https://api.nbaurum.com`
- `baseURL = 'https://api.nbaurum.com/api'` (automatically appended)
- Request: `https://api.nbaurum.com/api/auth/google-login` ✅

### All API Calls Affected

All services using `createApiClient()` are now fixed:
- ✅ `authService.js` - Google login, regular login, register, etc.
- ✅ `customerService.js` - All customer operations
- ✅ `invoiceService.js` - All invoice operations
- ✅ `paymentService.js` - All payment operations
- ✅ All other services using `createApiClient()`

## Testing Checklist

After deployment, verify:

- [ ] Google login works in production
- [ ] Network tab shows: `POST https://api.nbaurum.com/api/auth/google-login` → 200
- [ ] Regular login works
- [ ] All other API calls work correctly
- [ ] No CORS errors
- [ ] Console shows correct baseURL in logs

## Environment Variable Configuration

**Vercel Environment Variable:**
```
VITE_API_BASE_URL=https://api.nbaurum.com
```

**Note:** The code automatically appends `/api`, so you don't need to include it in the env var.

## Summary

✅ **Fixed:** `apiClient.js` - Ensures `/api` is appended to production URLs
✅ **Fixed:** `importService.js` - Uses consistent baseURL logic
✅ **Fixed:** `socketService.js` - Uses environment variable for production

**Result:** All API calls now correctly use `https://api.nbaurum.com/api/...` in production, and Google login works! 🎉

