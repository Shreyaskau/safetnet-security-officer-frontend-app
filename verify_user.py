"""
Verify User in Django Shell
Copy-paste this into Django shell to check user
"""

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

print("=" * 60)
print("VERIFYING USER: test_officer")
print("=" * 60)

try:
    user = User.objects.get(username='test_officer')
    
    print(f"\n✅ User Found:")
    print(f"   ID: {user.id}")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Active: {user.is_active}")
    print(f"   Staff: {user.is_staff}")
    print(f"   Superuser: {user.is_superuser}")
    
    if hasattr(user, 'role'):
        print(f"   Role: {user.role}")
    
    # Check password
    print(f"\n🔐 Testing Password:")
    password_check = user.check_password('TestOfficer123!')
    print(f"   Password check: {password_check}")
    
    if not password_check:
        print("   ⚠️  Password doesn't match! Resetting...")
        user.set_password('TestOfficer123!')
        user.save()
        print("   ✅ Password reset!")
        password_check = user.check_password('TestOfficer123!')
        print(f"   Password check after reset: {password_check}")
    
    # Test authentication
    print(f"\n🔑 Testing Authentication:")
    auth_user = authenticate(username='test_officer', password='TestOfficer123!')
    
    if auth_user:
        print("   ✅✅✅ AUTHENTICATION WORKS! ✅✅✅")
        print(f"   Authenticated user: {auth_user.username}")
    else:
        print("   ❌ Authentication failed!")
        print("\n   Possible issues:")
        print("   1. Check AUTHENTICATION_BACKENDS in settings.py")
        print("   2. Check if user model has custom authentication")
        print("   3. Try: user.set_password('TestOfficer123!') and user.save() again")
        
        # Try to fix
        print("\n   🔧 Attempting to fix...")
        user.set_password('TestOfficer123!')
        user.is_active = True
        user.save()
        print("   ✅ User saved again")
        
        # Test again
        auth_user2 = authenticate(username='test_officer', password='TestOfficer123!')
        if auth_user2:
            print("   ✅✅✅ FIXED! Authentication now works! ✅✅✅")
        else:
            print("   ❌ Still failing - check Django settings")
    
    # Show all fields
    print(f"\n📋 All User Fields:")
    for field in user._meta.get_fields():
        try:
            value = getattr(user, field.name, 'N/A')
            if field.name not in ['password']:  # Don't show password hash
                print(f"   {field.name}: {value}")
        except:
            pass
            
except User.DoesNotExist:
    print("❌ User 'test_officer' does not exist!")
    print("\n   Create it with:")
    print("   user = User.objects.create_user('test_officer', 'test.officer@safetnet.com', 'TestOfficer123!')")
    print("   user.is_active = True")
    print("   user.save()")

print("\n" + "=" * 60)

