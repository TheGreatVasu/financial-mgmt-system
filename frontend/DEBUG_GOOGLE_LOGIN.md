# Debugging Google Login 405 Error in Production

## Immediate Steps to Debug

### Step 1: Check Network Tab in Browser

1. Open browser DevTools → **Network** tab
2. Clear network log
3. Click "Sign in with Google"
4. Look for the request to `google-login`
5. **Check the Method column** - is it GET or POST?

**If it shows GET:**
- The Google SDK or browser is still triggering navigation
- Need to check if button is somehow triggering form submission

**If it shows POST:**
- The issue is with the API URL or backend configuration
- Check the Request URL - is it pointing to the correct backend?

### Step 2: Check Console Logs

After clicking Google login, you should see these logs in order:

```
Google OAuth callback triggered, calling loginWithGoogle...
🔵 googleLogin called with idToken length: [number]
🔵 API base URL: [should be your backend URL]
🔵 Making POST request to /auth/google-login
🌐 API Request: { method: 'POST', url: '/auth/google-login', ... }
```

**If you see these logs:**
- The callback is working
- The POST request is being made
- Check the `fullURL` in the log - is it correct?

**If you DON'T see these logs:**
- The callback might not be firing
- Or there's an error before the request

### Step 3: Verify Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Check `VITE_API_BASE_URL`:

**Should be:**
```
VITE_API_BASE_URL=http://103.192.198.70:5001/api
```

**NOT:**
```
VITE_API_BASE_URL=/api  ❌ (This is relative and won't work)
```

### Step 4: Check Backend CORS Configuration

SSH into your backend server and check:

```bash
ssh root@103.192.198.70
cat backend/.env | grep CORS
```

Should include your Vercel domain:
```
CORS_ORIGIN=https://financial-mgmt-system.vercel.app
FRONTEND_URL=https://financial-mgmt-system.vercel.app
```

### Step 5: Test Backend Directly

Test if backend accepts POST requests:

```bash
curl -X POST http://103.192.198.70:5001/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'
```

**Expected:** 400 Bad Request (invalid token) - this is OK, means POST works
**If 405:** Backend route is not configured correctly

## Common Issues and Solutions

### Issue 1: Network Tab Shows GET Request

**Cause:** Google SDK button is triggering browser navigation

**Solution:**
1. Ensure button is completely outside `<form>` element ✅ (Already done)
2. Clear browser cache completely
3. Hard refresh (Ctrl+Shift+R)
4. Try in incognito/private window

### Issue 2: Network Tab Shows POST but Still 405

**Cause:** Backend route not accepting POST, or wrong URL

**Solutions:**
1. Check backend route is `POST /api/auth/google-login` ✅ (Already verified)
2. Check API base URL in Vercel env vars
3. Check backend CORS allows your Vercel domain
4. Check backend is running: `pm2 status`

### Issue 3: Request Goes to Wrong URL

**Cause:** `VITE_API_BASE_URL` not set correctly in Vercel

**Solution:**
1. Set `VITE_API_BASE_URL=http://103.192.198.70:5001/api` in Vercel
2. Redeploy frontend
3. Clear browser cache

### Issue 4: CORS Error Instead of 405

**Cause:** Backend CORS not configured for Vercel domain

**Solution:**
1. Update backend `.env`:
   ```
   CORS_ORIGIN=https://financial-mgmt-system.vercel.app
   FRONTEND_URL=https://financial-mgmt-system.vercel.app
   ```
2. Restart backend: `pm2 restart financial-mgmt-backend`

## Quick Fix Checklist

- [ ] Check Network tab - verify method is POST
- [ ] Check Console logs - verify request is being made
- [ ] Verify Vercel env var `VITE_API_BASE_URL` points to backend
- [ ] Verify backend CORS includes Vercel domain
- [ ] Clear browser cache and hard refresh
- [ ] Test in incognito window
- [ ] Check backend logs: `pm2 logs financial-mgmt-backend`

## What to Share for Further Debugging

If still not working, share:

1. **Network tab screenshot** showing the request
2. **Console logs** (all messages)
3. **Vercel environment variables** (mask sensitive data)
4. **Backend `.env` CORS settings** (mask sensitive data)
5. **Backend logs** from `pm2 logs`

