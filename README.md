# SafeTNet Security Officer App

A React Native mobile application for security officers to receive, monitor, and respond to emergency alerts from users in their assigned geofence areas.

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

```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
cd ios && xcodebuild -workspace SafeTNetSecurity.xcworkspace -scheme SafeTNetSecurity archive
```

## License

Copyright © 2024 SafeTNet Security












