# Verify Backend Setup - Step by Step

## Step 1: Test Backend is Reachable

### Option A: Browser Test
1. Open your browser
2. Go to: `https://safetnet.onrender.com/api/security/login/`
3. **Expected:** Should load (even if it shows an error - that's OK, it means server is reachable)
4. **If it times out:** Backend is sleeping or down - wait 2-3 minutes

### Option B: Command Line Test
Run the test script:
```bash
test_backend.bat
```

Or manually:
```bash
curl https://safetnet.onrender.com/api/security/login/
```

**Expected:** Should return an error message (needs POST), but shows server is reachable.

## Step 2: Test Login Endpoint

```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_officer","password":"TestOfficer123!"}'
```

**Expected Success Response:**
```json
{
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci...",
  "user": {
    "id": 1,
    "username": "test_officer",
    "email": "test.officer@safetnet.com",
    "role": "security_officer"
  }
}
```

**Expected Error (if credentials wrong):**
```json
{
  "non_field_errors": ["Invalid credentials."]
}
```

## Step 3: Check Render Dashboard

1. Go to: https://dashboard.render.com
2. Login to your account
3. Find your service (likely named `safetnet` or similar)
4. Check status:
   - ✅ **Running** - Good, backend is active
   - ⏸️ **Sleeping** - Normal for free tier, will wake up on first request
   - ❌ **Failed** - Check logs for errors

## Step 4: Verify CORS Settings (Backend)

In your Django backend `settings.py`, make sure you have:

```python
# Install django-cors-headers if not already installed
# pip install django-cors-headers

INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Should be near the top
    # ... other middleware
]

# For development - allow all origins
CORS_ALLOW_ALL_ORIGINS = True

# Or for production - specify allowed origins
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:8081",
#     "exp://localhost:8081",
# ]
```

## Step 5: Verify ALLOWED_HOSTS (Backend)

In Django `settings.py`:

```python
ALLOWED_HOSTS = ['*']  # For development
# Or specific:
# ALLOWED_HOSTS = ['safetnet.onrender.com', 'localhost']
```

## Step 6: Test in Frontend App

After verifying backend is reachable:

1. **Reload the app** (to pick up code changes)
2. **Try login** with:
   - Username: `test_officer`
   - Password: `TestOfficer123!`
3. **Check logs** - Should see detailed request/response info

## Troubleshooting

### If Backend Test Fails

1. **Service is sleeping:**
   - Make a request (curl or browser)
   - Wait 2-3 minutes
   - Try again

2. **Service is down:**
   - Check Render dashboard
   - Check logs for errors
   - Restart the service if needed

3. **CORS error:**
   - Verify `django-cors-headers` is installed
   - Check `CORS_ALLOW_ALL_ORIGINS = True` in settings.py
   - Restart backend after changes

### If Frontend Still Fails

1. **Check network security config** - Already updated ✅
2. **Check timeout** - Increased to 60 seconds ✅
3. **Check error logs** - Enhanced logging shows details ✅
4. **Verify URL** - Should be `https://safetnet.onrender.com/api/security/login/` ✅

## Quick Checklist

- [ ] Backend URL is reachable (browser/curl test)
- [ ] Backend service is running on Render
- [ ] CORS is configured in Django
- [ ] ALLOWED_HOSTS includes Render domain
- [ ] Frontend uses correct URL
- [ ] Network security config allows HTTPS
- [ ] Test login with curl works
- [ ] Try login in app

---

**Follow these steps to verify everything is set up correctly!** ✅

