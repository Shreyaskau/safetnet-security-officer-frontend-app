# Database Connection Status

## Architecture Overview

Your React Native frontend **does NOT directly connect to the database**. Instead:

```
Frontend (React Native) 
    ↓ HTTP/HTTPS API Calls
Backend API (https://safetnet.site/api/)
    ↓ Database Queries
Database (MySQL/PostgreSQL/etc.)
```

## Current Configuration

### Frontend → Backend API
- **Base URL**: `https://safetnet.site/api/`
- **Configuration**: `src/api/axios.config.ts`
- **Status**: ✅ Configured to connect to backend

### Mock Data vs Real API
- **Auth Service**: `USE_MOCK_DATA = false` → Using **real backend API**
- **Geofence Service**: Check `USE_MOCK_DATA` flag
- **Other Services**: All configured to use real APIs

## How to Check Database Connection

### Method 1: Using Settings Screen (Recommended)

1. Open the app
2. Navigate to **Settings** (⚙️ icon on home page)
3. Scroll to **"CONNECTION"** section
4. Tap **"Test Backend Connection"**
5. Review the results:
   - **Backend API**: Shows if backend server is reachable
   - **Database**: Shows if database is accessible through backend
   - **Response Time**: Network latency
   - **Status Code**: HTTP response code
   - **DB Test Result**: Detailed database connectivity status

### Method 2: Test Login

Try logging in with valid credentials:
- If login succeeds → Backend AND database are working
- If login fails with "Invalid credentials" → Backend is working, but credentials are wrong
- If login fails with network error → Backend is not reachable

### Method 3: Check API Endpoints

All API endpoints are defined in `src/api/endpoints.ts`:
- `/ws/login.php` - Authentication
- `/ws/security_alerts.php` - Get alerts (requires database)
- `/ws/get_officer_profile.php` - Get profile (requires database)
- `/ws/get_geofence_details.php` - Get geofence (requires database)

## What the Connection Test Checks

1. **Backend API Reachability**
   - Tests if `https://safetnet.site/api/` is accessible
   - Checks network connectivity

2. **Database Connectivity** (via Backend)
   - Makes a test request to a database-dependent endpoint
   - If backend responds (even with errors), database is likely connected
   - If backend times out or doesn't respond, database may be disconnected

## Understanding the Results

### ✅ Both Connected
- **Backend API**: Connected (green)
- **Database**: Connected (green)
- **Meaning**: Everything is working! Frontend can communicate with backend, and backend can access database.

### ✅ Backend Connected, ❌ Database Not Connected
- **Backend API**: Connected (green)
- **Database**: Not Connected (red)
- **Meaning**: Backend server is running but cannot access the database. Check:
  - Database server status
  - Database credentials in backend config
  - Database network connectivity
  - Database permissions

### ❌ Backend Not Connected
- **Backend API**: Disconnected (red)
- **Database**: Cannot test (backend unreachable)
- **Meaning**: Cannot reach backend server. Check:
  - Backend server is running
  - Network connectivity
  - API URL is correct
  - Firewall/security settings

## Troubleshooting

### If Backend is Not Connected:
1. Verify backend server is running
2. Check `API_BASE_URL` in `.env` file (or default: `https://safetnet.site/api/`)
3. Test URL in browser: `https://safetnet.site/api/ws/login.php`
4. Check network connectivity
5. Verify SSL certificate is valid

### If Database is Not Connected:
1. **Backend Issue**: Check backend server logs
2. **Database Issue**: 
   - Verify database server is running
   - Check database connection string in backend config
   - Verify database credentials
   - Check database user permissions
   - Test database connection from backend server directly

## Important Notes

⚠️ **The frontend cannot directly test database connectivity** - it can only test:
- If the backend API is reachable
- If the backend can respond (which suggests database is working)

The actual database connection is managed by your backend server (PHP/Django/etc.), not the React Native app.

## Current Status

To check your current connection status:
1. Open Settings → Connection section
2. Tap "Test Backend Connection"
3. Review the detailed status report

