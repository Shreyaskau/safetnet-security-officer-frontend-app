# API Test Suite Guide

## Overview

This guide helps you test all APIs connected through TypeScript in your React Native app.

## APIs Being Tested

### 🔐 Authentication APIs
- `loginOfficer` - Login with username/password
- `refreshAccessToken` - Refresh JWT token

### 🆘 SOS APIs
- `listSOS` - List all SOS alerts
- `getSOS` - Get specific SOS by ID
- `createSOS` - Create new SOS alert
- `updateSOS` - Update SOS alert
- `patchSOS` - Partial update SOS alert
- `deleteSOS` - Delete SOS alert
- `resolveSOS` - Resolve SOS alert
- `getActiveSOS` - Get active SOS alerts
- `getResolvedSOS` - Get resolved SOS alerts

### 📁 Case APIs
- `listCases` - List all cases
- `getCase` - Get specific case by ID
- `createCase` - Create new case
- `updateCase` - Update case
- `patchCase` - Partial update case
- `deleteCase` - Delete case
- `acceptCase` - Accept case
- `rejectCase` - Reject case
- `resolveCase` - Resolve case

### 🔔 Alert APIs
- `getAlerts` - Get alerts for security officer
- `acceptAlert` - Accept an alert
- `closeAlert` - Close an alert
- `getAlertLogs` - Get alert logs

### 🧭 Geofence APIs
- `getGeofenceDetails` - Get geofence area details
- `getUsersInArea` - Get users in geofence area

### 👤 Profile APIs
- `getProfile` - Get security officer profile
- `updateProfile` - Update security officer profile

### 📍 Location APIs
- `updateLocation` - Update security officer location
- `getUserLocation` - Get user location

### 📢 Broadcast APIs
- `sendBroadcast` - Send broadcast message

### 🧭 Navigation APIs
- `getNavigation` - Get navigation data

### 📜 Incident APIs
- `listIncidents` - List all incidents

## How to Use

### Method 1: Using the Test Screen (Recommended)

1. **Add Test Screen to Navigation:**
   ```typescript
   // In src/navigation/MainNavigator.tsx
   import { APITestScreen } from '../screens/test/APITestScreen';
   
   // Add to Stack.Navigator:
   <Stack.Screen name="APITest" component={APITestScreen} />
   ```

2. **Navigate to Test Screen:**
   - From Settings: Add a button to navigate to APITest
   - Or use React Navigation: `navigation.navigate('APITest')`

3. **Run Tests:**
   - Enter credentials (default: `test_officer` / `TestOfficer123!`)
   - Tap "Run All Tests"
   - View results in real-time

### Method 2: Using Test Suite Directly

```typescript
import APITestSuite from '../utils/apiTestSuite';

// Create test suite instance
const testSuite = new APITestSuite();

// Run all tests
const results = await testSuite.runAllTests('test_officer', 'TestOfficer123!');

// Get summary
const summary = testSuite.getSummary();
console.log('Success:', summary.success);
console.log('Errors:', summary.errors);
console.log('Success Rate:', summary.successRate + '%');
```

### Method 3: Test Individual APIs

```typescript
import { listSOS, createSOS } from '../api/SecurityAPI';

// Test list SOS
try {
  const response = await listSOS();
  console.log('SOS List:', response.data);
} catch (error) {
  console.error('Error:', error);
}

// Test create SOS
try {
  const response = await createSOS({
    description: 'Test SOS',
    location: { latitude: 19.0760, longitude: 72.8777 },
    priority: 'high',
  });
  console.log('Created SOS:', response.data);
} catch (error) {
  console.error('Error:', error);
}
```

## Test Results

Each test returns:
- **Status**: `success`, `error`, or `skipped`
- **Message**: Description of the result
- **Data**: Response data (if successful)
- **Error**: Error details (if failed)
- **Duration**: Time taken in milliseconds

## Understanding Results

### ✅ Success
- API call completed successfully
- Response received and parsed
- Data available in `result.data`

### ❌ Error
- API call failed
- Check `result.error` for details
- Common causes:
  - Invalid credentials
  - Missing required parameters
  - Backend server error
  - Network connectivity issues

### ⏭️ Skipped
- Test was skipped (optional tests or missing prerequisites)
- Not counted as failure
- Usually means required data (userId, geofenceId) is missing

## Prerequisites

1. **User Account**: Must have a valid security officer account
   - Username: `test_officer`
   - Password: `TestOfficer123!`
   - Or use your own credentials

2. **Backend Running**: Backend must be accessible
   - Production: `https://safetnet.onrender.com`
   - Local: `http://127.0.0.1:8000` (if testing locally)

3. **Network Connection**: Device/emulator must have internet access

## Troubleshooting

### All Tests Failing
- Check backend is running and accessible
- Verify network connection
- Check credentials are correct
- Review backend logs for errors

### Authentication Failing
- Verify username/password are correct
- Check user exists in database
- Ensure user is active
- Check backend authentication endpoint

### 401 Unauthorized Errors
- Token expired - login again
- Invalid token - clear storage and re-login
- Missing token - ensure login succeeded

### 400 Bad Request Errors
- Check request parameters
- Verify data format matches backend expectations
- Review API documentation

### 502/503 Server Errors
- Backend may be sleeping (Render free tier)
- Wait 2-3 minutes and retry
- Check Render dashboard for service status

## Test Coverage

The test suite covers:
- ✅ All authentication flows
- ✅ All CRUD operations (Create, Read, Update, Delete)
- ✅ All service APIs
- ✅ Error handling
- ✅ Token management
- ✅ Response parsing

## Next Steps

1. **Run Full Test Suite**: Use APITestScreen to test all APIs
2. **Review Results**: Check which APIs are working
3. **Fix Issues**: Address any failing tests
4. **Re-test**: Run tests again after fixes
5. **Monitor**: Use test suite during development

## Files Created

- `src/utils/apiTestSuite.ts` - Test suite implementation
- `src/screens/test/APITestScreen.tsx` - Visual test interface
- `API_TEST_GUIDE.md` - This guide

---

**Happy Testing!** 🚀

