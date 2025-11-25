# 🚀 Quick Start - Test on Mobile Device

## ⚡ Fast Setup (5 minutes)

### 1️⃣ Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2️⃣ Create Environment File
```bash
# Copy the example file
copy .env.example .env

# Or on Mac/Linux:
cp .env.example .env
```

Then edit `.env` and add your Google Maps API key.

### 3️⃣ Connect Your Device

**Android:**
- Enable USB Debugging (Settings → Developer Options)
- Connect via USB
- Verify: `adb devices` (should show your device)

**iOS (Mac only):**
- Connect via USB
- Trust computer on device
- Open Xcode and select your device

### 4️⃣ Run the App

**Open TWO terminals:**

**Terminal 1 - Metro Bundler:**
```bash
npm start
```

**Terminal 2 - Run on Device:**

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios --device
```

### 5️⃣ Done! 🎉

The app will install and launch on your device automatically.

---

## 🔧 If Something Goes Wrong

### Device Not Detected (Android):
```bash
adb kill-server
adb start-server
adb devices
```

### Clear Cache:
```bash
npm start -- --reset-cache
```

### Clean Build (Android):
```bash
cd android
./gradlew clean
cd ..
npm run android
```

---

## 📱 What to Test

1. ✅ SplashScreen appears
2. ✅ LoginScreen loads with correct design
3. ✅ Navigation works (drawer, tabs)
4. ✅ Maps display (if API key is set)
5. ✅ Alerts show correctly

---

**Need more details?** See `TESTING_ON_DEVICE.md` for complete guide.


