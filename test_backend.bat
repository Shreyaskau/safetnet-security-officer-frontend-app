@echo off
echo Testing Backend Connectivity...
echo.

echo Test 1: Simple GET request (should return error but shows server is up)
curl -v "https://safetnet.onrender.com/api/security/login/"
echo.
echo.

echo Test 2: POST request with credentials
curl -X POST "https://safetnet.onrender.com/api/security/login/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test_officer\",\"password\":\"TestOfficer123!\"}"
echo.
echo.

pause

