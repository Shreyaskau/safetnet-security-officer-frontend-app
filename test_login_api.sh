#!/bin/bash

# Test Login API with curl
# Replace with your actual security officer credentials

BASE_URL="https://safetnet.onrender.com/api/security"
USERNAME="your_security_officer_username_or_email"
PASSWORD="your_password"

echo "Testing Login API..."
echo "URL: $BASE_URL/login/"
echo ""

# Test login
curl -X POST "$BASE_URL/login/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"$PASSWORD\"
  }" \
  -v

echo ""
echo ""
echo "Expected Response Format:"
echo "{"
echo "  \"token\": \"eyJhbGci...xyz\","
echo "  \"user\": {"
echo "    \"id\": 12,"
echo "    \"username\": \"officer1@example.com\","
echo "    \"role\": \"security_officer\""
echo "  }"
echo "}"

