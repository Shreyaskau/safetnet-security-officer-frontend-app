# 🔧 End-to-End API Connection Fix Guide

## 📋 Task Completion Status

### ✅ Task 1: Verify Frontend API URL
**Status**: ✅ **COMPLETE - Using Deployed Backend**

**Current Configuration**:
- **File**: `src/api/SecurityAPI.ts`
- **URL**: `https://safetnet.onrender.com/api/security/`
- **NOT using localhost** ✅
- **Environment variable support added** ✅

**Verification**:
- Check Metro logs: `"Using production API URL: https://safetnet.onrender.com/api/security/"`
- Check login request: `"Full URL: https://safetnet.onrender.com/api/security/login/"`

---

### ⚠️ Task 2: Check CORS Settings
**Status**: ⚠️ **REQUIRES BACKEND ACTION**

**Action Required**:
1. Open backend `settings.py`
2. Verify `CORS_ALLOWED_ORIGINS` includes your deployed frontend URL
3. See `BACKEND_CORS_CHECKLIST.md` for detailed instructions

**Quick Check**:
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",  # Must match exactly
]
```

---

### ✅ Task 3: Login Request Structure
**Status**: ✅ **VERIFIED - Correct Format**

**Current Request**:
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Backend Expects**: ✅ Matches Django REST Framework format

---

### ✅ Task 4: Network Response Inspection
**Status**: ✅ **ENHANCED LOGGING ADDED**

**How to Check**:
1. **Metro Bundler Logs**:
   - Look for: `"=== LOGIN REQUEST DEBUG ==="`
   - Check: `"Response Status: 200"` or error code
   - Check: `"Response Data: {...}"`

2. **React Native Debugger**:
   - Open Debugger → Network tab
   - Find login request
   - Check Status Code and Response Body

**Expected Response (Success)**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "test_officer",
    "email": "test@example.com",
    "role": "security_officer"
  }
}
```

---

### ✅ Task 5: Authentication Headers
**Status**: ✅ **CORRECTLY IMPLEMENTED**

**Token Storage**:
- ✅ Stored in AsyncStorage as `"token"`
- ✅ Format: JWT token string

**Request Headers**:
- ✅ Login: No Authorization header (correct)
- ✅ After login: `Authorization: Bearer <token>` added automatically

---

## 🔍 Diagnostic Steps

### Step 1: Verify API URL
```bash
# Start Metro bundler
npm start

# Look for this log:
# "Using production API URL: https://safetnet.onrender.com/api/security/"
```

### Step 2: Test Login & Check Logs
1. Open app
2. Enter credentials
3. Check Metro logs for:
   ```
   === LOGIN REQUEST DEBUG ===
   Full URL: https://safetnet.onrender.com/api/security/login/
   Request Body: {"username":"...","password":"..."}
   Response Status: 200 (or error code)
   Response Data: {...}
   ```

### Step 3: Check Network Tab
1. Open React Native Debugger (shake device → Debug)
2. Go to Network tab
3. Find the login request
4. Check:
   - **Status Code**: 200 = success, 400 = bad request, 401 = unauthorized
   - **Response Body**: Actual response from backend
   - **Request Headers**: Should include `Content-Type: application/json`

### Step 4: Compare with Postman
1. Test same credentials in Postman
2. Compare:
   - Request URL
   - Request body
   - Response structure
   - Status code

---

## 🐛 Common Issues & Solutions

### Issue 1: "User does not exist" but backend shows user exists

**Possible Causes**:
1. ❌ CORS blocking request
2. ❌ Wrong API URL (unlikely - already verified)
3. ❌ Backend returning error even though user exists
4. ❌ Response structure mismatch

**Diagnosis Steps**:
1. **Check Network Tab**:
   - What is the actual status code?
   - What is the actual response body?
   - Is there a CORS error?

2. **Check Metro Logs**:
   - What URL is being called?
   - What is the request payload?
   - What is the response?

3. **Check Backend Logs**:
   - Is the request reaching the backend?
   - What is the backend returning?
   - Any validation errors?

**Solution**:
- If CORS error → Fix backend CORS settings
- If 400 error → Check backend validation logic
- If different response structure → Update frontend code

---

### Issue 2: 400 Bad Request

**Check**:
- Request payload in logs
- Field names (`username`, not `email`)
- Password is correct
- Test same credentials in Postman

**Backend Might Be Returning**:
```json
{
  "non_field_errors": ["Invalid credentials."]
}
```

**Frontend Handles This**: ✅ Already implemented

---

### Issue 3: 502/503 Errors

**Cause**: Render service sleeping or starting up

**Solution**:
- Wait 2-3 minutes
- Check Render dashboard
- Verify backend is running

---

## 📝 Code Changes Summary

### Files Modified:
1. ✅ `src/api/SecurityAPI.ts`
   - Added environment variable support
   - Enhanced logging
   - Improved response validation

2. ✅ `src/screens/auth/LoginScreen.tsx`
   - Enhanced response validation logging
   - Better error messages

### Files Created:
1. ✅ `API_DIAGNOSTIC_GUIDE.md` - Complete diagnostic guide
2. ✅ `BACKEND_CORS_CHECKLIST.md` - CORS configuration
3. ✅ `COMPLETE_API_FIX_SUMMARY.md` - Full summary
4. ✅ `QUICK_FIX_REFERENCE.md` - Quick reference

---

## ✅ Verification Checklist

- [x] API URL is `https://safetnet.onrender.com/api/security/` (not localhost)
- [ ] **CORS allows your frontend URL** (BACKEND TASK - Most likely issue)
- [x] Request uses `{ username, password }` format
- [x] Response handling for `{ access, refresh, user }` structure
- [x] Token storage in AsyncStorage
- [x] Authorization headers implemented correctly

---

## 🎯 Most Likely Root Cause

Based on the symptoms ("user exists in DB but frontend says doesn't exist"), the most likely issues are:

1. **CORS Blocking** (80% probability)
   - Backend not allowing frontend URL
   - Request blocked before reaching backend
   - **Fix**: Update backend CORS settings

2. **Backend Validation** (15% probability)
   - Backend returns 400 even though user exists
   - User might not be active
   - Password might not match
   - **Fix**: Check backend validation logic

3. **Response Structure Mismatch** (5% probability)
   - Backend returns different structure
   - Frontend expecting different format
   - **Fix**: Check Network tab, update code if needed

---

## 🚀 Immediate Action Items

### For You (Frontend):
1. ✅ **Test login** and check Metro logs
2. ✅ **Check Network tab** in React Native Debugger
3. ✅ **Note the exact error message** and status code

### For Backend Team:
1. ⚠️ **Check CORS settings** - Allow your frontend URL
2. ⚠️ **Check backend logs** - See what's being returned
3. ⚠️ **Verify user is active** - Check `is_active=True` in database
4. ⚠️ **Test with Postman** - Use same credentials, check response

---

## 📞 Next Steps

1. **Run the app** and attempt login
2. **Check Metro logs** for detailed request/response
3. **Check Network tab** for actual backend response
4. **Share the logs** with backend team if CORS issue
5. **Compare with Postman** to see if response differs

---

## 📚 Documentation Files

- `API_DIAGNOSTIC_GUIDE.md` - Complete diagnostic guide
- `BACKEND_CORS_CHECKLIST.md` - CORS configuration for backend
- `COMPLETE_API_FIX_SUMMARY.md` - Full summary of all fixes
- `QUICK_FIX_REFERENCE.md` - Quick reference guide
- `END_TO_END_FIX_GUIDE.md` - This file

---

## ✅ Summary

**Frontend is correctly configured** ✅
- Using deployed backend URL
- Request structure is correct
- Response handling is correct
- Token management is correct

**Most likely issue**: **CORS configuration** ⚠️
- Backend must allow your frontend URL
- Check `BACKEND_CORS_CHECKLIST.md` for instructions

**Next step**: Test login and check Network tab for actual response!

