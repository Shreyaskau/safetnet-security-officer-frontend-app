# Fix: Content-Type Header Issue

## The Problem

The logs show:
```
Request Headers: {"Accept": "application/json, text/plain, */*", "Content-Type": undefined}
```

**This is the issue!** The backend expects `Content-Type: application/json` but it's `undefined`.

## Why This Happens

1. Axios might not be setting Content-Type correctly
2. React Native might be overriding headers
3. The interceptor might not be running before the request

## Fixes Applied

### 1. Updated Interceptor
- Always sets `Content-Type: application/json`
- Always sets `Accept: application/json`
- Runs before every request

### 2. Explicit Headers in Login
- Login request now explicitly sets headers
- Uses `transformRequest` to ensure JSON stringification

### 3. Clear Old Tokens
- Clears any old tokens before login
- Prevents interference from stale tokens

## Test Again

1. **Reload the app** (to pick up code changes)
2. **Try login** with `test_officer` / `TestOfficer123!`
3. **Check logs** - should now show:
   ```
   Request Headers: {
     "Content-Type": "application/json",
     "Accept": "application/json"
   }
   ```

## If Still Failing

Compare with Postman request:

**Postman Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Frontend Headers (should match):**
```
Content-Type: application/json
Accept: application/json
```

If they don't match, the backend might reject the request.

---

**The Content-Type header should now be set correctly!** ✅

