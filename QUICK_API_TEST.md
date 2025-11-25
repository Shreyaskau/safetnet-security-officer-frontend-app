# Quick API Test Guide

## 🚀 Quick Start

### Option 1: Use Test Screen (Easiest)

1. **Open App** → Go to **Settings**
2. **Scroll down** → Find **"🧪 Test All APIs"** button
3. **Tap** → Opens API Test Screen
4. **Tap "Run All Tests"** → Tests all APIs automatically
5. **View Results** → See success/error for each API

### Option 2: Test from Code

```typescript
import APITestSuite from './utils/apiTestSuite';

const testSuite = new APITestSuite();
const results = await testSuite.runAllTests('test_officer', 'TestOfficer123!');
```

## 📋 APIs Being Tested

### Authentication
- ✅ Login
- ✅ Token Refresh

### SOS (9 APIs)
- ✅ List SOS
- ✅ Get Active SOS
- ✅ Get Resolved SOS
- ✅ Create SOS
- ✅ Update SOS
- ✅ Delete SOS
- ✅ Resolve SOS

### Cases (9 APIs)
- ✅ List Cases
- ✅ Get Case
- ✅ Create Case
- ✅ Update Case
- ✅ Delete Case
- ✅ Accept Case
- ✅ Reject Case
- ✅ Resolve Case

### Alerts (4 APIs)
- ✅ Get Alerts
- ✅ Accept Alert
- ✅ Close Alert
- ✅ Get Alert Logs

### Geofence (2 APIs)
- ✅ Get Geofence Details
- ✅ Get Users in Area

### Profile (2 APIs)
- ✅ Get Profile
- ✅ Update Profile

### Location (2 APIs)
- ✅ Update Location
- ✅ Get User Location

### Other (3 APIs)
- ✅ Send Broadcast
- ✅ Get Navigation
- ✅ List Incidents

## 📊 Understanding Results

- **✅ Success** = API working correctly
- **❌ Error** = API failed (check error message)
- **⏭️ Skipped** = Test skipped (missing data or optional)

## 🔧 Prerequisites

1. **Valid User Account**
   - Username: `test_officer`
   - Password: `TestOfficer123!`

2. **Backend Running**
   - Production: `https://safetnet.onrender.com`
   - Must be accessible

3. **Network Connection**
   - Device must have internet

## 🐛 Common Issues

### All Tests Failing
- Check backend is running
- Verify network connection
- Check credentials

### Authentication Failing
- Verify username/password
- Check user exists in database
- Ensure user is active

### 401 Errors
- Token expired → Login again
- Invalid token → Clear storage

### 502/503 Errors
- Backend sleeping (Render free tier)
- Wait 2-3 minutes and retry

## 📱 How to Access

**Settings → CONNECTION → 🧪 Test All APIs**

---

**That's it!** Run tests and check results. 🎉

