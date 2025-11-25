# Troubleshoot Login - "Invalid Credentials" Error

## Current Error

```
"non_field_errors": ["Invalid credentials."]
```

You're using:
- Username: `test_officer`
- Password: `TestOfficer123!`

## Step-by-Step Fix

### Step 1: Run the Fix Script

```bash
python manage.py shell
```

Then paste the entire content of `create_and_fix_test_officer.py` or run:

```bash
python manage.py shell < create_and_fix_test_officer.py
```

### Step 2: Manual Verification

If the script doesn't work, verify manually:

```python
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

# Check if user exists
user = User.objects.filter(username="test_officer").first()

if user:
    print(f"✅ User found: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Active: {user.is_active}")
    
    # Check if has role field
    if hasattr(user, 'role'):
        print(f"   Role: {user.role}")
        if user.role != "security_officer":
            user.role = "security_officer"
            user.save()
            print(f"   ✅ Role updated to: security_officer")
    
    # Make sure active
    if not user.is_active:
        user.is_active = True
        user.save()
        print(f"   ✅ User activated")
    
    # Reset password
    user.set_password("TestOfficer123!")
    user.save()
    print(f"   ✅ Password reset")
    
    # Test
    auth_user = authenticate(username="test_officer", password="TestOfficer123!")
    if auth_user:
        print(f"\n✅ Login test: SUCCESS!")
    else:
        print(f"\n❌ Login test: FAILED")
        print(f"   Check Django AUTHENTICATION_BACKENDS in settings.py")
else:
    print("❌ User not found - creating...")
    user = User.objects.create_user(
        username="test_officer",
        email="test.officer@safetnet.com",
        password="TestOfficer123!",
        is_active=True
    )
    if hasattr(user, 'role'):
        user.role = "security_officer"
        user.save()
    print(f"✅ Created: {user.username}")
```

### Step 3: Check Django Settings

Verify your Django `settings.py` has correct authentication:

```python
# settings.py

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # Default
    # Add custom backends if you have them
]

# Make sure you're using the correct User model
AUTH_USER_MODEL = 'users.User'  # Or whatever your custom user model is
```

### Step 4: Check User Model

Verify your User model has the `role` field:

```python
# users/models.py or wherever your User model is

class User(AbstractUser):
    role = models.CharField(max_length=50, default='USER')
    # ... other fields
```

### Step 5: Test with Django Admin

1. Go to Django Admin: `http://localhost:8000/admin/`
2. Login as superuser
3. Go to Users
4. Find or create `test_officer`
5. Check:
   - ✅ Username: `test_officer`
   - ✅ Email: `test.officer@safetnet.com`
   - ✅ Active: ✅ (checked)
   - ✅ Role: `security_officer` (if field exists)
6. Click "Change password"
7. Set password: `TestOfficer123!`
8. Save

### Step 6: Test Login API Directly

```bash
curl -X POST "http://localhost:8000/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_officer",
    "password": "TestOfficer123!"
  }'
```

**Expected Success:**
```json
{
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci...",
  "user": {
    "id": 1,
    "username": "test_officer",
    "email": "test.officer@safetnet.com",
    "role": "security_officer"
  }
}
```

**If Still Failing:**
```json
{
  "non_field_errors": ["Invalid credentials."]
}
```

## Common Issues

### Issue 1: User Doesn't Exist
**Solution:** Run the create script above

### Issue 2: Wrong Password
**Solution:** Reset password using `user.set_password("TestOfficer123!")`

### Issue 3: User Not Active
**Solution:** Set `user.is_active = True` and save

### Issue 4: Wrong Role
**Solution:** Set `user.role = "security_officer"` and save

### Issue 5: Custom User Model Issues
**Solution:** Make sure you're using `get_user_model()` not `User` directly

### Issue 6: Authentication Backend Issues
**Solution:** Check `AUTHENTICATION_BACKENDS` in `settings.py`

### Issue 7: Password Hashing
**Solution:** Always use `user.set_password()`, never store plain text

## Quick Checklist

- [ ] User exists in database
- [ ] Username is exactly: `test_officer`
- [ ] Password is: `TestOfficer123!`
- [ ] User is active (`is_active=True`)
- [ ] User has role `security_officer` (if required)
- [ ] Password was set using `set_password()`
- [ ] Authentication test passes in Django shell
- [ ] API endpoint is correct: `/api/security/login/`
- [ ] Backend server is running

## Still Not Working?

1. **Check Django logs** for detailed error messages
2. **Check if login endpoint exists** in your Django URLs
3. **Verify serializer** accepts `username` and `password`
4. **Check if custom authentication** is interfering
5. **Test with Django admin** to verify user can login there

---

**Run the fix script and verify each step!** 🔧

