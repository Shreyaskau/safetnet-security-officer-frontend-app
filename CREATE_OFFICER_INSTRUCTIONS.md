# Create Test Security Officer - Quick Guide

## Method 1: Django Shell (Recommended) ⚡

**Step 1:** Open Django shell on your backend server:
```bash
python manage.py shell
```

**Step 2:** Copy and paste this entire code:

```python
from django.contrib.auth.models import User

USERNAME = "SecurityOfficer1"
EMAIL = "officer@safetnet.com"
PASSWORD = "Officer001"

if User.objects.filter(username=USERNAME).exists():
    user = User.objects.get(username=USERNAME)
    user.set_password(PASSWORD)
    user.email = EMAIL
    user.is_active = True
    user.save()
    print(f"✅ Updated existing user: {USERNAME}")
else:
    user = User.objects.create_user(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
        is_active=True
    )
    print(f"✅ Created new user: {USERNAME}")

print(f"\n📋 LOGIN CREDENTIALS:")
print(f"   Username: {USERNAME}")
print(f"   Email: {EMAIL}")
print(f"   Password: {PASSWORD}")
print(f"\n✅ User ID: {user.id}")
print(f"✅ Active: {user.is_active}")
```

**Step 3:** Press Enter. You should see:
```
✅ Created new user: test_officer

📋 LOGIN CREDENTIALS:
   Username: test_officer
   Email: test.officer@safetnet.com
   Password: TestOfficer123!

✅ User ID: 1
✅ Active: True
```

---

## Method 2: Using Script File

**Step 1:** Copy `create_test_officer_simple.py` to your Django project root

**Step 2:** Run:
```bash
python manage.py shell < create_test_officer_simple.py
```

---

## Method 3: Django Admin Panel

1. Go to: `https://safetnet.onrender.com/admin/`
2. Click **Users** → **Add User**
3. Fill in:
   - **Username**: `test_officer`
   - **Email**: `test.officer@safetnet.com`
   - **Password**: `TestOfficer123!`
   - **Active**: ✅ (checked)
4. Click **Save**

---

## Test Login

After creating the officer, test login:

### Using curl:
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "SecurityOfficer1",
    "password": "Officer001"
  }'
```

### Using the App:
1. Open the app
2. On the Login screen, you'll see a field labeled **"Badge ID or Email"**
   - This field accepts: Username, Email, or Badge ID
   - Enter: `SecurityOfficer1` (your username - case sensitive!)
3. Enter your **Password**: `Officer001`
4. Tap **LOGIN**

**Note:** Even though the field says "Badge ID or Email", you can enter your username `SecurityOfficer1` there.

---

## Default Test Credentials

```
Username: SecurityOfficer1
Email: officer@safetnet.com
Password: Officer001
```

**Note:** These are the actual credentials used in the backend setup guide. If you've already created an officer with different credentials, use those instead.

---

## Troubleshooting

### "User already exists"
- The script will update the existing user's password
- You can still use the same credentials

### "Permission denied"
- Make sure you're running the script in the Django project directory
- Ensure you have database access

### "Module not found"
- Make sure you're in the correct Django project directory
- Check that Django is installed: `pip list | grep Django`

---

## Verify User Created

Check in Django shell:
```python
from django.contrib.auth.models import User
user = User.objects.get(username="SecurityOfficer1")
print(f"User: {user.username}, Email: {user.email}, Active: {user.is_active}")
```

---

**Ready to test!** 🚀

