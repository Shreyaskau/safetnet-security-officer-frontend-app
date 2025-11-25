# Backend Setup Guide - Security Officer & Sample Data

## Step 1: Create Security Officer Account(s)

### Option A: Create Sample Test Officer (Recommended for Testing)

**Quick Method - Django Shell:**

```bash
python manage.py shell
```

Then paste:

```python
from django.contrib.auth import get_user_model

User = get_user_model()

# Sample test officer credentials
USERNAME = "test_officer"
EMAIL = "test.officer@safetnet.com"
PASSWORD = "TestOfficer123!"

# Create or update user
if User.objects.filter(username=USERNAME).exists():
    user = User.objects.get(username=USERNAME)
    user.email = EMAIL
    user.role = "security_officer"  # IMPORTANT: Set role
    user.is_active = True
    user.set_password(PASSWORD)
    user.save()
    print(f"✅ Updated: {USERNAME}")
else:
    user = User.objects.create_user(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
        role="security_officer",  # IMPORTANT: Set role
        is_active=True
    )
    print(f"✅ Created: {USERNAME}")

print(f"\n🔐 LOGIN CREDENTIALS:")
print(f"   Username: {USERNAME}")
print(f"   Email: {EMAIL}")
print(f"   Password: {PASSWORD}")
print(f"\n✅ User ID: {user.id}")
print(f"✅ Active: {user.is_active}")
print(f"✅ Role: {user.role}")
```

**Test Credentials:**
- Username: `test_officer`
- Email: `test.officer@safetnet.com`
- Password: `TestOfficer123!`

### Option B: Create Custom Security Officer

**Quick Method - Django Shell:**

```bash
python manage.py shell
```

Then paste:

```python
from django.contrib.auth import get_user_model

User = get_user_model()

user = User.objects.create_user(
    username='SecurityOfficer1',
    email='officer@safetnet.com',
    password='Officer001',
    role='security_officer'  # IMPORTANT: Set role
)

print(f"✅ Security Officer created!")
print(f"   Username: {user.username}")
print(f"   Email: {user.email}")
print(f"   Role: {user.role}")
print(f"   Password: Officer001")
```

**Or use Django Admin:**
1. Go to: `http://localhost:8000/admin/` (or your deployed URL)
2. Click **Users** → **Add User**
3. Username: `SecurityOfficer1`, Email: `officer@safetnet.com`, Password: `Officer001`
4. **IMPORTANT**: Set `Role` to `security_officer` in the form
5. Check `Active` checkbox
6. Save

## Step 2: Test Login

Use the credentials you just created:

**Local Development:**
```bash
curl -X POST "http://localhost:8000/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_officer",
    "password": "TestOfficer123!"
  }'
```

**Production (Render):**
```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_officer",
    "password": "TestOfficer123!"
  }'
```

**Expected Response:**
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

**Important Notes:**
- The API returns JWT tokens: `access` (short-lived) and `refresh` (long-lived)
- Use `access` token in `Authorization: Bearer <access_token>` header for protected endpoints
- Use `refresh` token to get a new `access` token when it expires
- User must have `role="security_officer"` to login successfully

## Step 3: Create Sample Data

### A. Sample SOS Alerts

```python
# Django Shell
from django.contrib.auth import get_user_model
from security_app.models import SOSAlert

User = get_user_model()
user = User.objects.get(username='test_officer')  # Use your security officer

# Create sample SOS alerts
sos_alerts = [
    {
        "description": "Emergency situation at Building A",
        "location": "123 Main St",
        "is_resolved": False,
    },
    {
        "description": "Medical emergency in parking lot",
        "location": "Parking Lot B",
        "is_resolved": True,
    },
    {
        "description": "Suspicious activity reported",
        "location": "Gate 3",
        "is_resolved": False,
    }
]

for alert_data in sos_alerts:
    SOSAlert.objects.create(**alert_data)
    print(f"✅ Created SOS Alert: {alert_data['description']}")
```

### B. Sample Cases

```python
from security_app.models import Case, SOSAlert
from django.contrib.auth import get_user_model
from users.models import SecurityOfficer

User = get_user_model()
user = User.objects.get(username='test_officer')

# Get or create a SecurityOfficer profile (if needed)
# Note: Cases are linked to SecurityOfficer, not User directly
# You may need to create a SecurityOfficer profile first

# Create sample cases
cases = [
    {
        "title": "Theft Investigation",
        "description": "Investigation of reported theft",
        "status": "open",
    },
    {
        "title": "Trespassing Case",
        "description": "Unauthorized person on premises",
        "status": "resolved",
    }
]

for case_data in cases:
    Case.objects.create(**case_data)
    print(f"✅ Created Case: {case_data['title']}")
```

### C. Sample Geofence Areas

```python
from users.models import Geofence, Organization
from django.contrib.auth import get_user_model

User = get_user_model()

# Create or get an organization first
org, created = Organization.objects.get_or_create(
    name="Test Organization",
    defaults={"description": "Test organization for sample data"}
)

# Create geofences with GeoJSON polygon format
geofences = [
    {
        "name": "Main Building",
        "description": "Main building perimeter",
        "polygon_json": {
            "type": "Polygon",
            "coordinates": [[
                [-74.0060, 40.7128],
                [-74.0062, 40.7128],
                [-74.0062, 40.7130],
                [-74.0060, 40.7130],
                [-74.0060, 40.7128]
            ]]
        },
        "organization": org,
        "active": True
    },
    {
        "name": "Parking Area",
        "description": "Parking lot area",
        "polygon_json": {
            "type": "Polygon",
            "coordinates": [[
                [-74.0062, 40.7130],
                [-74.0064, 40.7130],
                [-74.0064, 40.7132],
                [-74.0062, 40.7132],
                [-74.0062, 40.7130]
            ]]
        },
        "organization": org,
        "active": True
    }
]

for geofence_data in geofences:
    Geofence.objects.create(**geofence_data)
    print(f"✅ Created Geofence: {geofence_data['name']}")
```

### D. Sample Incidents

```python
from security_app.models import Incident
from users.models import Geofence

# Get a geofence (use one created above)
geofence = Geofence.objects.first()

incidents = [
    {
        "title": "Fire Alarm",
        "description": "False alarm triggered",
        "severity": "LOW",
        "incident_type": "EMERGENCY",
        "geofence": geofence,
    },
    {
        "title": "Security Breach",
        "description": "Unauthorized access attempt",
        "severity": "HIGH",
        "incident_type": "SECURITY_BREACH",
        "geofence": geofence,
    }
]

for incident_data in incidents:
    Incident.objects.create(**incident_data)
    print(f"✅ Created Incident: {incident_data['title']}")
```

## Step 4: Verify Mock Data is Disabled

Check these files to ensure `USE_MOCK_DATA = false`:

1. ✅ `src/api/services/authService.ts` - Line 9
2. ✅ `src/hooks/useAuth.ts` - Line 14
3. ✅ `src/api/services/geofenceService.ts` - Line 7

All should be set to `false` to use real backend APIs.

## Step 5: Test the App

1. **Login with your security officer:**
   - Username: `test_officer`
   - Email: `test.officer@safetnet.com` (if backend accepts email)
   - Password: `TestOfficer123!`

2. **Verify data loads:**
   - SOS Page should show your sample SOS alerts
   - Cases page should show sample cases
   - Geofence page should show sample geofences
   - Incidents page should show sample incidents

## Quick Setup Script

Create a Django management command or script:

```python
# management/commands/create_sample_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from security_app.models import SOSAlert, Case, Incident
from users.models import Geofence, Organization

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates sample data for testing'

    def handle(self, *args, **options):
        # Create security officer if doesn't exist
        user, created = User.objects.get_or_create(
            username='test_officer',
            defaults={
                'email': 'test.officer@safetnet.com',
                'role': 'security_officer',
                'is_active': True
            }
        )
        if created:
            user.set_password('TestOfficer123!')
            user.save()
            self.stdout.write(self.style.SUCCESS('✅ Security officer created'))
        else:
            self.stdout.write(self.style.SUCCESS('✅ Security officer already exists'))
        
        # Create sample data...
        # (Add your sample data creation code here)
        
        self.stdout.write(self.style.SUCCESS('✅ Sample data created successfully'))
```

Run with:
```bash
python manage.py create_sample_data
```

## API Endpoints to Test

After creating sample data, test these endpoints:

1. **Login:**
   ```
   POST /api/security/login/
   Body: {
     "username": "test_officer",
     "password": "TestOfficer123!"
   }
   Response: {
     "access": "eyJhbGci...",
     "refresh": "eyJhbGci...",
     "user": { "id": 1, "username": "test_officer", "email": "...", "role": "security_officer" }
   }
   ```

2. **List SOS:**
   ```
   GET /api/security/sos/
   Authorization: Bearer <access_token>
   ```

3. **List Cases:**
   ```
   GET /api/security/case/
   Authorization: Bearer <access_token>
   ```

4. **List Incidents:**
   ```
   GET /api/security/incidents/
   Authorization: Bearer <access_token>
   ```

5. **Dashboard:**
   ```
   GET /api/security/dashboard/
   Authorization: Bearer <access_token>
   ```

6. **Profile:**
   ```
   GET /api/security/profile/
   Authorization: Bearer <access_token>
   ```

7. **Notifications:**
   ```
   GET /api/security/notifications/
   Authorization: Bearer <access_token>
   ```

## Troubleshooting

### Issue: "This account is not a security officer"
- **Solution**: Make sure the user has `role="security_officer"` set in the database
- Check: `user.role` should equal `"security_officer"` (not `"USER"` or other roles)

### Issue: "Invalid credentials"
- **Solution**: Verify username and password are correct
- Check: User must have `is_active=True`
- Verify: Password was set using `user.set_password()` not stored as plain text

### Issue: 503 Service Unavailable
- **Solution**: Wait a few minutes for Render.com to spin up the server
- Check if backend is running: `curl https://safetnet.onrender.com/api/security/login/`

### Issue: 401 Unauthorized
- **Solution**: Check if token is being sent correctly in `Authorization: Bearer <token>` header
- Verify security officer account exists and is active
- Make sure you're using the `access` token, not the `refresh` token

### Issue: No data showing
- **Solution**: Verify sample data was created in database
- Check API endpoints return data with proper authentication
- Verify the user has the correct role and permissions

### Issue: "User" is not defined
- **Solution**: Always use `from django.contrib.auth import get_user_model` and `User = get_user_model()` instead of `from django.contrib.auth.models import User`

## Next Steps

1. ✅ Create security officer account with `role="security_officer"`
2. ✅ Create sample data for all pages
3. ✅ Test login with real credentials
4. ✅ Verify all pages load data from backend
5. ✅ Test all CRUD operations (Create, Read, Update, Delete)
6. ✅ Test JWT token refresh mechanism

## Important Notes

- **Role Requirement**: Users must have `role="security_officer"` to use the login API
- **JWT Tokens**: The API returns both `access` and `refresh` tokens - use `access` for API calls
- **Custom User Model**: This project uses a custom User model (`users.User`), not Django's default `auth.User`
- **Always use `get_user_model()`**: Never import `User` directly from `django.contrib.auth.models`
