# Verify Your Security Officer Credentials

## The Error You're Seeing

```
"non_field_errors": ["Invalid credentials."]
```

This means: **The username/password combination is incorrect.**

## Step 1: Verify Credentials in Django Admin

1. Go to: `https://safetnet.onrender.com/admin/`
2. Login to Django admin
3. Go to **Users** → Find your security officer
4. **Check:**
   - ✅ Username is correct
   - ✅ Email is correct (if you're using email to login)
   - ✅ User is **Active** (checkbox checked)
   - ✅ Password is set correctly

## Step 2: Test Login with Django Shell

Test if the credentials work in Django:

```bash
python manage.py shell
```

Then:
```python
from django.contrib.auth import authenticate

# Test authentication
user = authenticate(username="test.officer@safetnet.com", password="Officer001")

if user:
    print(f"✅ Authentication successful! User: {user.username}")
else:
    print("❌ Authentication failed - wrong credentials")
```

## Step 3: Reset Password (If Needed)

If credentials don't work, reset the password:

### Option A: Django Admin
1. Go to Django Admin → Users
2. Click on your security officer
3. Scroll to **Password** section
4. Click **"Change password"**
5. Enter new password twice
6. Save

### Option B: Django Shell
```python
from django.contrib.auth.models import User

user = User.objects.get(username="test.officer@safetnet.com")
user.set_password("NewPassword123!")
user.save()
print(f"✅ Password updated for {user.username}")
```

## Step 4: Common Issues

### Issue 1: Using Email Instead of Username
- **Problem**: Backend might expect `username` field, not email
- **Solution**: Try using the actual username (not email) in the login field

### Issue 2: User Not Active
- **Problem**: User exists but `is_active=False`
- **Solution**: Check "Active" checkbox in Django admin

### Issue 3: Password Not Set Correctly
- **Problem**: Password wasn't saved properly
- **Solution**: Reset password using Django admin or shell

### Issue 4: Wrong Username Format
- **Problem**: Username has special characters or spaces
- **Solution**: Use exact username as shown in Django admin

## Step 5: Test with curl

Test the exact credentials:

```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "YOUR_EXACT_USERNAME",
    "password": "YOUR_EXACT_PASSWORD"
  }'
```

**Expected Success Response:**
```json
{
  "token": "eyJhbGci...xyz",
  "user": {
    "id": 1,
    "username": "your_username"
  }
}
```

**Expected Error Response (if wrong):**
```json
{
  "non_field_errors": ["Invalid credentials."]
}
```

## Step 6: Create New Test Officer (If Needed)

If you want to create a fresh test officer:

```python
from django.contrib.auth.models import User

# Create new officer
user = User.objects.create_user(
    username='testofficer',
    email='testofficer@safetnet.com',
    password='Test123!',
    is_active=True
)

print(f"✅ Created: {user.username} / Test123!")
```

## Quick Checklist

- [ ] User exists in Django admin
- [ ] Username is correct (exact match)
- [ ] Password is correct
- [ ] User is **Active** (is_active=True)
- [ ] Tested with Django `authenticate()` function
- [ ] Tested with curl command
- [ ] Password doesn't have special encoding issues

---

**Once credentials are verified, the login should work!** 🚀

