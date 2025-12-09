# Fix Gradle Build Error - Kotlin Dependencies

## Error
```
Could not resolve org.jetbrains.kotlin:kotlin-gradle-plugin-api:1.8.0
No PSK available. Unable to resume.
peer not authenticated
```

## Solutions (Try in Order)

### Solution 1: Clear Gradle Cache

```powershell
# Stop Gradle daemon
cd android
.\gradlew --stop

# Clear Gradle cache
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches"
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\daemon"

# Try building again
cd ..
npm run android
```

### Solution 2: Update Gradle Wrapper

```powershell
cd android
.\gradlew wrapper --gradle-version 8.0.2
cd ..
```

### Solution 3: Clean and Rebuild

```powershell
cd android
.\gradlew clean
.\gradlew --stop
cd ..
npm run android
```

### Solution 4: Check Network/Proxy

If you're behind a corporate proxy:

1. **Set proxy in gradle.properties:**
   ```
   systemProp.http.proxyHost=your.proxy.host
   systemProp.http.proxyPort=8080
   systemProp.https.proxyHost=your.proxy.host
   systemProp.https.proxyPort=8080
   ```

2. **Or disable proxy if not needed:**
   ```powershell
   $env:HTTP_PROXY=""
   $env:HTTPS_PROXY=""
   ```

### Solution 5: Update Kotlin Version

The error might be due to Kotlin 1.8.0 being outdated. Try updating:

1. Edit `android/build.gradle`
2. Change `kotlinVersion = "1.8.0"` to `kotlinVersion = "1.9.0"` or latest
3. Update classpath: `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.0")`

### Solution 6: Use Offline Mode (If Dependencies Already Downloaded)

```powershell
cd android
.\gradlew build --offline
```

### Solution 7: Manual Dependency Download

If all else fails, try downloading dependencies manually through Android Studio:

1. Open Android Studio
2. Open the project: `android` folder
3. Let Android Studio sync and download dependencies
4. Then try `npm run android` again

## Quick Fix Script

Run this PowerShell script:

```powershell
cd android
.\gradlew --stop
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\daemon" -ErrorAction SilentlyContinue
cd ..
npm run android
```

## Most Common Fix

Usually, clearing the Gradle cache fixes this:

```powershell
.\gradlew --stop
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches"
npm run android
```

