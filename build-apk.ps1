# Build APK for Testing
# This script builds a debug APK that can be shared with testers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building APK for Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Navigate to project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "`nStep 1: Cleaning build..." -ForegroundColor Yellow
Set-Location android
.\gradlew clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "Clean failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "`nStep 2: Building debug APK..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
.\gradlew assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"

if (Test-Path $apkPath) {
    $fileSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "✅ APK built successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Location: $apkPath" -ForegroundColor Cyan
    Write-Host "Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Upload the APK to Google Drive/Dropbox" -ForegroundColor White
    Write-Host "2. Share the download link with your testers" -ForegroundColor White
    Write-Host "3. Provide installation instructions:" -ForegroundColor White
    Write-Host "   - Enable 'Install from Unknown Sources' on Android device" -ForegroundColor Gray
    Write-Host "   - Download and install the APK" -ForegroundColor Gray
    Write-Host "`nYou can now share this APK with your colleagues!" -ForegroundColor Green
} else {
    Write-Host "`n❌ APK not found at expected location!" -ForegroundColor Red
    exit 1
}

