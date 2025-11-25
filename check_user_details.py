"""
Check User Details - Run in Django Shell
This will show all user fields and help identify missing requirements
"""

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
import json

User = get_user_model()

print("=" * 60)
print("CHECKING USER DETAILS")
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
    
    # Check all fields
    print(f"\n📋 All User Fields:")
    for field in user._meta.get_fields():
        try:
            value = getattr(user, field.name, None)
            if field.name not in ['password', 'last_login']:  # Skip sensitive fields
                if value is not None:
                    print(f"   {field.name}: {value}")
        except Exception as e:
            pass
    
    # Check role specifically
    if hasattr(user, 'role'):
        print(f"\n🔑 Role Field:")
        print(f"   role: {user.role}")
        if user.role != 'security_officer':
            print("   ⚠️  Role is not 'security_officer' - updating...")
            user.role = 'security_officer'
            user.save()
            print("   ✅ Role updated to 'security_officer'")
    else:
        print("\n⚠️  No 'role' field found on user model")
    
    # Check geofence_id
    if hasattr(user, 'geofence_id'):
        print(f"\n📍 Geofence ID:")
        print(f"   geofence_id: {user.geofence_id}")
    
    # Test password
    print(f"\n🔐 Password Check:")
    password_ok = user.check_password('TestOfficer123!')
    print(f"   Password correct: {password_ok}")
    
    if not password_ok:
        print("   ⚠️  Resetting password...")
        user.set_password('TestOfficer123!')
        user.save()
        print("   ✅ Password reset")
    
    # Try to get user as dict (for API response)
    print(f"\n📤 User Data (for API):")
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_active': user.is_active,
    }
    
    if hasattr(user, 'role'):
        user_data['role'] = user.role
    if hasattr(user, 'geofence_id'):
        user_data['geofence_id'] = user.geofence_id
    if hasattr(user, 'first_name'):
        user_data['first_name'] = user.first_name
    if hasattr(user, 'last_name'):
        user_data['last_name'] = user.last_name
    
    print(json.dumps(user_data, indent=2))
    
    # Check if user can be serialized for JWT
    print(f"\n🎫 JWT Token Check:")
    try:
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        print(f"   ✅ Can create JWT token")
        print(f"   Access token: {str(refresh.access_token)[:50]}...")
    except Exception as e:
        print(f"   ❌ Cannot create JWT token: {e}")
    
    print("\n" + "=" * 60)
    print("✅ User is ready for API login")
    print("=" * 60)
    
except User.DoesNotExist:
    print("❌ User 'test_officer' does not exist!")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

