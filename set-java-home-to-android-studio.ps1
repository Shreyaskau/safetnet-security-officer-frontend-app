# Script to set JAVA_HOME to Android Studio's JDK (Java 21)
# This JDK meets Gradle's Java 17+ requirement

$androidStudioJdk = "C:\Program Files\Android\Android Studio\jbr"

if (Test-Path $androidStudioJdk) {
    Write-Host "✅ Android Studio JDK found: $androidStudioJdk" -ForegroundColor Green
    
    # Check if running as Administrator
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if ($isAdmin) {
        # Set JAVA_HOME permanently for all users
        [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $androidStudioJdk, [System.EnvironmentVariableTarget]::Machine)
        Write-Host "✅ JAVA_HOME set permanently to: $androidStudioJdk" -ForegroundColor Green
    } else {
        # Set JAVA_HOME for current user
        [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $androidStudioJdk, [System.EnvironmentVariableTarget]::User)
        Write-Host "✅ JAVA_HOME set for current user to: $androidStudioJdk" -ForegroundColor Green
        Write-Host "⚠️  Note: Run as Administrator to set JAVA_HOME for all users" -ForegroundColor Yellow
    }
    
    # Set JAVA_HOME for current session
    $env:JAVA_HOME = $androidStudioJdk
    Write-Host "✅ JAVA_HOME set for current session" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Verifying Java version..." -ForegroundColor Cyan
    & "$androidStudioJdk\bin\java.exe" -version
    
    Write-Host ""
    Write-Host "✅ Setup complete!" -ForegroundColor Green
    Write-Host "Please restart your terminal/Android Studio for changes to take effect." -ForegroundColor Yellow
} else {
    Write-Host "❌ Android Studio JDK not found at: $androidStudioJdk" -ForegroundColor Red
    Write-Host "Please check your Android Studio installation path." -ForegroundColor Yellow
}

