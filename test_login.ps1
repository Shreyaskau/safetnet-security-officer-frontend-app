# PowerShell script to test login API
$body = @{
    username = "test_officer"
    password = "TestOfficer123!"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "https://safetnet.onrender.com/api/security/login/" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error:"
    $_.Exception.Response.GetResponseStream() | ForEach-Object {
        $reader = New-Object System.IO.StreamReader($_)
        $reader.ReadToEnd()
    }
}

