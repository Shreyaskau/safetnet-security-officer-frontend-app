# Fix Authentication Issue

## Problem
User was created but authentication still fails.

## Quick Fix - Run in Django Shell

Copy-paste this into your Django shell:

```python
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

# Get user
user = User.objects.get(username='test_officer')

# Force reset password
print("Resetting password...")
user.set_password('TestOfficer123!')
user.is_active = True
user.save()
print("✅ Password reset and user saved")

# Verify password
print(f"Password check: {user.check_password('TestOfficer123!')}")

# Test authentication
auth_user = authenticate(username='test_officer', password='TestOfficer123!')
if auth_user:
    print("✅✅✅ AUTHENTICATION WORKS! ✅✅✅")
    print(f"User ID: {user.id}")
    print(f"Username: {user.username}")
else:
    print("❌ Still failing")
    print("\nCheck:")
    print("1. AUTHENTICATION_BACKENDS in settings.py")
    print("2. Custom user model authentication")
    print("3. Password hashing settings")
```

## Common Issues

### Issue 1: Password Not Saved
**Fix:**
```python
user.set_password('TestOfficer123!')
user.save()  # Make sure to save!
```

### Issue 2: User Not Active
**Fix:**
```python
user.is_active = True
user.save()
```

### Issue 3: Custom Authentication Backend
Check `settings.py`:
```python
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # Make sure this exists
    # ... other backends
]
```

### Issue 4: Custom User Model
If you have a custom user model, make sure it extends `AbstractUser` or has proper authentication.

## Verify User Exists

```python
from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.get(username='test_officer')
print(f"User: {user.username}")
print(f"Active: {user.is_active}")
print(f"Password check: {user.check_password('TestOfficer123!')}")
```

## After Fixing

1. **Test in Django shell:**
   ```python
   authenticate(username='test_officer', password='TestOfficer123!')
   ```

2. **Test API:**
   ```bash
   node test_all_apis.js
   ```

3. **Test in app:**
   - Reload app
   - Login with: `test_officer` / `TestOfficer123!`

---

**Run the verification script first to see what's wrong!** 🔍

