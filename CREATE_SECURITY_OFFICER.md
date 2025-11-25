# Create Security Officer - Quick Guide

## Method 1: Using Django Shell (Recommended)

Run this in your Django backend directory:

```python
python manage.py shell
```

Then paste this code:

```python
from django.contrib.auth.models import User

# Create security officer
user = User.objects.create_user(
    username='security_officer1',
    email='officer@example.com',
    password='secure123'
)

print(f"✅ Security Officer created!")
print(f"   Username: {user.username}")
print(f"   Email: {user.email}")
print(f"   ID: {user.id}")
print(f"\n📝 Login credentials:")
print(f"   Username: security_officer1")
print(f"   Password: secure123")
```

## Method 2: Using API (if register endpoint exists)

```bash
curl -X POST "https://safetnet.onrender.com/api/security/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "security_officer1",
    "email": "officer@example.com",
    "password": "secure123",
    "role": "security_officer"
  }'
```

## Method 3: Using Django Admin

1. Go to: `https://safetnet.onrender.com/admin/`
2. Click **Users** → **Add User**
3. Fill in:
   - Username: `security_officer1`
   - Email: `officer@example.com`
   - Password: `secure123`
4. Save

## Test Login

After creating, test login:

```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "security_officer1",
    "password": "secure123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGci...xyz",
  "user": {
    "id": 1,
    "username": "security_officer1",
    "role": "security_officer"
  }
}
```

## Use in App

Login with:
- **Username**: `security_officer1`
- **Password**: `secure123`

That's it! One security officer account ready to use. 🎯

