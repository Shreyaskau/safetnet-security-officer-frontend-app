# How to Use the API Test Script

## ❌ What You Did (Wrong)
```bash
node test_all_apis.js username password
```
This uses literal text "username" and "password" - not real credentials!

## ✅ Correct Usage

### Option 1: Use Real Credentials
```bash
node test_all_apis.js actual_username actual_password
```

**Example:**
```bash
node test_all_apis.js SecurityOfficer1 Officer001
```

### Option 2: Update Script Directly

Edit `test_all_apis.js` and change lines 14-15:
```javascript
const USERNAME = 'your_actual_username';
const PASSWORD = 'your_actual_password';
```

Then run:
```bash
node test_all_apis.js
```

## Where to Get Credentials

### Option 1: From Backend Team
Ask your backend developer:
- "What are the test user credentials for `/api/security/login/`?"
- "Can you provide a security officer account for testing?"

### Option 2: From Postman
If you have Postman tests that work:
1. Check Postman request
2. See what username/password works
3. Use those in the script

### Option 3: From Django Admin
If you have backend access:
1. Go to Django Admin
2. Check existing users
3. Use an existing user's credentials

### Option 4: Create via Backend API
If backend has a user creation endpoint:
1. Create user via API
2. Use those credentials

## Test with Real Credentials

Once you have real credentials:

```bash
# Example with real credentials
node test_all_apis.js myusername mypassword123
```

**Expected Output (if credentials work):**
```
🧪 Starting API Test Suite...
Base URL: https://safetnet.onrender.com/api/security/
Username: myusername
Password: ***************

🔐 Testing Authentication...
✅ Authentication - Login: Login successful. User ID: 123 (542ms)

🆘 Testing SOS APIs...
✅ SOS - List All: API call successful (234ms)
✅ SOS - Get Active: API call successful (189ms)
...
```

## If You Don't Have Credentials

1. **Contact backend team** - Ask for test credentials
2. **Check Postman** - See what credentials work there
3. **Check backend docs** - Look for test user info
4. **Use app login** - If app login works, use those credentials

## Quick Test

To test if credentials work, try login in your app first:
1. Open app
2. Try to login
3. If login works, use those same credentials in the script

---

**You need REAL credentials, not the word "username" and "password"!** 🔑

