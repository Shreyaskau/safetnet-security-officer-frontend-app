# Test Database Connection via Frontend API

## Overview

This guide helps you verify that:
1. ✅ Frontend can reach the backend API
2. ✅ Backend API is working
3. ✅ Database is connected and accessible through the API

## Method 1: Using the App (Easiest)

### Step 1: Open Settings
1. Launch the app
2. Login (or skip if not required)
3. Navigate to **Settings** (⚙️ icon)

### Step 2: Test Connection
1. Scroll to **"CONNECTION"** section
2. Tap **"Test Backend Connection"**
3. Wait for the test to complete

### Step 3: Check Results

You should see:

**✅ Success:**
```
Backend API: Connected ✅
Database: Connected ✅
URL: https://safetnet.onrender.com/api/security/
Response Time: XXXms
Status Code: 400 (expected - testing with invalid credentials)
DB Test: ✅ Database connected - API validated credentials
```

**❌ Failure:**
```
Backend API: Disconnected ❌
Database: Not Connected ❌
Error: [error message]
```

## Method 2: Test with curl (Command Line)

### Test Backend Server
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}' \
  -v
```

**Expected Results:**

✅ **Server Connected:**
- Status: `400 Bad Request` or `401 Unauthorized`
- Response: `{"non_field_errors": ["Invalid credentials."]}`
- **This means:** Server is up, API is working, database is accessible

❌ **Server Down:**
- Status: `503 Service Unavailable` or timeout
- **This means:** Server is not running or unreachable

❌ **Database Down:**
- Status: `500 Internal Server Error`
- Response: Database connection error
- **This means:** Server is up but database is not connected

## Method 3: Test Login Endpoint (Verify Database)

### Test with Invalid Credentials (Should Return 400)
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username": "nonexistent", "password": "test"}'
```

**Expected:** `400 Bad Request` with `{"non_field_errors": ["Invalid credentials."]}`

**Why this proves database is connected:**
- The API checked the database for the user
- Database returned "user not found" or "wrong password"
- This means database is accessible and responding

### Test with Valid Credentials (Should Return 200)
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username": "SecurityOfficer1", "password": "Officer001"}'
```

**Expected:** `200 OK` with `{"token": "...", "user": {...}}`

**This proves:**
- ✅ Backend API is working
- ✅ Database is connected
- ✅ User exists in database
- ✅ Authentication is working

## Understanding the Test Results

### Status Code Meanings

| Status | Meaning | Database Status |
|--------|---------|----------------|
| 200 | Success | ✅ Connected |
| 400 | Bad Request (invalid credentials) | ✅ Connected (checked DB) |
| 401 | Unauthorized | ✅ Connected (checked DB) |
| 404 | Endpoint not found | ⚠️ Check API URL |
| 500 | Server error | ❌ Database may be down |
| 503 | Service unavailable | ❌ Server is down |
| Timeout | No response | ❌ Server unreachable |

### Database Connection Indicators

**✅ Database Connected:**
- Status 400/401 with error message about credentials
- Status 200 with user data
- Any structured JSON response (even errors)

**❌ Database Not Connected:**
- Status 500 with database error message
- "Database connection failed" in response
- No response or timeout

## Troubleshooting

### Issue: "Backend API: Disconnected"

**Possible Causes:**
1. Backend server is down
2. Wrong API URL
3. Network connectivity issue
4. Firewall blocking requests

**Solutions:**
1. Check if backend is running: `curl https://safetnet.onrender.com/api/security/login/`
2. Verify API URL in `src/api/SecurityAPI.ts`
3. Check internet connection
4. Try from different network

### Issue: "Database: Not Connected"

**Possible Causes:**
1. Database server is down
2. Database credentials are wrong
3. Database connection string is incorrect
4. Database is not accessible from backend

**Solutions:**
1. Check Django backend logs for database errors
2. Verify database settings in Django `settings.py`
3. Test database connection from Django shell:
   ```python
   from django.db import connection
   connection.ensure_connection()
   print("Database connected!")
   ```
4. Check if database is running and accessible

### Issue: "Status Code: 404"

**Possible Causes:**
1. Wrong API endpoint URL
2. API route doesn't exist

**Solutions:**
1. Verify endpoint: `/api/security/login/`
2. Check Django `urls.py` for correct routing
3. Ensure API is deployed correctly

## Quick Test Checklist

- [ ] Backend server is running
- [ ] API endpoint is accessible
- [ ] Database is connected to backend
- [ ] Frontend can reach backend API
- [ ] Login endpoint responds (even with errors)
- [ ] Database queries work (test with login)

## Expected Flow

```
Frontend App
    ↓
HTTP Request to Backend API
    ↓
Django Backend Receives Request
    ↓
Django Queries Database
    ↓
Database Returns Result
    ↓
Django Sends Response to Frontend
    ↓
Frontend Receives Response
```

**If any step fails, the connection test will show where it failed.**

---

## Test Now!

1. **Open the app** → **Settings** → **Test Backend Connection**
2. **Or use curl** to test the API directly
3. **Check the results** to see if everything is connected

**The connection test will tell you exactly what's working and what's not!** 🔍

