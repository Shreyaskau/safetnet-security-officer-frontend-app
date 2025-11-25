# Create/Fix User on Render Backend

## The Problem

Backend is working, but credentials `test_officer` / `TestOfficer123!` don't exist or are wrong.

## Solution: Create User in Database

### Method 1: Django Admin (Easiest)

1. **Go to Django Admin:**
   ```
   https://safetnet.onrender.com/admin/
   ```

2. **Login** with your superuser account

3. **Go to Users** → **Add User**

4. **Fill in:**
   - **Username**: `test_officer`
   - **Email**: `test.officer@safetnet.com`
   - **Password**: `TestOfficer123!`
   - **Active**: ✅ (checked)

5. **If you have a Role field:**
   - Set **Role** to: `security_officer`

6. **Click Save**

### Method 2: Django Shell on Render

If you have shell access to Render:

1. **Open Render Shell** (in Render dashboard → Shell tab)
2. **Run:**
   ```bash
   python manage.py shell
   ```
3. **Paste this code:**
   ```python
   from django.contrib.auth import get_user_model
   from django.contrib.auth import authenticate

   User = get_user_model()

   USERNAME = "test_officer"
   PASSWORD = "TestOfficer123!"

   # Get or create
   user, created = User.objects.get_or_create(
       username=USERNAME,
       defaults={
           'email': 'test.officer@safetnet.com',
           'is_active': True
       }
   )

   # Set password
   user.set_password(PASSWORD)
   user.is_active = True

   if hasattr(user, 'role'):
       user.role = "security_officer"

   user.save()

   # Test
   auth_user = authenticate(username=USERNAME, password=PASSWORD)
   if auth_user:
       print("✅ SUCCESS! User can login")
   else:
       print("❌ FAILED - Check Django settings")
   ```

### Method 3: Django Management Command

Create a management command file in your backend:

**File:** `backend/management/commands/create_test_officer.py`

```python
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates test_officer user for testing'

    def handle(self, *args, **options):
        USERNAME = "test_officer"
        PASSWORD = "TestOfficer123!"

        user, created = User.objects.get_or_create(
            username=USERNAME,
            defaults={
                'email': 'test.officer@safetnet.com',
                'is_active': True
            }
        )

        user.set_password(PASSWORD)
        user.is_active = True

        if hasattr(user, 'role'):
            user.role = "security_officer"

        user.save()

        # Test
        auth_user = authenticate(username=USERNAME, password=PASSWORD)
        if auth_user:
            self.stdout.write(self.style.SUCCESS('✅ User created and authentication works!'))
            self.stdout.write(f'Username: {USERNAME}')
            self.stdout.write(f'Password: {PASSWORD}')
        else:
            self.stdout.write(self.style.ERROR('❌ User created but authentication failed'))
```

**Then run:**
```bash
python manage.py create_test_officer
```

## Quick Test After Creating User

### Test with curl:
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_officer","password":"TestOfficer123!"}'
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

## Then Test in App

1. **Reload the app**
2. **Enter credentials:**
   - Username: `test_officer`
   - Password: `TestOfficer123!`
3. **Tap LOGIN**

---

**Use Django Admin (Method 1) - it's the easiest!** 🚀

