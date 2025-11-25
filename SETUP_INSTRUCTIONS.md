# SafeTNet Security Officer App - Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Java Development Kit (JDK)

## Step 1: Install Dependencies

```bash
# Install all npm packages
npm install --legacy-peer-deps

# For iOS (macOS only)
cd ios && pod install && cd ..
```

## Step 2: Configure Environment Variables

1. The `.env` file is already created with placeholder values
2. Update the following values:
   - `API_BASE_URL`: Your Django backend API URL
   - `SOCKET_URL`: Your WebSocket server URL
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - Firebase configuration (if using Firebase)

## Step 3: Android Setup

1. **Update AndroidManifest.xml** (already configured):
   - Permissions are set
   - Make sure to add your Google Maps API key in `AndroidManifest.xml`:
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
   ```

2. **Create a keystore** (for release builds):
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

## Step 4: iOS Setup (macOS only)

1. **Update Info.plist**:
   - Add location permissions descriptions
   - Add Google Maps API key
   - Add background modes for location updates

2. **Install CocoaPods dependencies**:
   ```bash
   cd ios && pod install && cd ..
   ```

## Step 5: Firebase Setup (Optional)

If using Firebase for push notifications:

1. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
2. Place them in:
   - Android: `android/app/google-services.json`
   - iOS: `ios/GoogleService-Info.plist`

## Step 6: Run the App

### Development Mode

```bash
# Start Metro bundler
npm start

# Run on Android (in another terminal)
npm run android

# Run on iOS (in another terminal, macOS only)
npm run ios
```

### Build for Production

**Android:**
```bash
cd android
./gradlew assembleRelease
```

**iOS:**
```bash
cd ios
xcodebuild -workspace SafeTNetSecurity.xcworkspace -scheme SafeTNetSecurity archive
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npm start -- --reset-cache
   ```

2. **Android build errors:**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

3. **iOS pod installation issues:**
   ```bash
   cd ios && pod deintegrate && pod install && cd ..
   ```

4. **Module not found errors:**
   ```bash
   rm -rf node_modules && npm install --legacy-peer-deps
   ```

### Location Permissions

Make sure location permissions are properly configured:
- Android: Already set in `AndroidManifest.xml`
- iOS: Add to `Info.plist`:
  ```xml
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>SafeTNet needs your location to track your position</string>
  <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
  <string>SafeTNet needs your location for emergency response</string>
  ```

## Testing

### Test Login Credentials

You'll need valid credentials from your Django backend. The app expects:
- Email or Badge ID
- Password
- Role: 'security'

### Test API Endpoints

Make sure your Django backend is running and accessible at the `API_BASE_URL` specified in `.env`.

## Next Steps

1. Connect to your Django backend
2. Test authentication flow
3. Test real-time alerts via WebSocket
4. Test location tracking
5. Test push notifications (if configured)

## Support

For issues or questions, refer to the main README.md or contact the development team.












