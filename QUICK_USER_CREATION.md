# Quick User Creation - Choose Your Method

## ✅ Method 1: Django Admin (Recommended - Easiest)

1. Go to: `https://safetnet.onrender.com/admin/`
2. Login with superuser
3. Users → Add User
4. Username: `test_officer`
5. Email: `test.officer@safetnet.com`
6. Password: `TestOfficer123!`
7. Active: ✅
8. Role: `security_officer` (if field exists)
9. Save

**Done!** ✅

## Method 2: Django Shell

If you have shell access:

```bash
python manage.py shell
```

Then:
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

print("✅ User created!")
```

## Method 3: Use Existing User

If you already have a user, just reset the password:

```python
from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.get(username='test_officer')
user.set_password('TestOfficer123!')
user.is_active = True
user.save()

print("✅ Password reset!")
```

---

**Use Method 1 (Django Admin) - it's the fastest!** ⚡

