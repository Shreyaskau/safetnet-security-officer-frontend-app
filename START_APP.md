# How to Start Your React Native App

## Problem
```
error Cannot start server in new window because no terminal app was specified.
```

## Solution: Two-Terminal Method (Recommended)

### Terminal 1: Start Metro Bundler

1. Open a **new terminal/PowerShell window**
2. Navigate to your project:
   ```powershell
   cd "C:\Users\ADMIN\Desktop\security_officer_app\safetnet-security-officer-frontend-app"
   ```
3. Start Metro bundler:
   ```powershell
   npm start
   ```
4. **Keep this terminal open** - Metro bundler will keep running
5. Wait until you see: `Metro waiting on port 8081`

### Terminal 2: Run Android App

1. In a **different terminal window** (keep Terminal 1 running)
2. Navigate to your project:
   ```powershell
   cd "C:\Users\ADMIN\Desktop\security_officer_app\safetnet-security-officer-frontend-app"
   ```
3. Run the Android app:
   ```powershell
   npm run android
   ```
   OR if Metro is already running:
   ```powershell
   npx react-native run-android --no-packager
   ```

## Alternative: Single Terminal (Background Process)

You can also start Metro in the background:

```powershell
# Start Metro in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\ADMIN\Desktop\security_officer_app\safetnet-security-officer-frontend-app'; npm start"

# Wait a few seconds for Metro to start
Start-Sleep -Seconds 5

# Run Android app
npm run android
```

## Quick Commands Summary

**Terminal 1 (Metro):**
```powershell
cd "C:\Users\ADMIN\Desktop\security_officer_app\safetnet-security-officer-frontend-app"
npm start
```

**Terminal 2 (Build/Run):**
```powershell
cd "C:\Users\ADMIN\Desktop\security_officer_app\safetnet-security-officer-frontend-app"
npm run android
```

## Troubleshooting

- **If Metro won't start:** Make sure port 8081 is not in use
- **If build fails:** Make sure Metro bundler is running first
- **To stop Metro:** Press `Ctrl+C` in the Metro terminal

