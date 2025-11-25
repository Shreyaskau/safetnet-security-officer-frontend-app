# Run App on Physical Device - Quick Guide

## Prerequisites

- ✅ Device connected via wireless debugging
- ✅ `adb devices` shows your device
- ✅ Device and computer on same WiFi network

## Step 1: Verify Device Connection

```bash
adb devices
```

**Expected output:**
```
List of devices attached
ABC123XYZ    device
```

If device shows as "unauthorized":
- Check device screen for authorization prompt
- Tap "Allow" or "Always allow"

## Step 2: Start Metro Bundler

**Terminal 1:**
```bash
npm start
```

Keep this running. You should see:
```
Metro waiting on http://localhost:8081
```

## Step 3: Run App on Device

**Terminal 2 (new terminal):**
```bash
npm run android
```

Or if you have multiple devices:
```bash
npx react-native run-android --deviceId=YOUR_DEVICE_ID
```

**What happens:**
1. Builds the app
2. Installs on your device
3. Launches the app
4. Connects to Metro bundler

## Step 4: Test Database Connection

### In the App:

1. **Open app** on device
2. **Navigate to Settings** (if logged in) or try login first
3. **Scroll to "CONNECTION" section**
4. **Tap "Test Backend Connection"**
5. **Wait for results**

### Expected Results:

```
✅ Backend API: Connected
✅ Database: Connected
URL: https://safetnet.onrender.com/api/security/
Response Time: 500-2000ms (Render can be slow)
Status Code: 400 (expected - testing with invalid credentials)
DB Test: ✅ Database connected - API validated credentials
```

## Step 5: Test Login

1. **On Login screen:**
   - Badge ID or Email: `test_officer`
   - Password: `TestOfficer123!`
2. **Tap LOGIN**
3. **Check Metro logs** for detailed request/response

## If Connection Test Fails

### Check 1: Device Internet
- Open browser on device
- Try: `https://safetnet.onrender.com`
- Should load (even with error)

### Check 2: Backend Status
- Go to Render dashboard
- Verify service is running
- If sleeping, wait 2-3 minutes

### Check 3: Metro Connection
- Shake device → Settings → Debug
- Verify Metro URL is correct
- Should be: `http://YOUR_COMPUTER_IP:8081`

## Quick Commands

```bash
# Check device connection
adb devices

# Start Metro
npm start

# Run on device
npm run android

# View device logs
adb logcat | grep ReactNativeJS

# Restart Metro with cache clear
npm start -- --reset-cache
```

---

**Your app should now run on your physical device!** 📱

