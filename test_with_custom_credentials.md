# Test APIs with Custom Credentials

## Option 1: Update Script Directly

Edit `test_all_apis.js` and change:
```javascript
const USERNAME = 'your_username';
const PASSWORD = 'your_password';
```

Then run:
```bash
node test_all_apis.js
```

## Option 2: Pass Credentials as Arguments

Run with your credentials:
```bash
node test_all_apis.js your_username your_password
```

Example:
```bash
node test_all_apis.js SecurityOfficer1 Officer001
```

## Option 3: Use Environment Variables

Create `.env` file:
```
TEST_USERNAME=test_officer
TEST_PASSWORD=TestOfficer123!
```

Then update script to use:
```javascript
const USERNAME = process.env.TEST_USERNAME || 'test_officer';
const PASSWORD = process.env.TEST_PASSWORD || 'TestOfficer123!';
```

## Current Issue

The test is failing because:
- User `test_officer` doesn't exist in database
- OR password is incorrect

## Solution

1. **Create the user** (see `CREATE_TEST_USER_NOW.md`)
2. **OR use existing credentials** (update script)
3. **Then run tests again**

