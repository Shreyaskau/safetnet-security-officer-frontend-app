# Testing Instructions for Security Officer App

## APK Installation Guide

### For Android Devices:

1. **Download the APK**
   - Download the `app-debug.apk` file from the shared link
   - The file size is approximately 30-50 MB

2. **Enable Unknown Sources**
   - Go to **Settings** > **Security** (or **Settings** > **Apps** > **Special Access**)
   - Enable **"Install Unknown Apps"** or **"Install from Unknown Sources"**
   - Select your file manager (e.g., Files, Downloads, Chrome)
   - Toggle **"Allow from this source"** to ON

3. **Install the APK**
   - Open the downloaded APK file
   - Tap **"Install"**
   - Wait for installation to complete
   - Tap **"Open"** to launch the app

4. **Grant Permissions**
   - When prompted, allow:
     - **Location** (Required for geofence and location features)
     - **Storage** (If needed)
     - **Internet** (Required for API calls)

## App Requirements

- **Android Version**: 6.0 (Marshmallow) or higher
- **Internet Connection**: Required
- **GPS**: Should be enabled for location features
- **Storage**: ~50 MB free space

## Test Credentials

**Note**: Use the credentials provided by your administrator.

If you need test credentials, contact the development team.

## Backend Information

- **Backend URL**: `https://safetnet.onrender.com`
- **Status**: The backend server may take 2-3 minutes to wake up if inactive (free tier)

## Features to Test

### 1. Login
- [ ] Login with valid credentials
- [ ] Verify error handling for invalid credentials
- [ ] Check if session persists after app restart

### 2. Dashboard
- [ ] View recent alerts
- [ ] Check alert statistics (Active, Pending, Resolved)
- [ ] Navigate to different sections

### 3. Alerts
- [ ] View all alerts
- [ ] Filter alerts (All, Emergency, Accepted, Pending, Completed)
- [ ] Respond to alerts
- [ ] Mark alerts as "SOLVED"
- [ ] Delete alerts
- [ ] Check alert details page

### 4. Geofence Map
- [ ] View assigned geofence area
- [ ] Check live location tracking
- [ ] Verify GPS accuracy circle
- [ ] Test geofence entry/exit notifications
- [ ] View alert statistics on map

### 5. Profile
- [ ] View profile information
- [ ] Update profile details
- [ ] Verify changes are saved
- [ ] Check phone number display

### 6. Broadcast
- [ ] Send broadcast alerts
- [ ] Select alert type (General Notice, Warning, Emergency)
- [ ] Verify location is included
- [ ] Check if alert appears in alerts list

## Known Issues / Limitations

- GPS accuracy may vary indoors
- Backend may take 2-3 minutes to respond if inactive
- Some features may require backend configuration

## Reporting Issues

When reporting issues, please include:
1. **Device Model**: (e.g., Samsung Galaxy S21)
2. **Android Version**: (e.g., Android 12)
3. **Steps to Reproduce**: Detailed steps
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happened
6. **Screenshots**: If applicable

## Support

For questions or issues, contact the development team.

---

**App Version**: 2.2.0  
**Build Date**: $(Get-Date -Format "yyyy-MM-dd")
