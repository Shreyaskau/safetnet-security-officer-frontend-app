# How to Get Working Credentials

## The Problem
You need working credentials to test the APIs, but `test_officer` isn't working.

## Where to Get Credentials

### 1. Ask Backend Developer
**Best option!** Ask them:
- "What are the test credentials for the security officer login API?"
- "Can you create a test user that works with `/api/security/login/`?"
- "What username/password should I use for testing?"

### 2. Check Postman
If you have Postman tests:
1. Open Postman
2. Find the login request that works
3. Check the request body
4. See what username/password is used
5. Use those in the test script

### 3. Check Backend Documentation
Look for:
- API documentation
- Test user credentials
- Setup guide
- README files

### 4. Check Existing Users
If you have backend access:
1. Check Django Admin for existing users
2. Use an existing user's credentials
3. Or ask backend team for a user list

### 5. Use App Login Credentials
If your app login works:
1. Note the username/password that works
2. Use those in the test script

## Quick Checklist

- [ ] Asked backend developer for credentials
- [ ] Checked Postman for working credentials
- [ ] Checked backend documentation
- [ ] Tried existing user credentials
- [ ] Tested credentials in app login first

## Once You Have Credentials

### Test in App First
1. Open app
2. Try login with credentials
3. If it works, proceed to API tests

### Test with Script
```bash
node test_all_apis.js your_username your_password
```

## Example

If backend team says: "Use `admin` / `Admin123!`"

Then run:
```bash
node test_all_apis.js admin Admin123!
```

---

**Get real credentials from backend team or Postman!** 📞

