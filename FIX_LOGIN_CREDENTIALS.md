# Fix "Invalid Credentials" Error

## The Problem

You're getting:
```
"non_field_errors": ["Invalid credentials."]
```

You're trying to login with:
- **Badge ID or Email**: `test.officer@safetnet.com`
- **Password**: `TestOfficer123!`

## The Solution

The **username** in the database is `test_officer`, not the email address.

### ✅ Correct Credentials

```
Username: test_officer
Email: test.officer@safetnet.com
Password: TestOfficer123!
```

### In the App

Enter in the "Badge ID or Email" field:
- ✅ `test_officer` (the username)
- ❌ NOT `test.officer@safetnet.com` (the email)

**Note:** The backend might accept email, but it's safer to use the exact username.

## Verify User Exists

### Step 1: Run Verification Script

```bash
python manage.py shell
```

Then paste:
```python
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

# Check if user exists
try:
    user = User.objects.get(username="test_officer")
    print(f"✅ User found: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Active: {user.is_active}")
    if hasattr(user, 'role'):
        print(f"   Role: {user.role}")
    
    # Test authentication
    auth_user = authenticate(username="test_officer", password="TestOfficer123!")
    if auth_user:
        print(f"\n✅ Login test: SUCCESS!")
        print(f"\n📋 Use these credentials:")
        print(f"   Username: test_officer")
        print(f"   Password: TestOfficer123!")
    else:
        print(f"\n❌ Login test: FAILED")
        print(f"   Password might be wrong")
        
except User.DoesNotExist:
    print("❌ User 'test_officer' not found!")
    print("   Create it using the script in BACKEND_SETUP_GUIDE.md")
```

### Step 2: Create User (If Doesn't Exist)

```python
from django.contrib.auth import get_user_model

User = get_user_model()

user = User.objects.create_user(
    username='test_officer',
    email='test.officer@safetnet.com',
    password='TestOfficer123!',
    is_active=True
)

if hasattr(user, 'role'):
    user.role = 'security_officer'
    user.save()

print(f"✅ Created: {user.username}")
```

## Test with curl

### Test with Username (Should Work)
```bash
curl -X POST "http://localhost:8000/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_officer",
    "password": "TestOfficer123!"
  }'
```

### Test with Email (Might Work)
```bash
curl -X POST "http://localhost:8000/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test.officer@safetnet.com",
    "password": "TestOfficer123!"
  }'
```

**If email doesn't work, use the username instead.**

## Quick Fix

1. **In the app**, change:
   - **Badge ID or Email**: `test_officer` (not the email)
   - **Password**: `TestOfficer123!`

2. **Or** verify the user exists and reset password:
   ```python
   from django.contrib.auth import get_user_model
   User = get_user_model()
   user = User.objects.get(username="test_officer")
   user.set_password("TestOfficer123!")
   user.is_active = True
   user.save()
   print("✅ Password reset!")
   ```

## Common Issues

### Issue 1: Using Email Instead of Username
- **Problem**: Backend expects `username` field, not email
- **Solution**: Use the exact username: `test_officer`

### Issue 2: User Doesn't Exist
- **Problem**: User hasn't been created yet
- **Solution**: Run the create user script from BACKEND_SETUP_GUIDE.md

### Issue 3: Wrong Password
- **Problem**: Password doesn't match
- **Solution**: Reset password using Django shell or admin

### Issue 4: User Not Active
- **Problem**: `is_active=False`
- **Solution**: Set `user.is_active = True` and save

---

**Try logging in with username `test_officer` instead of the email!** 🔧

