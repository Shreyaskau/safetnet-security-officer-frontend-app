# Fix Network Error - Unable to Reach Server

## The Problem

```
Network error: Unable to reach server. Check your internet connection.
AxiosError: Network Error
```

## Possible Causes

### 1. Backend Server is Down or Spinning Up

**Render.com free tier** can take 2-3 minutes to spin up if it's been idle.

**Solution:**
- Wait 2-3 minutes
- Check if backend is accessible: `https://safetnet.onrender.com/api/security/login/`
- Try again

### 2. CORS Issue

Backend might not allow requests from your frontend origin.

**Solution:**
In Django `settings.py`, add:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8081",  # React Native Metro
    "exp://localhost:8081",   # Expo
]

# Or for development, allow all:
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
```

### 3. SSL/HTTPS Certificate Issue

React Native might reject self-signed certificates.

**Solution:**
The code now has increased timeout and better error handling.

### 4. Network Connectivity

Your device/emulator might not have internet access.

**Solution:**
- Check internet connection
- Try accessing the URL in a browser
- Test with curl: `curl https://safetnet.onrender.com/api/security/login/`

### 5. Backend URL Incorrect

**Solution:**
Verify the URL is correct:
```typescript
baseURL: "https://safetnet.onrender.com/api/security/"
```

## Fixes Applied

1. ✅ **Increased timeout** to 60 seconds (Render can be slow)
2. ✅ **Better error logging** to identify the exact issue
3. ✅ **Network error debugging** with detailed information

## Test Backend is Reachable

### Test 1: Browser
Open in browser:
```
https://safetnet.onrender.com/api/security/login/
```

Should return an error (expected - needs POST), but shows server is reachable.

### Test 2: curl
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_officer","password":"TestOfficer123!"}'
```

### Test 3: Check Render Dashboard
- Go to Render dashboard
- Check if your service is running
- Check logs for any errors

## Next Steps

1. **Check the enhanced error logs** - They now show detailed information
2. **Verify backend is running** - Check Render dashboard
3. **Test backend URL** - Try in browser or curl
4. **Check CORS settings** - Make sure backend allows your frontend origin

## If Still Failing

The enhanced logging will show:
- Exact URL being called
- Error code and message
- Whether it's a network, CORS, or server issue

Share the detailed error logs for further debugging.

---

**The enhanced error handling will help identify the exact issue!** 🔍

