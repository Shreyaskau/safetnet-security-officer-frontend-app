# Test Backend Connectivity - PowerShell Script

Write-Host "Testing Backend Connectivity..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Simple GET request
Write-Host "Test 1: Checking if backend is reachable..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://safetnet.onrender.com/api/security/login/" -Method GET -TimeoutSec 30
    Write-Host "✅ Backend is reachable!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not reachable or sleeping" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Note: If service was sleeping, wait 2-3 minutes and try again" -ForegroundColor Yellow
}
Write-Host ""

# Test 2: POST request with credentials
Write-Host "Test 2: Testing login endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        username = "test_officer"
        password = "TestOfficer123!"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $response = Invoke-WebRequest -Uri "https://safetnet.onrender.com/api/security/login/" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -TimeoutSec 60

    Write-Host "✅ Login endpoint is working!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Login test failed" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "Test complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If backend is reachable, try login in the app" -ForegroundColor White
Write-Host "2. If backend is sleeping, wait 2-3 minutes and try again" -ForegroundColor White
Write-Host "3. Check Render dashboard to verify service status" -ForegroundColor White

