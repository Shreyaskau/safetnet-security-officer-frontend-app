# Fix User for API Login

## Problem
Password is set correctly, but API login still fails with "Invalid credentials".

## Solution: Check User Details

Run this in Django shell to see what's missing:

```python
from django.contrib.auth import get_user_model
import json

User = get_user_model()
user = User.objects.get(username='test_officer')

# Show all fields
print("User Fields:")
for field in user._meta.get_fields():
    try:
        value = getattr(user, field.name, None)
        if field.name not in ['password', 'last_login']:
            if value is not None:
                print(f"  {field.name}: {value}")
    except:
        pass

# Check role
if hasattr(user, 'role'):
    print(f"\nRole: {user.role}")
    if user.role != 'security_officer':
        user.role = 'security_officer'
        user.save()
        print("✅ Role updated")

# Test JWT token creation
try:
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    print("\n✅ Can create JWT token")
except Exception as e:
    print(f"\n❌ Cannot create JWT: {e}")
```

## Common Issues

### Issue 1: Role Not Set
```python
if hasattr(user, 'role'):
    user.role = 'security_officer'
    user.save()
```

### Issue 2: User Not Active
```python
user.is_active = True
user.save()
```

### Issue 3: JWT Token Creation Fails
If JWT token creation fails, check:
- `rest_framework_simplejwt` is installed
- User model is compatible with JWT
- No custom authentication requirements

### Issue 4: Backend Login Endpoint Requirements
The backend login endpoint might require:
- Specific role field
- geofence_id
- Other custom fields

## Quick Fix - Set Everything

```python
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(username='test_officer')

# Set everything
user.set_password('TestOfficer123!')
user.is_active = True

if hasattr(user, 'role'):
    user.role = 'security_officer'

if hasattr(user, 'geofence_id'):
    # Set geofence_id if you have one
    # user.geofence_id = 'your_geofence_id'
    pass

user.save()

# Test JWT
from rest_framework_simplejwt.tokens import RefreshToken
refresh = RefreshToken.for_user(user)
print(f"✅ JWT token created: {str(refresh.access_token)[:50]}...")
```

## After Fixing

1. **Test API:**
   ```bash
   node test_all_apis.js
   ```

2. **Test in app:**
   - Reload app
   - Login with: `test_officer` / `TestOfficer123!`

---

**Run the check script to see what's missing!** 🔍

