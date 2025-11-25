"""
URGENT: Fix test_officer user for immediate testing
Run: python manage.py shell < fix_test_officer_now.py
Or copy-paste into: python manage.py shell
"""

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

USERNAME = "test_officer"
PASSWORD = "TestOfficer123!"

print("\n" + "="*60)
print("FIXING TEST OFFICER - URGENT")
print("="*60)

# Get or create user
user, created = User.objects.get_or_create(
    username=USERNAME,
    defaults={
        'email': 'test.officer@safetnet.com',
        'is_active': True
    }
)

if created:
    print(f"✅ Created new user: {USERNAME}")
else:
    print(f"✅ Found existing user: {USERNAME}")

# CRITICAL: Set password correctly
user.set_password(PASSWORD)
user.is_active = True

# Set role if field exists
if hasattr(user, 'role'):
    user.role = "security_officer"
    print(f"✅ Role set to: security_officer")

user.save()
print(f"✅ Password set to: {PASSWORD}")
print(f"✅ User activated")

# CRITICAL: Test authentication immediately
print(f"\n🔐 Testing authentication NOW...")
auth_user = authenticate(username=USERNAME, password=PASSWORD)

if auth_user:
    print(f"✅✅✅ AUTHENTICATION SUCCESS! ✅✅✅")
    print(f"\n📋 USE THESE CREDENTIALS IN APP:")
    print(f"   Username: {USERNAME}")
    print(f"   Password: {PASSWORD}")
    print(f"\n✅ Ready to test in app!")
else:
    print(f"❌❌❌ AUTHENTICATION STILL FAILING ❌❌❌")
    print(f"\n⚠️  Possible issues:")
    print(f"   1. Django AUTHENTICATION_BACKENDS not configured correctly")
    print(f"   2. Custom User model has different authentication")
    print(f"   3. Password hashing issue")
    print(f"\n🔧 Try:")
    print(f"   1. Check Django settings.py AUTHENTICATION_BACKENDS")
    print(f"   2. Verify User model is correct")
    print(f"   3. Check if custom authentication is needed")

print("\n" + "="*60)

