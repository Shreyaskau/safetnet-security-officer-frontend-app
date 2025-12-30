# SafeTNet Security Officer App

A React Native mobile application for security officers to receive, monitor, and respond to emergency alerts from users in their assigned geofence areas.

## ⚠️ Important: Mobile-Only Application

**This is a React Native CLI mobile application (NOT a web application).**

- ❌ **Cannot be deployed on Render** or any web hosting platform
- ❌ **Cannot be deployed as a web service**
- ✅ **Must be built as native mobile apps** (Android APK/AAB or iOS IPA)

### Deployment Methods

This application can only be deployed as:

1. **Android APK/AAB** - For Android devices
   - Debug APK: `cd android && ./gradlew assembleDebug`
   - Release APK: `cd android && ./gradlew assembleRelease`
   - Release AAB (for Play Store): `cd android && ./gradlew bundleRelease`

2. **iOS IPA** - For iOS devices
   - Requires Xcode and macOS
   - Build via Xcode or: `cd ios && xcodebuild -workspace SafeTNetSecurity.xcworkspace -scheme SafeTNetSecurity archive`

3. **Expo** (if migrated) - Would require converting to Expo managed workflow
   - Not currently configured for Expo
   - Would need significant refactoring

**Do NOT attempt to deploy this on Render or any web hosting service** - it will fail because this is a native mobile application, not a web application.

## Features

- 🔐 **Authentication**: Secure login with badge ID or email
- 🚨 **Real-time Alerts**: Receive emergency alerts via WebSocket
- 📍 **Location Tracking**: Real-time location updates and geofence monitoring
- 🗺️ **Interactive Maps**: View user locations, routes, and geofence boundaries
- 📊 **Dashboard**: Alert feed with filtering and statistics
- 📋 **Logs**: Historical alert records with filtering
- 📨 **Broadcast**: Send alerts to all users in assigned area
- 👤 **Profile**: Officer profile with statistics and settings

## Tech Stack

- **React Native** 0.73.2
- **TypeScript**
- **Redux Toolkit** - State management
- **React Navigation** - Navigation
- **React Native Maps** - Map integration
- **Socket.io** - Real-time communication
- **Firebase** - Push notifications
- **Axios** - API calls

## Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. For iOS:
```bash
cd ios && pod install && cd ..
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update API URLs and keys

4. Run the app:
```bash
# Android
npm run android

# iOS
npm run ios
```

## Project Structure

```
src/
├── api/              # API configuration and services
├── components/       # Reusable components
├── hooks/           # Custom React hooks
├── navigation/       # Navigation setup
├── redux/            # Redux store and slices
├── screens/          # Screen components
├── services/         # Background services
├── types/            # TypeScript type definitions
└── utils/            # Utilities and helpers
```

## Configuration

### Environment Variables

Update `.env` with your configuration:

```
API_BASE_URL=https://safetnet.site/api/
SOCKET_URL=wss://safetnet.site/ws/
GOOGLE_MAPS_API_KEY=your_key_here
```

### Android Permissions

Required permissions in `AndroidManifest.xml`:
- INTERNET
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- POST_NOTIFICATIONS

## API Endpoints

The app connects to Django REST API endpoints:
- `/ws/login.php` - Authentication
- `/ws/security_alerts.php` - Get alerts
- `/ws/accept_alert.php` - Accept alert
- `/ws/update_security_location.php` - Update location
- `/ws/get_geofence_details.php` - Get geofence data
- And more...

## Development

### Running in Development Mode

```bash
npm start
```

### Building for Production

#### Android

**Debug APK** (for testing):
```bash
cd android && ./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK** (for direct distribution):
```bash
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

**Release AAB** (for Google Play Store):
```bash
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### iOS

**Archive for App Store**:
```bash
cd ios && xcodebuild -workspace SafeTNetSecurity.xcworkspace -scheme SafeTNetSecurity archive
```

Or use Xcode:
1. Open `ios/SafeTNetSecurity.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Distribute via App Store Connect or export IPA

## Deployment

### ❌ NOT Supported
- **Render** - This is a mobile app, not a web service
- **Vercel** - Web hosting platforms cannot run React Native apps
- **Netlify** - Web hosting platforms cannot run React Native apps
- **Any web hosting service** - React Native CLI apps are native mobile applications

### ✅ Supported Deployment Methods
1. **Google Play Store** - Upload Android AAB file
2. **Apple App Store** - Upload iOS IPA file
3. **Direct APK Distribution** - Distribute APK files directly to users
4. **Enterprise Distribution** - Internal distribution via MDM solutions
5. **TestFlight** (iOS) - Beta testing via Apple TestFlight
6. **Firebase App Distribution** - Beta testing for Android/iOS

## License

Copyright © 2024 SafeTNet Security












