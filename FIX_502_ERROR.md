# Fix 502 Bad Gateway Error

## What is 502 Error?

**502 Bad Gateway** means:
- ✅ Your request reached Render
- ❌ But Render couldn't connect to your backend service
- The backend service is either:
  - Sleeping (free tier)
  - Starting up
  - Crashed
  - Down

## Quick Fix

### Step 1: Check Render Dashboard

1. Go to: https://dashboard.render.com
2. Login to your account
3. Find your service (likely `safetnet`)
4. Check status:
   - ⏸️ **Sleeping** → Service needs to wake up (2-3 minutes)
   - 🔄 **Starting** → Service is booting up (1-2 minutes)
   - ❌ **Failed** → Service crashed (check logs)
   - ✅ **Running** → Service is up (should work)

### Step 2: Wake Up the Service

If service is sleeping:

1. **Make a request** to wake it up:
   ```bash
   curl https://safetnet.onrender.com/api/security/login/
   ```

2. **Wait 2-3 minutes** for service to fully start

3. **Try login again** in the app

### Step 3: Check Service Logs

In Render dashboard:
1. Click on your service
2. Go to **"Logs"** tab
3. Look for errors or startup messages
4. Check if service is actually running

## Common Causes

### Cause 1: Service is Sleeping (Most Common)

**Render free tier** services sleep after 15 minutes of inactivity.

**Solution:**
- Make a request to wake it up
- Wait 2-3 minutes
- Try again

### Cause 2: Service is Starting Up

When you first deploy or wake up a service, it takes time to start.

**Solution:**
- Wait 1-2 minutes
- Check logs to see startup progress
- Try again

### Cause 3: Service Crashed

The backend might have crashed due to an error.

**Solution:**
- Check Render logs for errors
- Restart the service
- Fix any errors in the code

### Cause 4: Database Connection Issue

Backend might be running but database is not connected.

**Solution:**
- Check backend logs
- Verify database connection string
- Check if database is accessible

## Test if Service is Up

### Test 1: Browser
```
https://safetnet.onrender.com/api/security/login/
```

**If it loads (even with error):** Service is up ✅
**If it times out or shows 502:** Service is down/sleeping ❌

### Test 2: curl
```bash
curl -v https://safetnet.onrender.com/api/security/login/
```

**Expected:** Should return some response (even if error)

## What to Do Now

1. **Check Render dashboard** - Is service running?
2. **If sleeping:** Make a request, wait 2-3 minutes
3. **If starting:** Wait 1-2 minutes
4. **If failed:** Check logs and restart
5. **Try login again** in the app

## Enhanced Error Handling

The app now shows a clear message:
> "Backend service is not responding. The service may be sleeping (Render free tier takes 2-3 minutes to wake up). Please wait and try again."

## Prevent 502 Errors

### Option 1: Keep Service Awake (Paid Tier)

Upgrade to paid tier to prevent services from sleeping.

### Option 2: Use a Keep-Alive Service

Use a service like UptimeRobot to ping your backend every 5 minutes to keep it awake.

### Option 3: Accept the Delay

For free tier, accept that first request after sleep takes 2-3 minutes.

---

**Check Render dashboard first, then wait 2-3 minutes and try again!** ⏰

