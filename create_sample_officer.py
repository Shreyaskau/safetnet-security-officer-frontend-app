"""
Create a sample security officer for testing.
Run this in Django shell: python manage.py shell < create_sample_officer.py
Or copy-paste into: python manage.py shell
"""

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

# ============================================
# TEST OFFICER CREDENTIALS
# ============================================
USERNAME = "TestOfficer"
EMAIL = "testofficer@safetnet.com"
PASSWORD = "Test123!"

print("\n" + "="*60)
print("CREATING SAMPLE SECURITY OFFICER FOR TESTING")
print("="*60)

# Check if user already exists
try:
    user = User.objects.get(username=USERNAME)
    print(f"\n⚠️  User '{USERNAME}' already exists!")
    print(f"   User ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   Is Active: {user.is_active}")
    
    # Update user to ensure it's ready for testing
    user.email = EMAIL
    user.is_active = True
    user.is_staff = False
    user.is_superuser = False
    user.set_password(PASSWORD)
    user.save()
    
    print(f"\n✅ User updated successfully!")
    print(f"   - Email updated to: {EMAIL}")
    print(f"   - Active status: {user.is_active}")
    print(f"   - Password reset to: {PASSWORD}")
    
except User.DoesNotExist:
    # Create new user
    print(f"\n🔧 Creating new user...")
    user = User.objects.create_user(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
        is_active=True,
        is_staff=False,
        is_superuser=False
    )
    print(f"✅ User created successfully!")
    print(f"   User ID: {user.id}")

# Test authentication
print(f"\n🔐 Testing authentication...")
authenticated_user = authenticate(username=USERNAME, password=PASSWORD)

if authenticated_user:
    print(f"   ✅ Authentication SUCCESSFUL!")
    print(f"   ✅ User can login with these credentials")
else:
    print(f"   ❌ Authentication FAILED!")
    print(f"   ⚠️  Something is wrong - check Django auth backend")

# Display final credentials
print("\n" + "-"*60)
print("📋 LOGIN CREDENTIALS FOR TESTING:")
print("-"*60)
print(f"   Username: {USERNAME}")
print(f"   Email:    {EMAIL}")
print(f"   Password: {PASSWORD}")
print("-"*60)

# Display user info
print(f"\n👤 USER INFORMATION:")
print(f"   - ID: {user.id}")
print(f"   - Username: {user.username}")
print(f"   - Email: {user.email}")
print(f"   - Active: {user.is_active}")
print(f"   - Staff: {user.is_staff}")
print(f"   - Superuser: {user.is_superuser}")

print("\n" + "="*60)
print("✅ READY TO TEST!")
print("="*60)
print(f"\n📱 In the app, use:")
print(f"   Badge ID or Email: {USERNAME} or {EMAIL}")
print(f"   Password: {PASSWORD}")
print("\n🧪 Test with curl:")
print(f'   curl -X POST "https://safetnet.onrender.com/api/security/login/" \\')
print(f'     -H "Content-Type: application/json" \\')
print(f'     -d \'{{"username": "{USERNAME}", "password": "{PASSWORD}"}}\'')
print("\n")

