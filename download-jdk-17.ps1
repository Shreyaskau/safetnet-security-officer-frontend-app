# Helper script to download JDK 17

Write-Host "=== JDK 17 Download Helper ===" -ForegroundColor Cyan
Write-Host ""

# Check if winget is available
$wingetAvailable = Get-Command winget -ErrorAction SilentlyContinue

if ($wingetAvailable) {
    Write-Host "✅ Winget detected! You can install JDK 17 automatically:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run this command:" -ForegroundColor Cyan
    Write-Host "  winget install EclipseAdoptium.Temurin.17.JDK" -ForegroundColor Yellow
    Write-Host ""
    $install = Read-Host "Would you like to install JDK 17 now using winget? (y/n)"
    if ($install -eq "y") {
        Write-Host ""
        Write-Host "Installing JDK 17..." -ForegroundColor Cyan
        winget install EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements
        Write-Host ""
        Write-Host "✅ Installation complete! Now run: .\setup-jdk-17.ps1" -ForegroundColor Green
        exit 0
    }
}

Write-Host "Manual Installation Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open this URL in your browser:" -ForegroundColor White
Write-Host "   https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Select:" -ForegroundColor White
Write-Host "   - Version: 17 (LTS)" -ForegroundColor Gray
Write-Host "   - Operating System: Windows" -ForegroundColor Gray
Write-Host "   - Architecture: x64" -ForegroundColor Gray
Write-Host "   - Package Type: JDK" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Download the .msi installer" -ForegroundColor White
Write-Host ""
Write-Host "4. Run the installer and complete installation" -ForegroundColor White
Write-Host ""
Write-Host "5. After installation, run: .\setup-jdk-17.ps1" -ForegroundColor Yellow
Write-Host ""

# Try to open the download page
$openBrowser = Read-Host "Would you like to open the download page in your browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process "https://adoptium.net/temurin/releases/?version=17"
    Write-Host ""
    Write-Host "✅ Browser opened! Download JDK 17, then run: .\setup-jdk-17.ps1" -ForegroundColor Green
}

