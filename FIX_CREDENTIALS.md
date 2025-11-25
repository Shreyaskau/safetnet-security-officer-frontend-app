# Fix "Invalid Credentials" Error

## The Problem

You're getting:
```
"non_field_errors": ["Invalid credentials."]
```

This means the username/password combination doesn't match what's in the database.

## Quick Fix - Run This Script

### Step 1: Open Django Shell

On your backend server:
```bash
python manage.py shell
```

### Step 2: Copy and Paste This Code

```python
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

USERNAME = "SecurityOfficer1"
PASSWORD = "Officer001"

# Check if user exists
try:
    user = User.objects.get(username=USERNAME)
    print(f"✅ User found: {user.username}")
    print(f"   Active: {user.is_active}")
    
    # Make sure user is active
    if not user.is_active:
        user.is_active = True
        user.save()
        print("✅ User is now active")
    
    # Reset password
    print(f"🔧 Resetting password...")
    user.set_password(PASSWORD)
    user.save()
    print(f"✅ Password reset to: {PASSWORD}")
    
    # Test authentication
    auth_user = authenticate(username=USERNAME, password=PASSWORD)
    if auth_user:
        print(f"✅ Authentication test: SUCCESS!")
    else:
        print(f"❌ Authentication test: FAILED")
        
except User.DoesNotExist:
    print(f"❌ User not found! Creating...")
    user = User.objects.create_user(
        username=USERNAME,
        email='officer@safetnet.com',
        password=PASSWORD,
        is_active=True
    )
    print(f"✅ User created!")
```

### Step 3: Verify Output

You should see:
```
✅ User found: SecurityOfficer1
   Active: True
🔧 Resetting password...
✅ Password reset to: Officer001
✅ Authentication test: SUCCESS!
```

## Alternative: Use Django Admin

1. Go to: `https://safetnet.onrender.com/admin/`
2. Login to Django admin
3. Go to **Users** → Find `SecurityOfficer1`
4. Click on the user
5. Scroll to **Password** section
6. Click **"This form allows you to change the password"**
7. Enter new password: `Officer001`
8. Confirm password: `Officer001`
9. Click **"Change password"**
10. Make sure **"Active"** checkbox is checked
11. Click **Save**

## Common Issues

### Issue 1: User Not Active
- **Fix**: Check "Active" checkbox in Django admin
- **Or**: Run `user.is_active = True; user.save()` in Django shell

### Issue 2: Password Not Set Correctly
- **Fix**: Reset password using Django admin or shell
- **Use**: `user.set_password("Officer001"); user.save()`

### Issue 3: Wrong Username
- **Check**: Exact username in Django admin (case-sensitive)
- **Verify**: `User.objects.get(username="SecurityOfficer1")`

### Issue 4: Password Has Special Characters
- **Fix**: Use a simple password like `Officer001`
- **Avoid**: Special characters that might be encoded differently

## Test After Fix

### Test with Django Shell:
```python
from django.contrib.auth import authenticate

user = authenticate(username="SecurityOfficer1", password="Officer001")
if user:
    print("✅ Works!")
else:
    print("❌ Still broken")
```

### Test with curl:
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "SecurityOfficer1",
    "password": "Officer001"
  }'
```

**Expected Success:**
```json
{
  "token": "eyJhbGci...xyz",
  "user": {...}
}
```

## After Fixing

1. ✅ User exists in database
2. ✅ User is active (`is_active=True`)
3. ✅ Password is set correctly
4. ✅ Authentication test passes in Django shell
5. ✅ Try login in app again

---

**Run the script above to fix the credentials!** 🔧

