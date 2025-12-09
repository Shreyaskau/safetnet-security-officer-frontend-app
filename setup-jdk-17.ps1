# Script to set up JDK 17 for React Native Android Build
# Run this script after installing JDK 17

Write-Host "=== JDK 17 Setup Script ===" -ForegroundColor Cyan
Write-Host ""

# Common JDK 17 installation paths
$possiblePaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files\Microsoft\jdk-17*",
    "C:\Program Files (x86)\Java\jdk-17*"
)

$jdk17Path = $null

# Try to find JDK 17
Write-Host "Searching for JDK 17 installation..." -ForegroundColor Cyan
foreach ($pathPattern in $possiblePaths) {
    $found = Get-ChildItem -Path $pathPattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found -and (Test-Path "$($found.FullName)\bin\java.exe")) {
        $jdk17Path = $found.FullName
        Write-Host "✅ Found JDK 17 at: $jdk17Path" -ForegroundColor Green
        break
    }
}

if (-not $jdk17Path) {
    Write-Host "❌ JDK 17 not found in common locations." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Install JDK 17 from: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor White
    Write-Host "2. Then run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or manually set JAVA_HOME:" -ForegroundColor Yellow
    Write-Host '  [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Path\To\JDK17", "User")' -ForegroundColor White
    exit 1
}

# Verify Java version
Write-Host ""
Write-Host "Verifying Java version..." -ForegroundColor Cyan
$javaVersion = & "$jdk17Path\bin\java.exe" -version 2>&1
if ($javaVersion -match "version ""17") {
    Write-Host "✅ Confirmed: Java 17" -ForegroundColor Green
    Write-Host $javaVersion[0] -ForegroundColor Gray
} else {
    Write-Host "⚠️  Warning: This doesn't appear to be Java 17" -ForegroundColor Yellow
    Write-Host $javaVersion[0] -ForegroundColor Gray
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Set JAVA_HOME
Write-Host ""
Write-Host "Setting JAVA_HOME..." -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    # Set for all users
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jdk17Path, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✅ JAVA_HOME set for all users" -ForegroundColor Green
} else {
    # Set for current user
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jdk17Path, [System.EnvironmentVariableTarget]::User)
    Write-Host "✅ JAVA_HOME set for current user" -ForegroundColor Green
    Write-Host "⚠️  Note: Run as Administrator to set JAVA_HOME for all users" -ForegroundColor Yellow
}

# Set for current session
$env:JAVA_HOME = $jdk17Path
Write-Host "✅ JAVA_HOME set for current session" -ForegroundColor Green

# Update gradle.properties
Write-Host ""
Write-Host "Updating gradle.properties..." -ForegroundColor Cyan
$gradleProps = "android\gradle.properties"
if (Test-Path $gradleProps) {
    $content = Get-Content $gradleProps -Raw
    
    # Update trust store path to JDK 17
    $trustStore = "$jdk17Path\lib\security\cacerts"
    if (Test-Path $trustStore) {
        $content = $content -replace 'systemProp\.javax\.net\.ssl\.trustStore=.*', "systemProp.javax.net.ssl.trustStore=$trustStore"
        $content = $content -replace '-Djavax\.net\.ssl\.trustStore=".*"', "-Djavax.net.ssl.trustStore=`"$trustStore`""
        
        Set-Content $gradleProps -Value $content -NoNewline
        Write-Host "✅ Updated trust store path in gradle.properties" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Current JAVA_HOME: $env:JAVA_HOME" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close and restart Android Studio completely" -ForegroundColor White
Write-Host "2. In Android Studio: File → Settings → Build Tools → Gradle" -ForegroundColor White
Write-Host "   Set 'Gradle JDK' to: $jdk17Path" -ForegroundColor White
Write-Host "3. Sync the project: File → Sync Project with Gradle Files" -ForegroundColor White
Write-Host ""
Write-Host "Then try building again!" -ForegroundColor Green

