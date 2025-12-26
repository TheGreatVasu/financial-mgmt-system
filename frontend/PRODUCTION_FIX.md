# Production Google OAuth Fix

## Issues Found

1. **Button Width Warning**: Google SDK doesn't accept `width: '100%'` - must use pixel value
2. **405 Error**: GET request still being sent instead of POST
3. **API Base URL**: May need to be configured for production

## Fixes Applied

### 1. Fixed Button Width
Changed from percentage to pixel value:
```javascript
const buttonWidth = buttonElement.offsetWidth || 350
window.google.accounts.id.renderButton(buttonElement, {
  width: buttonWidth, // Pixel value, not percentage
  // ...
})
```

### 2. Added Event Prevention
Added event listeners to prevent form submission:
```javascript
buttonElement.addEventListener('click', preventNavigation, true)
buttonElement.addEventListener('mousedown', preventNavigation, true)
```

### 3. Enhanced Callback Logging
Added console logs to track the flow:
```javascript
console.log('Google OAuth callback triggered, calling loginWithGoogle...')
const result = await loginWithGoogle(response.credential)
console.log('Google login successful:', result)
```

## Production Deployment Steps

### Step 1: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Ensure these are set:

```
VITE_API_BASE_URL=http://103.192.198.70:5001/api
# OR if you have a domain:
# VITE_API_BASE_URL=https://api.yourdomain.com/api

VITE_GOOGLE_CLIENT_ID=164420722133-eej1e9l4i79acmfd1r2ghrk377l2thi6.apps.googleusercontent.com
```

**Important**: 
- Use your actual backend server IP/domain
- Include the port `:5001` if not using a reverse proxy
- Include `/api` at the end

### Step 2: Redeploy Frontend

After updating environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Or push new code to trigger automatic deployment

### Step 3: Verify Network Requests

After deployment, test Google login and check browser Network tab:

**Expected:**
```
OPTIONS /api/auth/google-login → 204
POST /api/auth/google-login → 200
```

**Should NOT see:**
```
GET /api/auth/google-login → 405 ❌
```

## Debugging in Production

### Check Console Logs

After clicking "Sign in with Google", you should see:
```
Google OAuth callback triggered, calling loginWithGoogle...
Google login successful: { user: {...}, token: "..." }
```

### Check Network Tab

1. Open browser DevTools → Network tab
2. Click "Sign in with Google"
3. Filter by "google-login"
4. Verify:
   - Method: **POST** (not GET)
   - Status: **200** (not 405)
   - Request Payload: `{ "idToken": "..." }`

### Common Issues

**Issue: Still seeing GET requests**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check if old code is cached

**Issue: CORS errors**
- Verify backend CORS_ORIGIN includes your Vercel domain
- Check backend allows your frontend origin

**Issue: 404 Not Found**
- Verify VITE_API_BASE_URL is correct
- Check backend is running and accessible
- Test backend health endpoint: `http://103.192.198.70:5001/health`

## Verification Checklist

- [ ] Vercel environment variables updated
- [ ] Frontend redeployed
- [ ] Browser cache cleared
- [ ] Network tab shows POST request (not GET)
- [ ] Status code is 200 (not 405)
- [ ] Console shows success logs
- [ ] User successfully logs in

## If Still Not Working

1. **Check Backend Logs**:
   ```bash
   ssh root@103.192.198.70
   pm2 logs financial-mgmt-backend
   ```

2. **Check Backend CORS Configuration**:
   - Verify `CORS_ORIGIN` in backend `.env` includes your Vercel domain
   - Format: `https://financial-mgmt-system.vercel.app`

3. **Test Backend Directly**:
   ```bash
   curl -X POST http://103.192.198.70:5001/api/auth/google-login \
     -H "Content-Type: application/json" \
     -d '{"idToken":"test"}'
   ```
   Should return 400 (invalid token), not 405

4. **Check Google OAuth Configuration**:
   - Verify Google Client ID is correct
   - Check authorized JavaScript origins include your Vercel domain
   - Check authorized redirect URIs

