# URGENT: Fix Credentials - Backend is Working!

## ✅ Good News!

The request is **reaching the backend**! You got a 400 response, which means:
- ✅ Network is working
- ✅ Backend is reachable  
- ✅ URL is correct
- ✅ Request format is correct
- ❌ **Only issue: Credentials don't match**

## The Problem

The backend returned:
```json
{"non_field_errors": ["Invalid credentials."]}
```

This means the user `test_officer` with password `TestOfficer123!` doesn't exist or password is wrong.

## Quick Fix - Run This NOW

### Step 1: Open Django Shell

```bash
python manage.py shell
```

### Step 2: Copy and Paste This ENTIRE Code

```python
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

USERNAME = "test_officer"
PASSWORD = "TestOfficer123!"

# Get or create user
user, created = User.objects.get_or_create(
    username=USERNAME,
    defaults={
        'email': 'test.officer@safetnet.com',
        'is_active': True
    }
)

if created:
    print(f"✅ Created: {USERNAME}")
else:
    print(f"✅ Found: {USERNAME}")

# CRITICAL: Set password
user.set_password(PASSWORD)
user.is_active = True

if hasattr(user, 'role'):
    user.role = "security_officer"

user.save()
print(f"✅ Password set: {PASSWORD}")

# Test authentication
auth_user = authenticate(username=USERNAME, password=PASSWORD)
if auth_user:
    print(f"✅✅✅ AUTHENTICATION WORKS! ✅✅✅")
    print(f"\n📋 Use in app:")
    print(f"   Username: {USERNAME}")
    print(f"   Password: {PASSWORD}")
else:
    print(f"❌ Authentication failed - check Django settings")
```

### Step 3: Verify Output

You should see:
```
✅ Found: test_officer
✅ Password set: TestOfficer123!
✅✅✅ AUTHENTICATION WORKS! ✅✅✅

📋 Use in app:
   Username: test_officer
   Password: TestOfficer123!
```

## Then Test in App

1. **Reload the app** (shake device → Reload)
2. **Enter credentials:**
   - Username: `test_officer`
   - Password: `TestOfficer123!`
3. **Tap LOGIN**

## If Authentication Test Fails

Check Django `settings.py`:

```python
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # Must have this
]
```

---

**Run the script above to fix credentials, then test login!** 🚀

