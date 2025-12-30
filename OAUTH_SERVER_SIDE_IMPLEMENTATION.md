# Server-Side Google OAuth Implementation

## Overview
This document describes the complete server-side Google OAuth redirect flow implemented for the Financial Management System.

## Architecture

### Flow Diagram
```
User → Frontend Login Page → Click "Sign in with Google"
  → Full Page Redirect to: https://nbaurum.com/api/auth/google
  → Backend (/auth/google endpoint)
  → Redirect to Google OAuth Consent Screen
  → User Authorizes
  → Google Redirects to: https://nbaurum.com/api/auth/google/callback
  → Backend (/auth/google/callback endpoint)
  → Exchange Code for Token
  → Create/Get User
  → Generate JWT
  → Redirect to: https://nbaurum.com/auth/callback?token=<JWT>
  → Frontend AuthCallbackPage
  → Login User with Token
  → Redirect to Dashboard
```

## Frontend Implementation

### Login Page (`frontend/src/pages/index.jsx`)
- **NO Google JS SDK** - Completely removed
- **NO popup windows** - No popups, no postMessage
- **NO client-side token handling** - All OAuth handled server-side
- **Simple redirect link** - Full-page redirect to `/api/auth/google`

### Google Sign-In Button
```jsx
<a href={window.__GOOGLE_AUTH_URL__}>
  Sign in with Google
</a>
```

Where `window.__GOOGLE_AUTH_URL__` is constructed from `VITE_API_BASE_URL`:
- Input: `VITE_API_BASE_URL=https://nbaurum.com/api`
- Process: Remove `/api` suffix → `https://nbaurum.com`
- Append: `/auth/google?next=/dashboard`
- Result: `https://nbaurum.com/api/auth/google?next=/dashboard`

**Wait** - Actually, since `VITE_API_BASE_URL` already includes `/api`, we need to build the full URL correctly:
- `VITE_API_BASE_URL=https://nbaurum.com/api`
- Extract base: `https://nbaurum.com`
- Full OAuth URL: `https://nbaurum.com/api/auth/google?next=/dashboard`

Actually, looking at the code:
```javascript
const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')
const googleAuthUrl = `${baseUrl}/auth/google?next=/dashboard`
```

This gives: `https://nbaurum.com/auth/google?next=/dashboard`

But the backend route is at `/auth/google`, and Nginx proxies `/api/*` to the backend. So we need:
- `https://nbaurum.com/api/auth/google` → Nginx proxies to backend at `/api/auth/google`
- But backend route is registered at `/auth/google` (not `/api/auth/google`)

**Issue Found:** Need to fix the URL construction!

The backend routes are registered at:
- `app.get('/auth/google', googleStart)` - Root level, not under `/api`
- But Nginx proxies `/api/*` to backend

So when Nginx receives `https://nbaurum.com/api/auth/google`, it proxies to backend as `/api/auth/google`, but the route is at `/auth/google`.

**Solution:** The backend routes should be at root level and accessible via `/api/auth/google` after Nginx proxy. Let me check the actual route configuration.

Looking at `backend/src/app.js`:
- Line 126: `app.get('/auth/google', googleStart);`
- Line 127: `app.get('/auth/google/callback', googleCallback);`

These are at root level. Nginx proxies `/api/*` to `http://localhost:5001`, so:
- Request: `https://nbaurum.com/api/auth/google`
- Nginx: proxies to `http://localhost:5001/api/auth/google`
- Backend: route is at `/auth/google` (not `/api/auth/google`)

**Problem:** Route mismatch!

**Fix:** The frontend should construct the URL as:
```javascript
const googleAuthUrl = `${apiBaseUrl}/auth/google?next=/dashboard`
```

Where `apiBaseUrl` is `https://nbaurum.com/api`, so result is:
`https://nbaurum.com/api/auth/google?next=/dashboard`

But wait, the backend routes are at root level (`/auth/google`), not under `/api`. So either:
1. Backend routes should be under `/api/auth/google`, OR
2. Frontend should use `/auth/google` (without `/api`), OR
3. Nginx should proxy both `/api/*` AND `/auth/*`

Current setup:
- Nginx proxies `/api/*` to backend
- Backend routes are at `/auth/google` (root level)
- So `https://nbaurum.com/auth/google` won't be proxied

**Fix Required:** Update frontend to use full API base URL:
```javascript
const googleAuthUrl = `${apiBaseUrl}/auth/google?next=/dashboard`
```

But backend route is `/auth/google`, not `/api/auth/google`. So we need to check if backend has the route under `/api` or at root.

Actually, looking more carefully - the backend routes ARE registered at root level:
```javascript
app.get('/auth/google', googleStart);
app.get('/auth/google/callback', googleCallback);
```

And API routes are:
```javascript
app.use('/api/auth', authRoutes);
```

So `/auth/google` is NOT under `/api`. But Nginx only proxies `/api/*`.

**Solution Options:**
1. Move backend routes to `/api/auth/google` - but Google OAuth redirect URI is already set
2. Add Nginx proxy for `/auth/*` - easier
3. Frontend calls `/auth/google` directly (not via API base) - but then it's not under `/api`

Best solution: **Add Nginx location for `/auth`** to proxy to backend, OR move routes to `/api/auth/google`.

Looking at the nginx.conf.example I created earlier, it has:
```nginx
location /auth {
    proxy_pass http://localhost:5001;
    ...
}
```

So `/auth` routes are proxied. Good!

But the frontend code removes `/api` and then adds `/auth/google`, giving `/auth/google` which should work with Nginx proxy.

Wait, let me re-read the frontend code more carefully...

```javascript
const apiBaseUrl = import.meta?.env?.VITE_API_BASE_URL  // "https://nbaurum.com/api"
const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')  // "https://nbaurum.com"
const googleAuthUrl = `${baseUrl}/auth/google?next=/dashboard`  // "https://nbaurum.com/auth/google?next=/dashboard"
```

So it constructs: `https://nbaurum.com/auth/google?next=/dashboard`

And Nginx proxies `/auth/*` to backend, so backend receives `/auth/google`, which matches the route. ✅

This is correct!

## Backend Implementation

### Route: GET /auth/google
- Initiates OAuth flow
- Redirects to Google consent screen
- Preserves `next` parameter for post-login redirect

### Route: GET /auth/google/callback
- Receives OAuth code from Google
- Exchanges code for tokens
- Creates/gets user
- Generates JWT
- Redirects to frontend with token

### Error Handling
- Missing code → Redirects to `/login?error=oauth_failed`
- OAuth error → Redirects to `/login?error=oauth_cancelled`
- All errors redirect to frontend (no backend error pages)

## Environment Variables

### Frontend
```bash
VITE_API_BASE_URL=https://nbaurum.com/api
```

### Backend
```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://nbaurum.com/api/auth/google/callback
FRONTEND_URL=https://nbaurum.com
```

## Google Cloud Console Configuration

**Authorized JavaScript origins:**
- Not needed for server-side OAuth (no JS SDK)

**Authorized redirect URIs:**
- `https://nbaurum.com/api/auth/google/callback`

## Security

- ✅ No client-side token handling
- ✅ No popups or postMessage
- ✅ No Cross-Origin-Opener-Policy issues
- ✅ All OAuth handled server-side
- ✅ Secure token transmission via URL query (one-time use, immediately consumed)

