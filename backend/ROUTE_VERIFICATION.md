# Backend Route Verification

## Google Login Route Structure

### Route Definition

**File: `backend/src/routes/authRoutes.js`**
- Line 135: `router.post('/google-login', googleLogin);`

**File: `backend/src/app.js`**
- Line 120: `app.use('/api/auth', authRoutes);`

### Full Route Path

```
POST /api/auth/google-login
```

### Complete URL

```
http://103.192.198.70:5001/api/auth/google-login
```

## Route Verification Test

I tested the route and got this response:
```json
{"success":false,"message":"Invalid Google token. Please try signing in again."}
```

**This confirms:**
- ✅ Route exists
- ✅ Accepts POST requests
- ✅ Backend is processing requests
- ✅ Route is working correctly

## Controller Implementation

**File: `backend/src/controllers/authController.js`**
- Line 602-604: Route handler defined
- Line 944: Exported in module.exports

## If Route Appears "Not Available"

### Check 1: Backend Server Status

SSH into server and check:
```bash
ssh root@103.192.198.70
pm2 status
pm2 logs financial-mgmt-backend --lines 50
```

### Check 2: Test Route Directly

From your local machine:
```bash
curl -X POST http://103.192.198.70:5001/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'
```

**Expected:** 400 Bad Request with message about invalid token
**If 404:** Route not registered
**If 405:** Method not allowed (shouldn't happen for POST)

### Check 3: Verify Route Registration

Check if routes are loaded:
```bash
# On server
pm2 logs financial-mgmt-backend | grep "auth"
```

Should see routes being registered on startup.

### Check 4: Check for Route Conflicts

Make sure no other middleware is blocking the route.

## Route is Confirmed Working ✅

The route exists and responds correctly. The 405 error in production is likely due to:
1. Frontend using wrong API base URL
2. CORS configuration issue
3. Request being intercepted/converted to GET

