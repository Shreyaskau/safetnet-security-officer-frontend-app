# Test APIs with Working Credentials

## If You Have Working Credentials

If you have credentials that work (from Postman, backend team, or previous tests):

### Method 1: Command Line
```bash
node test_all_apis.js your_username your_password
```

### Method 2: Update Script
Edit `test_all_apis.js` line 10-11:
```javascript
const USERNAME = 'your_working_username';
const PASSWORD = 'your_working_password';
```

Then run:
```bash
node test_all_apis.js
```

### Method 3: Test in App
Use working credentials in the app login screen.

## What Will Be Tested

Once login works, the script will test:

### ✅ Authentication (2 APIs)
- Login
- Token Refresh

### ✅ SOS APIs (9 APIs)
- List All, Get Active, Get Resolved
- Create, Get by ID, Update, Delete, Resolve

### ✅ Case APIs (9 APIs)
- List, Get, Create, Update, Delete
- Accept, Reject, Resolve

### ✅ Alert APIs (4 APIs)
- Get Alerts, Get Logs, Accept, Close

### ✅ Geofence APIs (2 APIs)
- Get Details, Get Users in Area

### ✅ Profile APIs (2 APIs)
- Get Profile, Update Profile

### ✅ Location APIs (2 APIs)
- Update Location, Get User Location

### ✅ Other APIs (3 APIs)
- Send Broadcast, Get Navigation, List Incidents

**Total: 30+ APIs**

## Expected Output

```
🧪 Starting API Test Suite...
✅ Authentication - Login: Success
✅ SOS - List All: Success
✅ Case - List All: Success
...
📊 TEST SUMMARY
✅ Success: 25
❌ Errors: 3
⏭️  Skipped: 5
📝 Total: 33
📈 Success Rate: 75.8%
```

## After Testing

1. **Review results** - See which APIs work
2. **Fix issues** - Address any failing APIs
3. **Re-test** - Run again after fixes

---

**Ready to test once you have working credentials!** 🚀

