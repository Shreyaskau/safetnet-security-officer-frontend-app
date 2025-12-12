# Location Setup Guide

## Why location is not working?

Location access requires **TWO things** to be enabled:

1. **Device Location Services (GPS)** - Must be ON
2. **App Location Permission** - Must be granted to the app

---

## 📱 Device Settings to Check:

### Step 1: Enable Device Location Services (GPS)

**On Android:**
1. Open **Settings** on your device
2. Go to **Location** or **Location Services**
3. Turn **ON** the Location toggle at the top
4. Make sure **Location** is enabled (not just Bluetooth/Wi-Fi scanning)

**Quick Access:**
- Pull down notification panel
- Tap the **Location** icon to toggle it ON
- Icon should be highlighted/colored when enabled

### Step 2: Grant App Location Permission

**On Android:**
1. Open **Settings** on your device
2. Go to **Apps** or **Application Manager**
3. Find **SafeTNet Security** app
4. Tap on it
5. Go to **Permissions**
6. Find **Location** permission
7. Select **"Allow all the time"** or **"While using the app"**
   - For maps and live tracking, **"Allow all the time"** is recommended

**Alternative method:**
1. Long-press the **SafeTNet Security** app icon
2. Tap **App info** or **Info** icon
3. Go to **Permissions** → **Location**
4. Enable the permission

---

## ✅ Verification Checklist:

- [ ] Device Location Services (GPS) is **ON**
- [ ] SafeTNet Security app has **Location** permission granted
- [ ] Location permission is set to **"Allow all the time"** or **"While using app"**
- [ ] You're not in Airplane Mode
- [ ] Device has GPS signal (try going outside or near a window)

---

## 🔧 If Still Not Working:

### 1. Restart the App
- Close the app completely
- Reopen it
- Try accessing location again

### 2. Check Native Module (If you see "RNFusedLocation.getCurrentPosition is null")
This error means the app needs to be rebuilt:

```bash
# In project directory
cd android
./gradlew clean
cd ..
npm run android
```

Or in Android Studio:
1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. Run the app again

### 3. Clear App Data (Last Resort)
1. Settings → Apps → SafeTNet Security
2. **Storage** → **Clear Data** (or **Clear Cache** first)
3. Reopen the app
4. Grant permissions again when prompted

---

## 📍 How the App Requests Permission:

When you access the map or try to get location:
1. App checks if device GPS is enabled
2. App requests location permission (if not already granted)
3. If denied, shows alert with instructions
4. You can tap "Open Settings" to go directly to device settings

---

## 💡 Tips:

- **Best accuracy**: Enable "High accuracy" mode in Location settings
- **Battery saving**: "Device only" mode may work but is less accurate
- **Quick test**: Open Google Maps to verify your device location is working
- **Outdoor**: GPS works better outdoors or near windows

---

## 🆘 Still Having Issues?

If location still doesn't work after checking all the above:

1. **Check device logs**:
   - Enable Developer Options
   - Check Logcat for location-related errors

2. **Verify manifest permissions**:
   - App should have `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION` in AndroidManifest.xml

3. **Test with another app**:
   - Try Google Maps or another location app
   - If other apps work, issue is specific to this app

4. **Rebuild the app**:
   - Clean build often fixes native module issues
   - Ensure `react-native-geolocation-service` is properly installed

