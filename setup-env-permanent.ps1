# Permanent Environment Variable Setup for Android Studio
# MUST RUN AS ADMINISTRATOR

Write-Host "=== Setting Up Android Studio Environment Variables ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Navigate to this folder" -ForegroundColor White
    Write-Host "4. Run: .\setup-env-permanent.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Set correct paths
$androidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$jdkPath = "C:\Program Files\Android\Android Studio\jbr"

# Verify paths exist
Write-Host "Verifying installations..." -ForegroundColor Cyan
if (-not (Test-Path $androidSdkPath)) {
    Write-Host "❌ Android SDK not found at: $androidSdkPath" -ForegroundColor Red
    Write-Host "Please install Android Studio first." -ForegroundColor Yellow
    pause
    exit 1
}

if (-not (Test-Path "$jdkPath\bin\java.exe")) {
    Write-Host "❌ Java not found at: $jdkPath\bin\java.exe" -ForegroundColor Red
    Write-Host "Please check Android Studio installation." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Android SDK found: $androidSdkPath" -ForegroundColor Green
Write-Host "✅ Java found: $jdkPath" -ForegroundColor Green
Write-Host ""

# Set ANDROID_HOME
Write-Host "Setting ANDROID_HOME..." -ForegroundColor Cyan
try {
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✅ ANDROID_HOME = $androidSdkPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set ANDROID_HOME: $_" -ForegroundColor Red
    pause
    exit 1
}

# Set JAVA_HOME
Write-Host "Setting JAVA_HOME..." -ForegroundColor Cyan
try {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✅ JAVA_HOME = $jdkPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set JAVA_HOME: $_" -ForegroundColor Red
    pause
    exit 1
}

# Update PATH
Write-Host "Updating PATH..." -ForegroundColor Cyan
try {
    $currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
    
    # Remove incorrect Android Studio paths
    $pathsToRemove = @(
        "C:\Program Files\Android\Android Studio\bin",
        "C:\Program Files\Android\Android Studio\jbr\bin"
    )
    
    foreach ($pathToRemove in $pathsToRemove) {
        if ($currentPath -like "*$pathToRemove*") {
            $currentPath = $currentPath -replace [regex]::Escape($pathToRemove) + "(;|$)", ""
            Write-Host "  🗑️  Removed from PATH: $pathToRemove" -ForegroundColor Yellow
        }
    }
    
    # Add correct paths
    $pathsToAdd = @(
        "$jdkPath\bin",
        "$androidSdkPath\platform-tools",
        "$androidSdkPath\tools",
        "$androidSdkPath\tools\bin"
    )
    
    foreach ($pathToAdd in $pathsToAdd) {
        if ($currentPath -notlike "*$pathToAdd*") {
            $currentPath = "$currentPath;$pathToAdd"
            Write-Host "  ✅ Added to PATH: $pathToAdd" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️  Already in PATH: $pathToAdd" -ForegroundColor Gray
        }
    }
    
    [System.Environment]::SetEnvironmentVariable("Path", $currentPath, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✅ PATH updated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update PATH: $_" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "=== ✅ Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Close ALL terminals and open a NEW one!" -ForegroundColor Yellow
Write-Host "   Environment variables are now set, but existing terminals won't see them." -ForegroundColor Yellow
Write-Host ""
Write-Host "After opening a new terminal, verify with:" -ForegroundColor Cyan
Write-Host "  java -version" -ForegroundColor White
Write-Host "  echo %JAVA_HOME%" -ForegroundColor White
Write-Host "  echo %ANDROID_HOME%" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


