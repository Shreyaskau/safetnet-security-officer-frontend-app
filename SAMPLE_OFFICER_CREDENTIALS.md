# Sample Security Officer - Test Credentials

## ✅ Test Officer Created

A sample security officer has been created for testing purposes.

## Login Credentials

```
Username: TestOfficer
Email: testofficer@safetnet.com
Password: Test123!
```

## How to Use

### In the App:
1. Open the app
2. On Login screen, enter:
   - **Badge ID or Email**: `TestOfficer` or `testofficer@safetnet.com`
   - **Password**: `Test123!`
3. Tap **LOGIN**

### Test with curl:
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestOfficer",
    "password": "Test123!"
  }'
```

## Create the Officer

### Method 1: Django Shell (Recommended)

```bash
python manage.py shell
```

Then paste:
```python
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

USERNAME = "TestOfficer"
EMAIL = "testofficer@safetnet.com"
PASSWORD = "Test123!"

# Check if exists, update or create
if User.objects.filter(username=USERNAME).exists():
    user = User.objects.get(username=USERNAME)
    user.email = EMAIL
    user.is_active = True
    user.set_password(PASSWORD)
    user.save()
    print(f"✅ Updated: {USERNAME}")
else:
    user = User.objects.create_user(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
        is_active=True
    )
    print(f"✅ Created: {USERNAME}")

# Test authentication
auth_user = authenticate(username=USERNAME, password=PASSWORD)
if auth_user:
    print("✅ Authentication test: SUCCESS!")
else:
    print("❌ Authentication test: FAILED")

print(f"\n📋 Credentials:")
print(f"   Username: {USERNAME}")
print(f"   Password: {PASSWORD}")
```

### Method 2: Using Script File

1. Copy `create_sample_officer.py` to your Django project
2. Run:
```bash
python manage.py shell < create_sample_officer.py
```

### Method 3: Django Admin

1. Go to: `https://safetnet.onrender.com/admin/`
2. Click **Users** → **Add User**
3. Fill in:
   - **Username**: `TestOfficer`
   - **Email**: `testofficer@safetnet.com`
   - **Password**: `Test123!`
   - **Active**: ✅ (checked)
4. Click **Save**

## Verify the Officer

### Check in Django Shell:
```python
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

user = User.objects.get(username="TestOfficer")
print(f"User: {user.username}")
print(f"Email: {user.email}")
print(f"Active: {user.is_active}")

# Test login
auth_user = authenticate(username="TestOfficer", password="Test123!")
if auth_user:
    print("✅ Login works!")
else:
    print("❌ Login failed")
```

## Expected Login Response

**Success (200 OK):**
```json
{
  "token": "eyJhbGci...xyz",
  "user": {
    "id": 1,
    "username": "TestOfficer",
    "email": "testofficer@safetnet.com"
  }
}
```

**Failure (400 Bad Request):**
```json
{
  "non_field_errors": ["Invalid credentials."]
}
```

## Notes

- ✅ User is **Active** (can login)
- ✅ User is **NOT** staff (regular security officer)
- ✅ User is **NOT** superuser (no admin access)
- ✅ Password is simple for testing: `Test123!`
- ✅ Can use either username or email to login

## Troubleshooting

### "Invalid credentials" Error
1. Run the script again to reset password
2. Check user is active in Django admin
3. Verify username/password are correct

### "User already exists"
- The script will update the existing user
- Password will be reset to `Test123!`
- User will be activated

---

**Ready to test! Use `TestOfficer` / `Test123!` to login.** 🚀

