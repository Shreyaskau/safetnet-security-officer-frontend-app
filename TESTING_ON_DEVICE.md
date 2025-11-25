# 📱 Testing on Mobile Device via USB

## Prerequisites

### For Android:
1. ✅ Node.js (v18 or higher)
2. ✅ React Native CLI installed globally
3. ✅ Android Studio installed
4. ✅ Android SDK configured
5. ✅ USB drivers for your device

### For iOS (Mac only):
1. ✅ Node.js (v18 or higher)
2. ✅ Xcode installed
3. ✅ CocoaPods installed
4. ✅ Apple Developer account (for physical device)

---

## 🔧 Setup Steps

### Step 1: Install Dependencies

```bash
# Install npm packages
npm install --legacy-peer-deps

# For iOS only - Install CocoaPods
cd ios && pod install && cd ..
```

### Step 2: Create Environment File

Create a `.env` file in the root directory:

```env
API_BASE_URL=https://safetnet.site/api/
SOCKET_URL=wss://safetnet.site/ws/
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## 📱 Android Setup & Testing

### Step 1: Enable USB Debugging on Your Android Device

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times to enable Developer Options
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Enable **Install via USB** (if available)

### Step 2: Connect Your Device

1. Connect your Android phone to your computer via USB cable
2. On your phone, when prompted, tap **Allow USB Debugging** and check "Always allow from this computer"
3. Verify connection:
   ```bash
   adb devices
   ```
   You should see your device listed (e.g., `ABC123XYZ    device`)

### Step 3: Start Metro Bundler

Open a terminal and run:
```bash
npm start
```
Keep this terminal open - it runs the Metro bundler.

### Step 4: Run on Android Device

Open a **new terminal** and run:
```bash
npm run android
```

Or specify your device:
```bash
npx react-native run-android --deviceId=YOUR_DEVICE_ID
```

### Step 5: Verify Installation

- The app should install and launch on your device
- You should see the SplashScreen, then LoginScreen
- Check Metro bundler terminal for any errors

---

## 🍎 iOS Setup & Testing (Mac Only)

### Step 1: Configure Xcode

1. Open `ios/SafeTNetSecurity.xcworkspace` in Xcode
2. Select your device from the device dropdown (top bar)
3. Go to **Signing & Capabilities** tab
4. Select your **Team** (Apple Developer account)
5. Xcode will automatically create a provisioning profile

### Step 2: Connect Your iPhone/iPad

1. Connect your iOS device via USB
2. Unlock your device
3. Trust the computer if prompted: **Trust This Computer**

### Step 3: Start Metro Bundler

Open a terminal and run:
```bash
npm start
```
Keep this terminal open.

### Step 4: Run on iOS Device

Open a **new terminal** and run:
```bash
npm run ios --device
```

Or specify your device:
```bash
npx react-native run-ios --device "Your Device Name"
```

### Step 5: Trust Developer Certificate (First Time Only)

1. On your iOS device, go to **Settings** → **General** → **VPN & Device Management**
2. Tap on your developer certificate
3. Tap **Trust** → **Trust**

---

## 🚀 Quick Start Commands

### Android:
```bash
# Terminal 1 - Start Metro
npm start

# Terminal 2 - Run on device
npm run android
```

### iOS:
```bash
# Terminal 1 - Start Metro
npm start

# Terminal 2 - Run on device
npm run ios --device
```

---

## 🔍 Troubleshooting

### Android Issues:

#### Device Not Detected:
```bash
# Check if device is connected
adb devices

# If not showing, try:
adb kill-server
adb start-server
adb devices

# Check USB drivers are installed
```

#### Build Errors:
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

#### Metro Bundler Issues:
```bash
# Clear cache and restart
npm start -- --reset-cache
```

#### Port Already in Use:
```bash
# Kill process on port 8081
# Windows:
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8081 | xargs kill -9
```

### iOS Issues:

#### Build Errors:
```bash
# Clean build folder
cd ios
rm -rf build
pod deintegrate
pod install
cd ..
npm run ios --device
```

#### Code Signing Issues:
- Open Xcode → Select your device → Check Signing & Capabilities
- Ensure Team is selected
- Ensure Bundle Identifier is unique

#### Metro Bundler Issues:
```bash
# Clear cache
npm start -- --reset-cache
```

---

## 📋 Verification Checklist

Before testing, ensure:

- [ ] Dependencies installed (`npm install --legacy-peer-deps`)
- [ ] `.env` file created with API URLs
- [ ] USB debugging enabled (Android) or device trusted (iOS)
- [ ] Device connected and detected (`adb devices` for Android)
- [ ] Metro bundler running (`npm start`)
- [ ] App builds and installs successfully
- [ ] App launches on device

---

## 🎯 Testing Checklist

Once app is running on device:

- [ ] SplashScreen displays correctly
- [ ] LoginScreen shows with correct styling
- [ ] Navigation works (drawer, tabs)
- [ ] Maps load (requires Google Maps API key)
- [ ] Alerts display correctly
- [ ] Location permissions requested
- [ ] Network requests work (check API URLs)

---

## 💡 Tips

1. **Keep Metro Bundler Running**: Always keep `npm start` running in one terminal
2. **Hot Reload**: Shake device → **Reload** or press `R` in Metro terminal
3. **Debug Menu**: Shake device → **Debug** to open React Native debugger
4. **Logs**: Check Metro terminal for console logs
5. **Network**: Ensure device and computer are on same network for API calls

---

## 🔐 Important Notes

1. **Google Maps API Key**: Required for maps to work. Get it from [Google Cloud Console](https://console.cloud.google.com/)
2. **API URLs**: Update `.env` with your actual backend URLs
3. **Permissions**: App will request location and notification permissions on first launch
4. **Firebase**: Push notifications require Firebase setup (optional for basic testing)

---

## 📞 Need Help?

If you encounter issues:
1. Check Metro bundler terminal for errors
2. Check device logs: `adb logcat` (Android) or Xcode console (iOS)
3. Verify all prerequisites are installed
4. Try clean build: `cd android && ./gradlew clean` (Android) or clean in Xcode (iOS)

Good luck testing! 🚀












