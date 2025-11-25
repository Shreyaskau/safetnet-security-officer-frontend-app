"""
Django Script to Create Test User
Run with: python manage.py shell < create_test_user.py
Or copy-paste into Django shell
"""

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

# User credentials
USERNAME = 'test_officer'
PASSWORD = 'TestOfficer123!'
EMAIL = 'test.officer@safetnet.com'

print("=" * 50)
print("Creating Test User for API Testing")
print("=" * 50)

# Check if user exists
try:
    user = User.objects.get(username=USERNAME)
    print(f"⚠️  User '{USERNAME}' already exists")
    print("   Updating password and settings...")
    
    # Update password
    user.set_password(PASSWORD)
    user.is_active = True
    user.is_staff = False
    user.is_superuser = False
    
    # Update email if different
    if user.email != EMAIL:
        user.email = EMAIL
    
    user.save()
    print(f"✅ User updated successfully")
    
except User.DoesNotExist:
    print(f"📝 Creating new user: {USERNAME}")
    
    # Create user
    user = User.objects.create_user(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
        is_active=True,
        is_staff=False,
        is_superuser=False
    )
    
    print(f"✅ User created successfully")

# Set role if field exists
if hasattr(user, 'role'):
    user.role = 'security_officer'
    user.save()
    print(f"✅ Role set to: security_officer")
else:
    print("ℹ️  No 'role' field found (this is OK)")

# Set geofence_id if field exists (optional)
if hasattr(user, 'geofence_id'):
    print("ℹ️  geofence_id field exists (leave empty for now)")

# Verify authentication
print("\n" + "=" * 50)
print("Testing Authentication")
print("=" * 50)

auth_user = authenticate(username=USERNAME, password=PASSWORD)

if auth_user:
    print("✅✅✅ AUTHENTICATION SUCCESSFUL! ✅✅✅\n")
    print("User Details:")
    print(f"   ID: {user.id}")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Active: {user.is_active}")
    print(f"   Staff: {user.is_staff}")
    print(f"   Superuser: {user.is_superuser}")
    if hasattr(user, 'role'):
        print(f"   Role: {user.role}")
    print("\n📋 Use these credentials in your app:")
    print(f"   Username: {USERNAME}")
    print(f"   Password: {PASSWORD}")
    print("\n🧪 Test with:")
    print(f'   curl -X POST "https://safetnet.onrender.com/api/security/login/" \\')
    print(f'     -H "Content-Type: application/json" \\')
    print(f'     -d \'{{"username":"{USERNAME}","password":"{PASSWORD}"}}\'')
else:
    print("❌❌❌ AUTHENTICATION FAILED ❌❌❌\n")
    print("Possible issues:")
    print("1. Django AUTHENTICATION_BACKENDS not configured correctly")
    print("2. Password hashing issue")
    print("3. User model customizations")
    print("\nTry:")
    print("1. Check Django settings.py AUTHENTICATION_BACKENDS")
    print("2. Verify user was saved: User.objects.get(username='test_officer')")
    print("3. Check if password was set: user.check_password('TestOfficer123!')")

print("\n" + "=" * 50)

