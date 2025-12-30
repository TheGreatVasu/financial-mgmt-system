# Lazy Validation Fix - Environment Variable Handling

## Problem
The application was crashing on load with `VITE_API_BASE_URL must be set` errors because validation was happening at module import time, preventing the React app from rendering even when the UI didn't need the API yet.

## Solution
Refactored all service files to use **lazy validation** - environment variables are only validated when functions are actually called, not during module import.

## Changes Made

### 1. `frontend/src/services/apiClient.js`

**Before:**
- Validation happened immediately inside `createApiClient()` function
- Threw error immediately when function was called

**After:**
- Created `getApiBaseUrl()` helper function that:
  - Validates lazily
  - Logs clear error messages instead of throwing immediately
  - Returns `undefined` if not set
- `createApiClient()` now:
  - Calls `getApiBaseUrl()` when function is actually called
  - Only throws error if `baseURL` is missing AND function is called
  - Provides clear error message with guidance

**Key Improvement:**
- Module can be imported without crashing
- Error only thrown when API client is actually used
- Clear console warnings help debugging

### 2. `frontend/src/services/socketService.js`

**Before:**
- Validation happened inside `initializeSocket()` function
- Threw error immediately when function was called

**After:**
- Created `getSocketUrl()` helper function that:
  - Validates lazily
  - Logs clear error messages instead of throwing immediately
  - Returns `undefined` if not set
  - Handles `/api` suffix removal
- `initializeSocket()` now:
  - Calls `getSocketUrl()` when function is actually called
  - Only throws error if socket URL is missing AND function is called
  - Provides clear error message with guidance

**Key Improvement:**
- Module can be imported without crashing
- Error only thrown when socket is actually initialized
- Clear console warnings help debugging

### 3. `frontend/src/services/importService.js`

**Before:**
- Validation happened inside `downloadTemplate()` function
- Used `url` variable name twice (variable shadowing bug)
- Threw error immediately when function was called

**After:**
- Created `getApiBaseUrl()` helper function (reusable pattern)
- Fixed variable naming (`blobUrl` instead of second `url`)
- `downloadTemplate()` now:
  - Calls `getApiBaseUrl()` when function is actually called
  - Only throws error if base URL is missing AND function is called
  - Improved error messages with context

**Key Improvement:**
- Module can be imported without crashing
- Error only thrown when template download is attempted
- Fixed variable shadowing bug
- Better error messages

## Validation Pattern

All three files now follow the same pattern:

```javascript
// Helper function - validates lazily, logs warnings, returns undefined if missing
function getApiBaseUrl() {
  const baseURL = typeof import.meta?.env?.VITE_API_BASE_URL === 'string' 
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '') 
    : undefined;
  
  if (!baseURL) {
    console.error('❌ VITE_API_BASE_URL is not set. [Operation] will fail.');
    console.error('   Set VITE_API_BASE_URL in your .env file before building.');
    return undefined;
  }
  
  return baseURL;
}

// Export function - only validates when actually called
export function someFunction() {
  const baseURL = getApiBaseUrl();
  if (!baseURL) {
    throw new Error('VITE_API_BASE_URL must be set... [with guidance]');
  }
  // Use baseURL...
}
```

## Benefits

1. ✅ **No crashes on load** - App can render even if env var is missing
2. ✅ **Lazy validation** - Only validates when functions are actually used
3. ✅ **Clear errors** - Console warnings help identify missing config
4. ✅ **Production-safe** - Errors only thrown when services are actually needed
5. ✅ **Debuggable** - Error messages include guidance on how to fix
6. ✅ **Vite-correct** - Still uses `import.meta.env.VITE_*` at build time
7. ✅ **No runtime hacks** - Clean, maintainable code

## Behavior

### When `VITE_API_BASE_URL` is Set:
- ✅ All services work normally
- ✅ No console warnings
- ✅ API calls succeed

### When `VITE_API_BASE_URL` is Missing:
- ✅ App loads and renders normally
- ✅ Login page displays correctly
- ⚠️ Console shows warning messages (helpful for debugging)
- ❌ Errors thrown only when:
  - User tries to make an API call
  - User tries to initialize socket
  - User tries to download template

## Testing

1. **App Loads Without Env Var:**
   - Remove `VITE_API_BASE_URL` from `.env`
   - Build and run app
   - ✅ App renders, login page displays
   - ⚠️ Console shows warnings
   - ❌ API calls fail with clear error

2. **App Works With Env Var:**
   - Set `VITE_API_BASE_URL=https://nbaurum.com/api`
   - Build and run app
   - ✅ All services work normally
   - ✅ No warnings or errors

## Production Impact

- **Before:** App crashed immediately on load, preventing any rendering
- **After:** App loads successfully, errors only occur when services are actually used
- **Result:** Better user experience, easier debugging, production stability

## Files Modified

1. `frontend/src/services/apiClient.js`
2. `frontend/src/services/socketService.js`
3. `frontend/src/services/importService.js`

All files follow the same lazy validation pattern for consistency and maintainability.

