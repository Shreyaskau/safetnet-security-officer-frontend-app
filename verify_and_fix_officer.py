"""
Script to verify and fix security officer credentials.
Run this in Django shell: python manage.py shell < verify_and_fix_officer.py
Or copy-paste into: python manage.py shell
"""

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

USERNAME = "SecurityOfficer1"
PASSWORD = "Officer001"

print("\n" + "="*60)
print("VERIFYING SECURITY OFFICER")
print("="*60)

# Check if user exists
try:
    user = User.objects.get(username=USERNAME)
    print(f"\n✅ User found: {user.username}")
    print(f"   ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   Active: {user.is_active}")
    print(f"   Staff: {user.is_staff}")
    print(f"   Superuser: {user.is_superuser}")
    
    if not user.is_active:
        print("\n⚠️  WARNING: User is NOT ACTIVE!")
        print("   Fixing: Setting is_active = True")
        user.is_active = True
        user.save()
        print("   ✅ User is now active")
    
    # Test authentication with current password
    print(f"\n🔐 Testing authentication...")
    authenticated_user = authenticate(username=USERNAME, password=PASSWORD)
    
    if authenticated_user:
        print(f"   ✅ Authentication SUCCESSFUL with password: {PASSWORD}")
    else:
        print(f"   ❌ Authentication FAILED with password: {PASSWORD}")
        print(f"\n   🔧 Resetting password to: {PASSWORD}")
        user.set_password(PASSWORD)
        user.save()
        print(f"   ✅ Password reset complete")
        
        # Test again
        authenticated_user = authenticate(username=USERNAME, password=PASSWORD)
        if authenticated_user:
            print(f"   ✅ Authentication now SUCCESSFUL!")
        else:
            print(f"   ❌ Still failing - check Django auth backend")
    
    print("\n" + "-"*60)
    print("FINAL CREDENTIALS:")
    print("-"*60)
    print(f"   Username: {USERNAME}")
    print(f"   Password: {PASSWORD}")
    print(f"   Active: {user.is_active}")
    print("-"*60)
    
except User.DoesNotExist:
    print(f"\n❌ User '{USERNAME}' NOT FOUND!")
    print(f"\n🔧 Creating new user...")
    
    user = User.objects.create_user(
        username=USERNAME,
        email='officer@safetnet.com',
        password=PASSWORD,
        is_active=True
    )
    
    print(f"✅ User created successfully!")
    print(f"   Username: {user.username}")
    print(f"   Password: {PASSWORD}")
    print(f"   Active: {user.is_active}")
    
    # Test authentication
    authenticated_user = authenticate(username=USERNAME, password=PASSWORD)
    if authenticated_user:
        print(f"✅ Authentication test: SUCCESS")
    else:
        print(f"❌ Authentication test: FAILED")

print("\n" + "="*60)
print("READY TO TEST!")
print("="*60)
print(f"\nUse these credentials in the app:")
print(f"   Badge ID or Email: {USERNAME}")
print(f"   Password: {PASSWORD}")
print("\n")

