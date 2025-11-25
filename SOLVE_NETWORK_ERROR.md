# Solve Network Error - ERR_NETWORK

## The Problem

```
Error code: ERR_NETWORK
Network error: Unable to reach server
```

The request isn't reaching the Render backend server.

## Quick Checks

### 1. Verify Backend is Running

**Test in browser:**
```
https://safetnet.onrender.com/api/security/login/
```

Should return an error (expected - needs POST), but shows server is reachable.

**Test with curl:**
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_officer","password":"TestOfficer123!"}'
```

### 2. Check Render Dashboard

- Go to Render dashboard
- Check if your service is **Running** (not sleeping)
- Check logs for any errors
- **Note:** Free tier services sleep after 15 minutes of inactivity

### 3. Wait for Server to Spin Up

If the service was sleeping, it takes **2-3 minutes** to wake up.

**Solution:** Wait 2-3 minutes after making the first request.

## Possible Fixes

### Fix 1: Update Network Security Config (Android)

Check `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">safetnet.onrender.com</domain>
    </domain-config>
</network-security-config>
```

### Fix 2: Check CORS Settings (Backend)

In Django `settings.py`:

```python
CORS_ALLOW_ALL_ORIGINS = True  # For development
# Or specific origins:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "exp://localhost:8081",
]
```

### Fix 3: Check ALLOWED_HOSTS (Backend)

In Django `settings.py`:

```python
ALLOWED_HOSTS = ['*']  # For development
# Or specific:
ALLOWED_HOSTS = ['safetnet.onrender.com', 'localhost']
```

### Fix 4: Test Backend Directly

**From your computer:**
```bash
curl https://safetnet.onrender.com/api/security/login/
```

**From React Native debugger console:**
```javascript
fetch('https://safetnet.onrender.com/api/security/login/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'test_officer', password: 'TestOfficer123!'})
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

## Most Likely Causes

1. **Backend is sleeping** (Render free tier) - Wait 2-3 minutes
2. **CORS issue** - Backend not allowing React Native origin
3. **Backend is down** - Check Render dashboard
4. **Network security config** - Android blocking HTTPS

## Next Steps

1. **Check Render dashboard** - Is service running?
2. **Test backend URL** - Does it work in browser/curl?
3. **Wait 2-3 minutes** - If service was sleeping
4. **Check CORS** - Backend must allow React Native origin
5. **Check network security config** - Android might be blocking

---

**The enhanced error logging will help identify the exact issue!** 🔍

