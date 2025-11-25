# Login Credentials - Security Officer

## ✅ Sample Test Officer (Recommended for Testing)

```
Username: TestOfficer
Email: testofficer@safetnet.com
Password: Test123!
```

**Use this for quick testing!** This officer is created specifically for testing.

## ✅ Your Actual Credentials

```
Username: SecurityOfficer1
Password: Officer001
```

**Important:** Use the exact username (case-sensitive!)

## How to Login in the App

### Using Sample Test Officer:
1. Open the app
2. On Login screen, enter:
   - **Badge ID or Email**: `TestOfficer` or `testofficer@safetnet.com`
   - **Password**: `Test123!`
3. Tap **LOGIN**

### Using Your Actual Officer:
1. Open the app
2. On Login screen, enter:
   - **Badge ID or Email**: `SecurityOfficer1` (enter your username here)
   - **Password**: `Officer001`
3. Tap **LOGIN**

**Note:** The "Badge ID or Email" field accepts:
- ✅ Username (e.g., `TestOfficer` or `SecurityOfficer1`)
- ✅ Email (e.g., `testofficer@safetnet.com`)
- ✅ Badge ID (if you have one)

## Test with curl

### Test with Sample Officer:
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestOfficer",
    "password": "Test123!"
  }'
```

### Test with Your Officer:
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "SecurityOfficer1",
    "password": "Officer001"
  }'
```

## Notes

- Username is **case-sensitive**: `SecurityOfficer1` (capital S and O)
- If backend accepts email, you can also try: `officer@safetnet.com`
- Make sure the user is **Active** in Django admin

---

**Ready to test!** 🚀

