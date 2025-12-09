# Install Android SDK Platform-Tools (ADB)

## Issue
```
The system cannot find the path specified.
Read more about how to download Adb at https://reactnative.dev/docs/running-on-device...
```

## Problem
Android SDK Platform-Tools (which includes ADB) is not installed.

## Solution: Install via Android Studio

### Step 1: Open Android Studio SDK Manager

1. **Open Android Studio**
2. Click **Tools** → **SDK Manager** (or click the SDK Manager icon in the toolbar)

### Step 2: Install Platform-Tools

1. **Click the "SDK Tools" tab** (not SDK Platforms)
2. **Check the box for "Android SDK Platform-Tools"**
   - It should show version like "34.0.0" or latest
3. **Also check these if not already installed:**
   - ✅ Android SDK Build-Tools 34.0.0
   - ✅ Android SDK Command-line Tools (latest)
4. Click **Apply** or **OK**
5. Wait for the download and installation to complete

### Step 3: Verify Installation

After installation, verify ADB is installed:

```powershell
# Check if platform-tools directory exists
Test-Path "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

# Should return: True
```

### Step 4: Set Environment Variables (if not done)

Make sure environment variables are set correctly:

1. **Run the setup script as Administrator:**
   ```powershell
   .\setup-env-permanent.ps1
   ```

2. **OR set manually:**
   - `ANDROID_HOME` = `C:\Users\ADMIN\AppData\Local\Android\Sdk`
   - Add to PATH: `%ANDROID_HOME%\platform-tools`

### Step 5: Restart Terminal and Test

1. **Close all terminals**
2. **Open a new terminal**
3. **Test ADB:**
   ```cmd
   adb version
   ```

You should see:
```
Android Debug Bridge version 1.0.XX
```

## After Installation

Once ADB is installed and PATH is set:
- ✅ React Native Doctor will detect ADB
- ✅ You can connect Android devices
- ✅ You can run `npm run android`

## Note About Virtualization Warning

The warning "Android SDK configured but virtualization could not be enabled" is usually harmless and related to:
- Hyper-V or virtualization features
- This doesn't prevent you from building/running apps
- You can ignore it for now


