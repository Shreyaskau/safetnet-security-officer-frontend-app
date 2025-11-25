# API Testing Guide

## Current Status

**Mock Mode**: Currently ENABLED (all services using mock data)
**Real API Mode**: DISABLED

## How to Switch to Real API Mode

To test all APIs with the real backend, you need to change `USE_MOCK_DATA` from `true` to `false` in the following files:

### Files to Update:

1. **`src/api/services/authService.ts`** (Line 9)
   ```typescript
   const USE_MOCK_DATA = false; // Change to false to use real backend
   ```

2. **`src/api/services/geofenceService.ts`** (Line 7)
   ```typescript
   const USE_MOCK_DATA = false; // Change to false to use real backend
   ```

3. **`src/hooks/useAuth.ts`** (Line 15)
   ```typescript
   const USE_MOCK_DATA = false; // Change to false to use real backend
   ```

### API Endpoints Configuration

The app uses two different API base URLs:

1. **Main API** (for auth, alerts, geofence, etc.):
   - Configured in: `src/api/axios.config.ts`
   - Base URL: `https://safetnet.site/api/` (from `.env` or default)
   - Used by: `authService`, `alertService`, `geofenceService`, etc.

2. **Security API** (for SOS, cases, incidents):
   - Configured in: `src/api/SecurityAPI.ts`
   - Base URL: `https://safetnet.onrender.com/api/security/`
   - Always uses real API (no mock mode)

### Authentication

When using real APIs:
- Login will return a real JWT token
- Token is stored in AsyncStorage as `authToken`
- Token is automatically added to all API requests via axios interceptor
- If you get 401 errors, you need to login first

### Testing Steps

1. **Update all `USE_MOCK_DATA` flags to `false`** in the files listed above

2. **Ensure your backend is running** and accessible:
   - Main API: `https://safetnet.site/api/`
   - Security API: `https://safetnet.onrender.com/api/security/`

3. **Login with real credentials**:
   - The login will now call the real API endpoint
   - Make sure you have valid credentials

4. **Test each feature**:
   - Login/Logout
   - Alerts (fetch, accept, close)
   - Geofence area
   - SOS alerts (already using real API)
   - Profile data

### Quick Toggle Script

You can use find/replace in your IDE:
- Find: `const USE_MOCK_DATA = true;`
- Replace: `const USE_MOCK_DATA = false;`

Or vice versa to switch back to mock mode.

### API Endpoints Available

#### Main API (`https://safetnet.site/api/`)
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Forgot password
- `GET /alerts/` - Get alerts
- `POST /alerts/accept` - Accept alert
- `POST /alerts/close` - Close alert
- `GET /alerts/logs` - Get alert logs
- `POST /geofence/details` - Get geofence details
- `GET /profile` - Get profile

#### Security API (`https://safetnet.onrender.com/api/security/`)
- `GET /sos/` - List SOS alerts
- `GET /sos/{id}/` - Get SOS by ID
- `POST /sos/` - Create SOS
- `PATCH /sos/{id}/resolve/` - Resolve SOS
- `GET /case/` - List cases
- `GET /incidents/` - List incidents

### Troubleshooting

**401 Unauthorized Errors:**
- Make sure you're logged in
- Check if token is being sent in headers
- Verify token hasn't expired

**404 Not Found Errors:**
- Check if endpoint URL is correct
- Verify backend server is running
- Check API base URL configuration

**Network Errors:**
- Verify internet connection
- Check if backend server is accessible
- Check CORS settings on backend

### Switching Back to Mock Mode

To switch back to mock mode for development:
- Change all `USE_MOCK_DATA` flags back to `true`
- Reload the app

---

**Note**: SOSPage (`src/components/common/SOSPage.tsx`) always uses the real Security API and doesn't have mock mode.

