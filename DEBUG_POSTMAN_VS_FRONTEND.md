# Debug: Postman Works But Frontend Doesn't

## The Problem

- ✅ **Postman**: Login works perfectly with `test_officer` / `TestOfficer123!`
- ❌ **Frontend**: Same credentials return "Invalid credentials"

This means the backend is working, but something is different in how the frontend sends the request.

## Possible Causes

### 1. Authorization Header Being Sent (Most Likely)

**Problem:** The request interceptor might be adding an old/invalid token to the login request.

**Fix Applied:** Updated the interceptor to NOT add token for login/register endpoints.

**Check:** Look for `Authorization: Bearer ...` header in the login request logs.

### 2. Different Base URL

**Problem:** Frontend might be using a different URL than Postman.

**Postman URL:** `https://safetnet.onrender.com/api/security/login/`
**Frontend URL:** Should be the same

**Check:** Look at the "Full URL" in the debug logs.

### 3. Request Body Format

**Problem:** Request body might be formatted differently.

**Postman sends:**
```json
{
  "username": "test_officer",
  "password": "TestOfficer123!"
}
```

**Frontend sends:**
```json
{
  "username": "test_officer",
  "password": "TestOfficer123!"
}
```

Should be the same - check the logs.

### 4. Content-Type Header

**Problem:** Missing or wrong Content-Type header.

**Should be:** `Content-Type: application/json`

**Check:** Look at request headers in logs.

### 5. Old Token in Storage

**Problem:** An old/invalid token in AsyncStorage might be interfering.

**Fix:** Clear AsyncStorage before testing:
```javascript
await AsyncStorage.clear();
```

## Debugging Steps

### Step 1: Check the Debug Logs

After the fix, you should see:
```
=== LOGIN REQUEST DEBUG ===
Base URL: https://safetnet.onrender.com/api/security/
Endpoint: /login/
Full URL: https://safetnet.onrender.com/api/security/login/
Request Data: { username: 'test_officer', password: '***' }
Request Headers: { ... }
===========================
```

**Compare with Postman:**
- Is the Full URL the same?
- Are the headers the same?
- Is the request body the same?

### Step 2: Clear Old Tokens

Before testing, clear any old tokens:

```javascript
// In LoginScreen.tsx, add before handleLogin:
await AsyncStorage.clear();
```

Or manually clear in the app:
1. Go to Settings
2. Logout (if logged in)
3. Clear app data
4. Try login again

### Step 3: Compare Request Headers

**Postman Headers:**
```
Content-Type: application/json
```

**Frontend Headers (should be):**
```
Content-Type: application/json
```

**Frontend Headers (should NOT have):**
```
Authorization: Bearer <old_token>  ❌
```

### Step 4: Test with Exact Postman Request

Copy the exact request from Postman:

1. In Postman, click "Code" button
2. Select "cURL"
3. Copy the curl command
4. Compare with what frontend sends

## Quick Fix Applied

I've updated the request interceptor to:
- ✅ NOT add Authorization header for `/login/` endpoint
- ✅ Add better debug logging
- ✅ Check for old tokens

## Test Again

1. **Clear app data** or uninstall/reinstall app
2. **Try login** with `test_officer` / `TestOfficer123!`
3. **Check the debug logs** - compare with Postman
4. **Share the logs** if it still fails

## Expected Logs

You should see:
```
=== LOGIN REQUEST DEBUG ===
Base URL: https://safetnet.onrender.com/api/security/
Full URL: https://safetnet.onrender.com/api/security/login/
Request Data: { username: 'test_officer', password: '***' }
Request Headers: { 'Content-Type': 'application/json' }
===========================
```

**Notice:** No `Authorization` header should be present!

## If Still Failing

1. **Share the full debug logs** from the console
2. **Share the Postman request** (screenshot or export)
3. **Check network tab** in React Native debugger
4. **Compare exact request bodies** byte-by-byte

---

**The fix should prevent old tokens from interfering with login!** 🔧

