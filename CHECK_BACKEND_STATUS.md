# Check Backend Status on Render

## Quick Test

### Test 1: Browser
Open in browser:
```
https://safetnet.onrender.com/api/security/login/
```

**Expected:** Should return an error (needs POST), but shows server is reachable.

**If it times out or doesn't load:**
- Backend is sleeping (free tier)
- Wait 2-3 minutes for it to wake up
- Or check Render dashboard

### Test 2: curl
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_officer","password":"TestOfficer123!"}'
```

**Expected:** Should return JSON response (success or error).

**If it fails:**
- Backend is down or sleeping
- Check Render dashboard

### Test 3: Render Dashboard

1. Go to: https://dashboard.render.com
2. Find your service: `safetnet`
3. Check status:
   - ✅ **Running** - Should work
   - ⏸️ **Sleeping** - Wait 2-3 minutes
   - ❌ **Failed** - Check logs

## Common Issues

### Issue 1: Service is Sleeping

**Render free tier** services sleep after 15 minutes of inactivity.

**Solution:**
1. Make a request (curl or browser)
2. Wait 2-3 minutes for service to wake up
3. Try again

### Issue 2: Service is Down

**Check Render logs:**
1. Go to Render dashboard
2. Click on your service
3. Check "Logs" tab
4. Look for errors

### Issue 3: CORS Issue

**Backend must allow React Native origin.**

In Django `settings.py`:
```python
CORS_ALLOW_ALL_ORIGINS = True  # For development
```

Or specific origins:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "exp://localhost:8081",
]
```

## Quick Fixes

1. **Wake up the service:**
   ```bash
   curl https://safetnet.onrender.com/api/security/login/
   ```
   Wait 2-3 minutes, then try login again.

2. **Check CORS:**
   - Verify backend allows all origins (for development)
   - Or add React Native origin to allowed list

3. **Check network security:**
   - Android config is updated
   - Should allow HTTPS to Render

---

**Test the backend URL first to confirm it's reachable!** 🔍

