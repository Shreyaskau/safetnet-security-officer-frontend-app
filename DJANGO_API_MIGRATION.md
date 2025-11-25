# Django REST API Migration - Frontend Updates

## ✅ Changes Made

The frontend has been updated to use Django REST API instead of old PHP endpoints.

### 1. Updated API Endpoints (`src/api/endpoints.ts`)

**Changed from PHP endpoints:**
- `/ws/login.php` → `/api/security/login/`
- `/ws/user_logout.php` → `/api/security/logout/`
- `/ws/get_officer_profile.php` → `/api/security/profile/`
- And all other endpoints...

**New endpoints added:**
- `/api/security/token/refresh/` - JWT token refresh
- `/api/security/dashboard/` - Dashboard data
- `/api/security/notifications/` - Notifications

### 2. Updated Authentication Service (`src/api/services/authService.ts`)

**Django Response Format:**
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

**Changes:**
- ✅ Handles `access` and `refresh` tokens (JWT)
- ✅ Stores both tokens in AsyncStorage
- ✅ Converts Django response to legacy format for compatibility
- ✅ Added `refreshToken()` method for token refresh

### 3. Updated Axios Configuration (`src/api/axios.config.ts`)

**Base URL Configuration:**
- ✅ Supports local development: `http://localhost:8000`
- ✅ Supports production: `https://safetnet.onrender.com`
- ✅ Uses `__DEV__` flag to switch automatically
- ✅ Can be overridden with `.env` file

**Token Handling:**
- ✅ Uses `token` from AsyncStorage (Django format)
- ✅ Falls back to `authToken` for backward compatibility
- ✅ Automatically adds `Authorization: Bearer <token>` header

### 4. Updated Type Definitions (`src/types/user.types.ts`)

**New Types:**
- ✅ `DjangoLoginResponse` - Django API response format
- ✅ Updated `LoginResponse` - Includes Django fields for compatibility

### 5. Updated SecurityAPI (`src/api/SecurityAPI.ts`)

**Token Management:**
- ✅ Handles `access` token (primary)
- ✅ Stores `refresh` token for token refresh
- ✅ Added `refreshAccessToken()` method

### 6. Updated LoginScreen (`src/screens/auth/LoginScreen.tsx`)

**Response Handling:**
- ✅ Extracts `access` token from Django response
- ✅ Handles `user` object from Django format
- ✅ Maps Django user fields to frontend format

## 🔧 Configuration

### Local Development

For local development, the app will use:
```
http://localhost:8000
```

### Production

For production builds, the app will use:
```
https://safetnet.onrender.com
```

### Custom URL

To use a custom URL, create/update `.env` file:
```env
API_BASE_URL=https://your-backend-url.com
```

## 📋 API Endpoint Mapping

| Old PHP Endpoint | New Django Endpoint |
|------------------|---------------------|
| `/ws/login.php` | `/api/security/login/` |
| `/ws/user_logout.php` | `/api/security/logout/` |
| `/ws/get_officer_profile.php` | `/api/security/profile/` |
| `/ws/security_alerts.php` | `/api/security/alerts/` |
| `/ws/get_geofence_details.php` | `/api/security/geofence/` |
| `/ws/get_security_logs.php` | `/api/security/logs/` |

## 🔐 Authentication Flow

### Login
1. Frontend sends: `{ username, password }`
2. Django returns: `{ access, refresh, user: {...} }`
3. Frontend stores:
   - `access` token in `AsyncStorage.token`
   - `refresh` token in `AsyncStorage.refresh_token`
4. Frontend uses `access` token for all API calls

### Token Refresh
1. When `access` token expires (401 error)
2. Frontend uses `refresh` token to get new `access` token
3. Call: `POST /api/security/token/refresh/` with `{ refresh: <refresh_token> }`
4. Django returns: `{ access: <new_access_token> }`
5. Frontend updates stored `access` token

### Logout
1. Frontend calls: `POST /api/security/logout/`
2. Frontend clears:
   - `AsyncStorage.token`
   - `AsyncStorage.refresh_token`
   - All other auth-related storage

## 🧪 Testing

### Test Login
```bash
curl -X POST "http://localhost:8000/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_officer",
    "password": "TestOfficer123!"
  }'
```

**Expected Response:**
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

### Test Token Refresh
```bash
curl -X POST "http://localhost:8000/api/security/token/refresh/" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJhbGci..."
  }'
```

**Expected Response:**
```json
{
  "access": "eyJhbGci..."
}
```

## ⚠️ Important Notes

1. **JWT Tokens**: Django uses JWT tokens (`access` and `refresh`)
2. **Token Expiry**: `access` tokens are short-lived, use `refresh` to get new ones
3. **Role Requirement**: User must have `role="security_officer"` to login
4. **Base URL**: Automatically switches between local/production based on `__DEV__`
5. **Backward Compatibility**: Legacy response format is still supported for mock data

## 🐛 Troubleshooting

### "Invalid credentials" Error
- Check username/password are correct
- Verify user has `role="security_officer"` in database
- Check user is active (`is_active=True`)

### "401 Unauthorized" Error
- Token expired - use refresh token to get new access token
- Token not being sent - check `Authorization: Bearer <token>` header
- Invalid token - login again to get new tokens

### "Network Error" or "Connection Failed"
- Check base URL is correct
- Verify backend server is running
- Check network connectivity
- For local: Ensure using `http://localhost:8000` (not `https`)

### Token Refresh Fails
- Refresh token expired - user needs to login again
- Refresh token invalid - clear storage and login again

---

**All endpoints have been migrated to Django REST API!** ✅

