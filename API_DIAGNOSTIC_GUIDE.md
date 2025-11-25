# 🔍 API Connection Diagnostic Guide

## ✅ Task 1: Verify Frontend API URL

### Current Configuration
- **File**: `src/api/SecurityAPI.ts`
- **Current URL**: `https://safetnet.onrender.com/api/security/`
- **Status**: ✅ Using deployed backend (not localhost)

### How to Verify:
1. Open React Native Debugger or check Metro bundler logs
2. Look for: `"Using production API URL: https://safetnet.onrender.com/api/security/"`
3. Check login request logs: `"Full URL: https://safetnet.onrender.com/api/security/login/"`

### To Change URL (if needed):
Create `.env` file in project root:
```env
API_BASE_URL=https://safetnet.onrender.com/api/security/
```

---

## ✅ Task 2: Check CORS Settings (Backend Task)

### What to Check in Backend:
1. **Django CORS Configuration** (`settings.py`):
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",  # Your deployed frontend URL
    "http://localhost:3000",  # For local development
]

# Or allow all (less secure, for testing):
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
```

2. **Verify Frontend URL is in CORS list**:
   - Check your deployed frontend URL matches exactly
   - Check for trailing slashes
   - Check for http vs https

### Common CORS Issues:
- ❌ Frontend URL not in `CORS_ALLOWED_ORIGINS`
- ❌ Missing `CORS_ALLOW_CREDENTIALS = True` if using cookies
- ❌ Backend not allowing `Content-Type: application/json` header

---

## ✅ Task 3: Verify Login Request Structure

### Current Request Format:
```json
{
  "username": "user@example.com",  // Can be email or username
  "password": "password123"
}
```

### Backend Should Expect:
- Field name: `username` (not `email`)
- Field name: `password`
- Content-Type: `application/json`

### How to Verify:
1. Check Network tab in React Native Debugger
2. Look for request payload in logs:
   ```
   Request Body (JSON): {"username":"...","password":"..."}
   ```

---

## ✅ Task 4: Inspect Network Response

### How to Check:
1. **React Native Debugger**:
   - Open Debugger (shake device → Debug)
   - Go to Network tab
   - Find the login request
   - Check Status Code and Response

2. **Metro Bundler Logs**:
   - Look for: `"Response Status: 200"` or error code
   - Check: `"Response Data: {...}"`

### Expected Response (Success):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "test_officer",
    "email": "test@example.com",
    "role": "security_officer",
    "first_name": "Test",
    "last_name": "Officer",
    ...
  }
}
```

### Common Error Responses:
- **400 Bad Request**: `{"non_field_errors": ["Invalid credentials."]}`
- **401 Unauthorized**: `{"detail": "Authentication credentials were not provided."}`
- **500 Server Error**: Backend issue
- **502 Bad Gateway**: Render service sleeping/starting
- **503 Service Unavailable**: Backend overloaded

---

## ✅ Task 5: Verify Authentication Headers

### Current Implementation:
- ✅ Token stored in AsyncStorage as `"token"`
- ✅ Token added to requests as: `Authorization: Bearer <token>`
- ✅ Token NOT sent for login/register endpoints

### How Headers Work:
1. **Login Request**: No Authorization header (correct)
2. **After Login**: Token stored automatically
3. **Subsequent Requests**: Token added automatically via interceptor

### Verify Token Storage:
Check in React Native Debugger → AsyncStorage:
- Key: `"token"`
- Value: Should be JWT token string

---

## 🔧 Fixes Applied

### 1. Enhanced API URL Configuration
- ✅ Added environment variable support
- ✅ Added logging to show which URL is being used
- ✅ Ensured production URL is default

### 2. Improved Error Logging
- ✅ Detailed request/response logging
- ✅ Response structure validation
- ✅ Token validation with warnings

### 3. Response Validation
- ✅ Checks for access token
- ✅ Validates user data exists
- ✅ Better error messages

---

## 🧪 Testing Steps

### Step 1: Check API URL
```bash
# Run app and check Metro logs
npm start
# Look for: "Using production API URL: https://safetnet.onrender.com/api/security/"
```

### Step 2: Test Login
1. Open app
2. Enter credentials
3. Check Metro logs for:
   - Request URL
   - Request payload
   - Response status
   - Response data

### Step 3: Check Network Tab
1. Open React Native Debugger
2. Go to Network tab
3. Find login request
4. Verify:
   - Status code (200 = success, 400 = invalid credentials, etc.)
   - Response body structure
   - Headers

### Step 4: Verify Token Storage
1. After successful login
2. Check AsyncStorage in Debugger
3. Verify `token` key exists with JWT value

---

## 🐛 Common Issues & Solutions

### Issue 1: "User does not exist" but backend shows user exists
**Possible Causes**:
1. ❌ Wrong API URL (checking wrong backend)
2. ❌ CORS blocking request
3. ❌ Request format mismatch
4. ❌ Backend returning error but frontend misinterpreting

**Solution**:
- Check Network tab for actual response
- Verify API URL in logs
- Check CORS settings in backend

### Issue 2: 400 Bad Request
**Possible Causes**:
1. ❌ Wrong field names (email vs username)
2. ❌ Password encoding issue
3. ❌ Backend validation failing

**Solution**:
- Check request payload in logs
- Verify field names match backend expectations
- Test same credentials in Postman

### Issue 3: 502/503 Errors
**Possible Causes**:
1. ❌ Render service sleeping (free tier)
2. ❌ Backend crashed
3. ❌ Network timeout

**Solution**:
- Wait 2-3 minutes for Render to wake up
- Check Render dashboard
- Verify backend is running

---

## 📋 Checklist

- [ ] API URL is `https://safetnet.onrender.com/api/security/` (not localhost)
- [ ] CORS allows your frontend URL
- [ ] Request uses `{ username, password }` format
- [ ] Response contains `{ access, refresh, user }` structure
- [ ] Token is stored in AsyncStorage after login
- [ ] Subsequent requests include `Authorization: Bearer <token>` header

---

## 🚀 Next Steps

1. **Test login** and check Metro logs
2. **Check Network tab** for actual response
3. **Verify CORS** in backend settings
4. **Compare with Postman** - use same credentials and check response

