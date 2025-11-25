# Quick Fix: Django Admin Login Issue

## Problem
"Please enter the correct username and password for a staff account"

## Solutions

### Option 1: Create Test User via Shell (No Admin Needed)

**This is the FASTEST way - you don't need admin access!**

1. **Open Django Shell:**
   ```bash
   python manage.py shell
   ```

2. **Copy-paste this:**
   ```python
   from django.contrib.auth import get_user_model
   from django.contrib.auth import authenticate
   
   User = get_user_model()
   
   # Create or update user
   user, created = User.objects.get_or_create(
       username='test_officer',
       defaults={
           'email': 'test.officer@safetnet.com',
           'is_active': True
       }
   )
   
   user.set_password('TestOfficer123!')
   user.save()
   
   # Test
   if authenticate(username='test_officer', password='TestOfficer123!'):
       print("✅ SUCCESS! User ready to use")
   else:
       print("❌ Failed")
   ```

3. **Done!** Now test in your app.

### Option 2: Create Superuser (If You Need Admin)

```bash
python manage.py createsuperuser
```

Or in shell:
```python
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser('admin', 'admin@example.com', 'Admin123!')
```

### Option 3: Fix Existing Superuser

```python
from django.contrib.auth import get_user_model
User = get_user_model()

# Find your superuser
superuser = User.objects.filter(is_superuser=True).first()
if superuser:
    superuser.set_password('NewPassword123!')
    superuser.is_staff = True  # Required for admin access
    superuser.is_superuser = True
    superuser.save()
    print(f"✅ Fixed: {superuser.username}")
```

## Recommended: Use Option 1

You don't need admin access to create the test user!
Just use Django shell - it's faster and easier.

---

**After creating user, test with: `node test_all_apis.js`** 🚀

