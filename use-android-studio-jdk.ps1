# Script to configure Gradle to use Android Studio's bundled JDK
# This JDK is newer and has better SSL/TLS support

$androidStudioJdk = "C:\Program Files\Android\Android Studio\jbr"
$trustStore = "$androidStudioJdk\lib\security\cacerts"

if (Test-Path $androidStudioJdk) {
    Write-Host "✅ Android Studio JDK found: $androidStudioJdk" -ForegroundColor Green
    
    if (Test-Path $trustStore) {
        Write-Host "✅ Trust store found: $trustStore" -ForegroundColor Green
        
        # Update gradle.properties
        $gradleProps = "android\gradle.properties"
        if (Test-Path $gradleProps) {
            $content = Get-Content $gradleProps -Raw
            
            # Update trust store path
            $content = $content -replace 'systemProp\.javax\.net\.ssl\.trustStore=.*', "systemProp.javax.net.ssl.trustStore=$trustStore"
            $content = $content -replace '-Djavax\.net\.ssl\.trustStore=.*', "-Djavax.net.ssl.trustStore=$trustStore"
            
            Set-Content $gradleProps -Value $content -NoNewline
            
            Write-Host "" -ForegroundColor Green
            Write-Host "✅ Updated gradle.properties to use Android Studio JDK trust store" -ForegroundColor Green
            Write-Host ""
            Write-Host "Now set JAVA_HOME to Android Studio's JDK:" -ForegroundColor Cyan
            Write-Host "  [System.Environment]::SetEnvironmentVariable('JAVA_HOME', '$androidStudioJdk', 'User')" -ForegroundColor White
            Write-Host ""
            Write-Host "Then restart your terminal and try syncing again." -ForegroundColor Yellow
        } else {
            Write-Host "❌ gradle.properties not found" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Trust store not found at: $trustStore" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Android Studio JDK not found at: $androidStudioJdk" -ForegroundColor Red
    Write-Host "Please check your Android Studio installation path." -ForegroundColor Yellow
}

