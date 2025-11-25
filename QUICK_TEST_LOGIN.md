# Quick Test Login - Sample Officer

## 🚀 Fastest Way to Test Login

Use the **Sample Test Officer** created specifically for testing:

```
Username: TestOfficer
Password: Test123!
```

## Create the Officer (One-Time Setup)

### Step 1: Open Django Shell
```bash
python manage.py shell
```

### Step 2: Copy and Paste This Code
```python
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

USERNAME = "TestOfficer"
EMAIL = "testofficer@safetnet.com"
PASSWORD = "Test123!"

# Create or update
if User.objects.filter(username=USERNAME).exists():
    user = User.objects.get(username=USERNAME)
    user.email = EMAIL
    user.is_active = True
    user.set_password(PASSWORD)
    user.save()
    print(f"✅ Updated: {USERNAME}")
else:
    user = User.objects.create_user(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
        is_active=True
    )
    print(f"✅ Created: {USERNAME}")

# Test
auth_user = authenticate(username=USERNAME, password=PASSWORD)
if auth_user:
    print("✅ Login test: SUCCESS!")
    print(f"\n📋 Use these credentials:")
    print(f"   Username: {USERNAME}")
    print(f"   Password: {PASSWORD}")
else:
    print("❌ Login test: FAILED")
```

### Step 3: Verify Output
You should see:
```
✅ Created: TestOfficer
✅ Login test: SUCCESS!

📋 Use these credentials:
   Username: TestOfficer
   Password: Test123!
```

## Test in the App

1. **Open the app**
2. **Enter credentials:**
   - Badge ID or Email: `TestOfficer`
   - Password: `Test123!`
3. **Tap LOGIN**

## Test with curl

```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestOfficer",
    "password": "Test123!"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGci...xyz",
  "user": {
    "id": 1,
    "username": "TestOfficer",
    "email": "testofficer@safetnet.com"
  }
}
```

## Why This Officer?

- ✅ Simple credentials: `TestOfficer` / `Test123!`
- ✅ Easy to remember
- ✅ Created specifically for testing
- ✅ Always active and ready
- ✅ Can be reset anytime

## Reset Password (If Needed)

If you need to reset the password, run the script again - it will update the existing user.

---

**Ready to test! Use `TestOfficer` / `Test123!`** 🚀

