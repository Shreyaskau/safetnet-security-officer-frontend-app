# Find Why API Login Fails

## Problem
Password is correct, user is active, but API login returns "Invalid credentials".

## Likely Cause
The backend login endpoint probably requires a **SecurityOfficer profile** linked to the user.

## Quick Check - Run in Django Shell

```python
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(username='test_officer')

# Check for SecurityOfficer model
try:
    from security.models import SecurityOfficer
    print("✅ SecurityOfficer model found")
    
    try:
        security_officer = SecurityOfficer.objects.get(user=user)
        print(f"✅ User has SecurityOfficer profile (ID: {security_officer.id})")
    except SecurityOfficer.DoesNotExist:
        print("❌ User does NOT have SecurityOfficer profile")
        print("🔧 Creating SecurityOfficer profile...")
        
        security_officer = SecurityOfficer.objects.create(
            user=user,
            status='active'
        )
        print(f"✅ SecurityOfficer profile created (ID: {security_officer.id})")
        
except ImportError:
    print("ℹ️  SecurityOfficer model not found")
except Exception as e:
    print(f"Error: {e}")
```

## Common Backend Requirements

### 1. SecurityOfficer Profile Required
Many security officer apps require a separate profile:
```python
from security.models import SecurityOfficer

SecurityOfficer.objects.create(
    user=user,
    status='active',
    geofence_id='your_geofence_id'  # if required
)
```

### 2. Specific Role Required
```python
user.role = 'security_officer'
user.save()
```

### 3. Geofence ID Required
```python
user.geofence_id = 'your_geofence_id'
user.save()
```

### 4. Custom Authentication
The backend might use custom authentication that checks:
- SecurityOfficer profile exists
- SecurityOfficer status is 'active'
- User has specific permissions
- User is in specific group

## How to Find Requirements

### Option 1: Check Backend Code
Look at your backend login view/serializer:
- `security/views.py` - Find login view
- `security/serializers.py` - Find login serializer
- `security/urls.py` - Find login endpoint

### Option 2: Check Existing Working User
```python
# Find a user that can login
working_user = User.objects.filter(is_active=True).first()

# Check what's different
print(f"Working user: {working_user.username}")
print(f"Has SecurityOfficer: {SecurityOfficer.objects.filter(user=working_user).exists()}")
print(f"Role: {getattr(working_user, 'role', 'N/A')}")
```

### Option 3: Check Backend Logs
Look at Render backend logs when login fails to see what validation is failing.

## Quick Fix - Create SecurityOfficer Profile

```python
from django.contrib.auth import get_user_model
from security.models import SecurityOfficer  # Adjust import path

User = get_user_model()
user = User.objects.get(username='test_officer')

# Create SecurityOfficer profile
security_officer, created = SecurityOfficer.objects.get_or_create(
    user=user,
    defaults={
        'status': 'active',
        # Add other required fields here
    }
)

if created:
    print(f"✅ SecurityOfficer profile created (ID: {security_officer.id})")
else:
    print(f"✅ SecurityOfficer profile already exists (ID: {security_officer.id})")
```

## After Creating SecurityOfficer Profile

1. **Test API:**
   ```bash
   node test_all_apis.js
   ```

2. **Test in app:**
   - Reload app
   - Login with: `test_officer` / `TestOfficer123!`

---

**Most likely issue: Missing SecurityOfficer profile!** 🔍

