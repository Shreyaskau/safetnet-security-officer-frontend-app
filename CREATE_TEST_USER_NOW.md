# Create Test User - URGENT

## The Problem
Login is failing because user `test_officer` doesn't exist in the database.

## Quick Fix - Create User Now

### Method 1: Django Admin (Easiest - 2 minutes)

1. **Go to Django Admin:**
   ```
   https://safetnet.onrender.com/admin/
   ```

2. **Login** with your superuser account

3. **Go to Users** → **Add User**

4. **Fill in exactly:**
   - **Username**: `test_officer`
   - **Email**: `test.officer@safetnet.com`
   - **Password**: `TestOfficer123!`
   - **Active**: ✅ (checked)

5. **If you have a Role field:**
   - Set **Role** to: `security_officer`

6. **Click Save**

### Method 2: Django Shell (If you have shell access)

```bash
python manage.py shell
```

Then paste:
```python
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

# Create user
user = User.objects.create_user(
    username='test_officer',
    email='test.officer@safetnet.com',
    password='TestOfficer123!',
    is_active=True
)

# Set role if field exists
if hasattr(user, 'role'):
    user.role = 'security_officer'
    user.save()

# Test authentication
auth_user = authenticate(username='test_officer', password='TestOfficer123!')
if auth_user:
    print("✅ SUCCESS! User created and can login")
    print(f"User ID: {user.id}")
    print(f"Username: {user.username}")
else:
    print("❌ FAILED - Authentication doesn't work")
```

### Method 3: Use Existing User

If you already have a user, update the credentials in:
- `test_all_apis.js` (line 8-9)
- App login screen

## Verify User Exists

### Test with curl:
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_officer","password":"TestOfficer123!"}'
```

**Expected Success Response:**
```json
{
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci...",
  "user": {
    "id": 1,
    "username": "test_officer",
    "email": "test.officer@safetnet.com"
  }
}
```

## After Creating User

1. **Test in App:**
   - Reload app
   - Enter: `test_officer` / `TestOfficer123!`
   - Should login successfully

2. **Run API Tests:**
   ```bash
   node test_all_apis.js
   ```

---

**Use Method 1 (Django Admin) - it's the fastest!** ⚡

