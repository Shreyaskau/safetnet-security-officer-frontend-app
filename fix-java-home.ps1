# Fix JAVA_HOME and ANDROID_HOME Environment Variables
# Run this script as Administrator

Write-Host "=== Fixing Environment Variables ===" -ForegroundColor Cyan
Write-Host ""

# Correct paths
$correctJdkPath = "C:\Program Files\Android\Android Studio\jbr"
$correctAndroidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"

# Verify paths exist
if (-not (Test-Path $correctJdkPath)) {
    Write-Host "❌ JDK not found at: $correctJdkPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $correctAndroidSdkPath)) {
    Write-Host "❌ Android SDK not found at: $correctAndroidSdkPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ JDK found at: $correctJdkPath" -ForegroundColor Green
Write-Host "✅ Android SDK found at: $correctAndroidSdkPath" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: Not running as Administrator!" -ForegroundColor Yellow
    Write-Host "This script needs Administrator privileges to set system environment variables." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Cyan
    Write-Host "1. Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor White
    Write-Host "2. Navigate to this directory" -ForegroundColor White
    Write-Host "3. Run this script again: .\fix-java-home.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "OR set them manually (see instructions below)" -ForegroundColor Yellow
    exit 1
}

# Set JAVA_HOME
Write-Host "Setting JAVA_HOME..." -ForegroundColor Cyan
try {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $correctJdkPath, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✅ JAVA_HOME set to: $correctJdkPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set JAVA_HOME: $_" -ForegroundColor Red
    exit 1
}

# Set ANDROID_HOME
Write-Host "Setting ANDROID_HOME..." -ForegroundColor Cyan
try {
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $correctAndroidSdkPath, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✅ ANDROID_HOME set to: $correctAndroidSdkPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set ANDROID_HOME: $_" -ForegroundColor Red
    exit 1
}

# Update PATH
Write-Host "Updating PATH..." -ForegroundColor Cyan
try {
    $currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
    
    # Remove incorrect paths if they exist
    $currentPath = $currentPath -replace [regex]::Escape("C:\Program Files\Android\Android Studio\bin") + "(;|$)", ""
    
    # Add correct paths
    $pathsToAdd = @(
        "$correctJdkPath\bin",
        "$correctAndroidSdkPath\platform-tools",
        "$correctAndroidSdkPath\tools",
        "$correctAndroidSdkPath\tools\bin"
    )
    
    foreach ($pathToAdd in $pathsToAdd) {
        if ($currentPath -notlike "*$pathToAdd*") {
            $currentPath = "$currentPath;$pathToAdd"
            Write-Host "  ✅ Added to PATH: $pathToAdd" -ForegroundColor Green
        }
    }
    
    [System.Environment]::SetEnvironmentVariable("Path", $currentPath, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✅ PATH updated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update PATH: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Please CLOSE and REOPEN your terminal/PowerShell" -ForegroundColor Yellow
Write-Host "   Environment variables are now set, but you need a fresh terminal to use them." -ForegroundColor Yellow
Write-Host ""
Write-Host "After restarting terminal, verify with:" -ForegroundColor Cyan
Write-Host "  java -version" -ForegroundColor White
Write-Host "  echo `$env:JAVA_HOME" -ForegroundColor White
Write-Host "  echo `$env:ANDROID_HOME" -ForegroundColor White
Write-Host ""



