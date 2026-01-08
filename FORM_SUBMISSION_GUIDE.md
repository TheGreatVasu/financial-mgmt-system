# Form Submission Flow - 6 Steps Implementation

## Overview
The customer creation form now has complete backend integration with proper error handling, validation, and data persistence.

---

## 6 Steps Implemented

### **STEP 1: Enhanced Error Handling in Service**
📍 File: `frontend/src/services/masterDataService.js`

**What it does:**
- Validates authentication token exists
- Validates payload structure
- Adds timeout (15s) for API calls
- Detailed error logging with response data
- User-friendly error messages

**Code flow:**
```javascript
// Step 1: Validate authentication
const token = getAuthToken()

// Step 2: Validate payload format
if (!payload || typeof payload !== 'object')

// Step 3: Create axios with auth headers
const axiosInstance = createAxiosInstance(token)

// Step 4: Send POST to /api/admin/master-data
await axiosInstance.post('/api/admin/master-data', payload)

// Step 5: Check success response
if (response.data?.success)

// Step 6: Handle error response
throw new Error(response.data?.message)
```

---

### **STEP 2: Form Payload Validation**
📍 File: `frontend/src/pages/customers/new.jsx` → `handleSaveToDatabase()`

**What it validates:**
- Company Name is required
- Customer Name OR Legal Entity Name is required
- All profile sections are properly structured
- Arrays are initialized (consignee, payer, payment terms, team)

**Validation code:**
```javascript
if (!payload.companyProfile?.companyName?.trim()) {
  throw new Error('Company Name is required')
}
if (!payload.customerProfile?.customerName?.trim() && 
    !payload.customerProfile?.legalEntityName?.trim()) {
  throw new Error('Customer Name or Legal Entity Name is required')
}
```

---

### **STEP 3: Loading State Management**
📍 File: `frontend/src/pages/customers/new.jsx` → `handleSaveToDatabase()`

**What it does:**
- Shows loading toast while saving
- Sets `setSaving(true)` during submission
- Clears any previous error messages
- Manages modal state properly

**State management:**
```javascript
setSaving(true)           // Disable buttons
setError('')              // Clear previous errors
const loadingToastId = toast.loading('Saving master data...')
// ... after response ...
toast.success('...', { id: loadingToastId })  // Replace loading toast
setSaving(false)          // Re-enable buttons
```

---

### **STEP 4: Backend API Call with Proper Headers**
📍 File: `frontend/src/services/masterDataService.js`

**What it sends:**
- Authorization header: `Bearer {token}`
- Content-Type: `application/json`
- Timeout: 15 seconds
- Complete payload with all 6 master data sections

**API call configuration:**
```javascript
const response = await axiosInstance.post('/api/admin/master-data', payload, {
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

---

### **STEP 5: Successful Save with Toast Notifications**
📍 File: `frontend/src/pages/customers/new.jsx` → `handleSaveToDatabase()`

**What it does:**
- Confirms data saved to backend
- Shows step-specific success message
- Logs saved data for debugging
- Updates local state with response data

**Success handling:**
```javascript
const savedData = await masterDataService.submitMasterData(payload)
toast.success('Master data saved successfully!', { id: loadingToastId })
setSuccessData(savedData || payload)

if (currentStep === 5) {
  // Create final customer record
  const customerRequest = { ... }
  const res = await svc.create(customerRequest)
  setShowSuccessPopup(true)
  toast.success('Customer record created successfully!')
}
```

---

### **STEP 6: Error Handling & User Feedback**
📍 File: `frontend/src/pages/customers/new.jsx` → `handleSaveToDatabase()`

**What it does:**
- Catches API errors and displays them
- Shows user-friendly error messages
- Doesn't close modal on error (allows retry)
- Logs detailed error information

**Error handling:**
```javascript
catch (err) {
  console.error('Error in handleSaveToDatabase:', err)
  const errorMsg = err?.response?.data?.message || err.message || 'Failed to save form data'
  setError(errorMsg)
  toast.error(errorMsg)
  // Modal stays open for retry
}
```

---

## Data Flow Diagram

```
┌─────────────────────┐
│  User fills form    │
└──────────┬──────────┘
           ↓
┌─────────────────────────────────────┐
│ Step 1-2: Validate all fields       │
│ - Company Name required             │
│ - Customer Name required            │
└──────────┬────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Step 3: Show loading toast          │
│ "Saving master data..."             │
└──────────┬────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Step 4: POST to /api/admin/master-data
│ Payload:                            │
│ - companyProfile                    │
│ - customerProfile                   │
│ - consigneeProfiles[]               │
│ - payerProfiles[]                   │
│ - paymentTerms[]                    │
│ - teamProfiles[]                    │
│ - additionalStep                    │
└──────────┬────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Backend Processing                  │
│ 1. Validate user auth               │
│ 2. Merge with existing data         │
│ 3. Save to master_data table        │
│ 4. Sync to customers table          │
│ 5. Return saved data                │
└──────────┬────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Step 5: Handle success              │
│ - Replace loading toast             │
│ - Show success message              │
│ - If final step, create customer    │
└──────────┬────────────────────────┘
           ↓
       OR
           ↓
┌─────────────────────────────────────┐
│ Step 6: Handle error                │
│ - Show error toast                  │
│ - Keep modal open for retry         │
│ - Log details to console            │
└─────────────────────────────────────┘
```

---

## Backend Endpoints

### **POST /api/admin/master-data**
Saves complete master data for a user

**Request:**
```json
{
  "companyProfile": { ... },
  "customerProfile": { ... },
  "consigneeProfiles": [ ... ],
  "payerProfiles": [ ... ],
  "paymentTerms": [ ... ],
  "teamProfiles": [ ... ],
  "additionalStep": { ... }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": { ... },
  "syncResult": { ... },
  "message": "Master data saved successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Database Schema

### `master_data` Table
```sql
CREATE TABLE master_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  data LONGTEXT NOT NULL (JSON serialized),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### `customers` Table (synced from master_data)
Data from `customerProfile` gets synced here when `customerName` or `legalEntityName` is provided.

---

## Testing Checklist

- [ ] **Backend running:** `npm run dev` in backend folder
- [ ] **Frontend running:** `npm run dev` in frontend folder
- [ ] **Logged in:** Auth token available in localStorage
- [ ] **Fill form:** Complete at least company name
- [ ] **Click Save:** Should show loading toast
- [ ] **Check browser console:** Should see `Master data saved successfully`
- [ ] **Check MySQL:** Query `SELECT * FROM master_data WHERE user_id = {YOUR_ID}`
- [ ] **Reload page:** Data should persist (if retrieval is implemented)
- [ ] **Error case:** Fill invalid data, should show error toast

---

## Common Issues & Solutions

### Issue: "No authentication token found"
**Solution:** 
1. Make sure you're logged in
2. Check localStorage has 'token' key
3. Verify auth middleware is configured

### Issue: "Failed to connect to API"
**Solution:**
1. Verify backend is running on port 5000
2. Check Vite proxy config points to `http://localhost:5000`
3. Check CORS is enabled in backend app.js

### Issue: "Data not saving to database"
**Solution:**
1. Verify MySQL connection in backend logs
2. Check `master_data` table exists (auto-created)
3. Check database config in `.env`

### Issue: Loading spinner never completes
**Solution:**
1. Check browser DevTools → Network tab for failed requests
2. Look at backend console for error logs
3. Verify auth token is valid (not expired)

---

## Files Modified

1. **frontend/src/services/masterDataService.js** ✅ CREATED
   - New file with 6-step API client

2. **frontend/src/pages/customers/new.jsx** ✅ UPDATED
   - Enhanced `handleSaveToDatabase()` function
   - Better error handling
   - Proper toast notifications

3. **backend/src/routes/masterDataRoutes.js** ✅ EXISTING
   - Routes already mounted in app.js
   - Ready to receive POST requests

4. **backend/src/controllers/masterDataController.js** ✅ EXISTING
   - Merge logic for partial saves
   - Sync to customers table

5. **backend/src/services/masterDataRepo.js** ✅ EXISTING
   - Database persistence layer
   - Auto-create master_data table

---

## Next Steps (Optional)

- [ ] Implement GET `/api/admin/master-data` to retrieve saved data on page load
- [ ] Add progress persistence between page refreshes
- [ ] Implement auto-save feature
- [ ] Add data validation on backend
- [ ] Create audit logs for all saves
- [ ] Add data versioning for rollback capability
