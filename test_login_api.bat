@echo off
echo Testing Login API...
echo.

curl -X POST "https://safetnet.onrender.com/api/security/login/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"SecurityOfficer1\", \"password\": \"Officer001\"}"

echo.
echo.
pause
