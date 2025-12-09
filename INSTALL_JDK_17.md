# Install JDK 17 for React Native Android Build

## Why JDK 17?
Android Gradle Plugin 8.0.2 requires Java 17. Java 21 causes compatibility issues with the `jlink` tool used by AGP.

## Step 1: Download JDK 17

### Option A: Adoptium (Eclipse Temurin) - Recommended
1. Go to: https://adoptium.net/temurin/releases/?version=17
2. Select:
   - **Version**: 17 (LTS)
   - **Operating System**: Windows
   - **Architecture**: x64
   - **Package Type**: JDK
3. Click **Download** (JDK with Hotspot)

### Option B: Oracle JDK 17
1. Go to: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
2. Download **Windows x64 Installer**

## Step 2: Install JDK 17

1. Run the installer
2. **Important**: Note the installation path (usually `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot` or `C:\Program Files\Java\jdk-17`)
3. Complete the installation

## Step 3: Set JAVA_HOME to JDK 17

### Using PowerShell (Run as Administrator):

```powershell
# Find JDK 17 installation path
$jdk17Path = "C:\Program Files\Eclipse Adoptium\jdk-17.0.13+11-hotspot"  # Update with your actual path

# Set JAVA_HOME permanently for current user
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jdk17Path, [System.EnvironmentVariableTarget]::User)

# Verify
$env:JAVA_HOME = $jdk17Path
java -version
```

### Or use the provided script:
Run: `.\setup-jdk-17.ps1`

## Step 4: Verify Installation

```powershell
java -version
# Should show: openjdk version "17.0.x"
```

## Step 5: Restart Android Studio

Close and reopen Android Studio completely so it picks up the new JAVA_HOME.

## Step 6: Configure Android Studio

1. File → Settings → Build, Execution, Deployment → Build Tools → Gradle
2. Set **Gradle JDK** to: Your JDK 17 installation
3. Click OK

## Step 7: Clean and Rebuild

```powershell
cd android
.\gradlew clean
.\gradlew --stop
```

Then sync the project in Android Studio.

