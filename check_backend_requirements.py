"""
Check Backend Requirements for Login
Run in Django shell to see what the backend login endpoint requires
"""

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import json

User = get_user_model()

print("=" * 60)
print("CHECKING BACKEND LOGIN REQUIREMENTS")
print("=" * 60)

user = User.objects.get(username='test_officer')

# 1. Check if there's a SecurityOfficer model
print("\n1️⃣ Checking for SecurityOfficer model...")
try:
    from security.models import SecurityOfficer
    print("   ✅ SecurityOfficer model found")
    
    # Check if user has a SecurityOfficer profile
    try:
        security_officer = SecurityOfficer.objects.get(user=user)
        print(f"   ✅ User has SecurityOfficer profile")
        print(f"      SecurityOfficer ID: {security_officer.id}")
        print(f"      Status: {getattr(security_officer, 'status', 'N/A')}")
        print(f"      Geofence ID: {getattr(security_officer, 'geofence_id', 'N/A')}")
    except SecurityOfficer.DoesNotExist:
        print("   ❌ User does NOT have SecurityOfficer profile")
        print("   🔧 Creating SecurityOfficer profile...")
        
        # Try to create SecurityOfficer
        try:
            security_officer = SecurityOfficer.objects.create(
                user=user,
                status='active'
            )
            print(f"   ✅ SecurityOfficer profile created (ID: {security_officer.id})")
        except Exception as e:
            print(f"   ❌ Failed to create SecurityOfficer: {e}")
            print("   ⚠️  This might be required for login!")
            
except ImportError:
    print("   ℹ️  No SecurityOfficer model found (might be in different app)")
except Exception as e:
    print(f"   ⚠️  Error checking SecurityOfficer: {e}")

# 2. Check user fields
print("\n2️⃣ Checking user fields...")
print(f"   ID: {user.id}")
print(f"   Username: {user.username}")
print(f"   Email: {user.email}")
print(f"   Active: {user.is_active}")
print(f"   Staff: {user.is_staff}")
print(f"   Superuser: {user.is_superuser}")

if hasattr(user, 'role'):
    print(f"   Role: {user.role}")
    if user.role != 'security_officer':
        print("   ⚠️  Role is not 'security_officer' - updating...")
        user.role = 'security_officer'
        user.save()
        print("   ✅ Role updated")

if hasattr(user, 'geofence_id'):
    print(f"   Geofence ID: {user.geofence_id}")

# 3. Check JWT token
print("\n3️⃣ Testing JWT token creation...")
try:
    refresh = RefreshToken.for_user(user)
    print("   ✅ JWT token can be created")
    print(f"   Access token preview: {str(refresh.access_token)[:50]}...")
except Exception as e:
    print(f"   ❌ Cannot create JWT token: {e}")

# 4. Check permissions
print("\n4️⃣ Checking user permissions...")
try:
    from django.contrib.auth.models import Permission
    permissions = user.user_permissions.all()
    groups = user.groups.all()
    print(f"   Direct permissions: {permissions.count()}")
    print(f"   Groups: {groups.count()}")
    if groups.count() > 0:
        for group in groups:
            print(f"      - {group.name}")
except Exception as e:
    print(f"   ⚠️  Error checking permissions: {e}")

# 5. Check if there are other user models
print("\n5️⃣ Checking for related models...")
try:
    # Check for any related models
    related_objects = []
    for field in user._meta.get_fields():
        if hasattr(field, 'related_model'):
            try:
                related = getattr(user, field.name, None)
                if related:
                    related_objects.append(f"{field.name}: {type(related).__name__}")
            except:
                pass
    
    if related_objects:
        print("   Related objects:")
        for obj in related_objects:
            print(f"      - {obj}")
    else:
        print("   No related objects found")
except Exception as e:
    print(f"   ⚠️  Error: {e}")

# 6. Try to find login serializer/view
print("\n6️⃣ Checking login endpoint requirements...")
print("   ℹ️  To check login serializer, look at:")
print("      - security/views.py (login view)")
print("      - security/serializers.py (login serializer)")
print("      - security/urls.py (login endpoint)")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print("✅ User exists and password is set")
print("✅ User is active")
if hasattr(user, 'role'):
    print(f"✅ Role: {user.role}")
else:
    print("⚠️  No role field")

# Check SecurityOfficer
try:
    from security.models import SecurityOfficer
    try:
        SecurityOfficer.objects.get(user=user)
        print("✅ SecurityOfficer profile exists")
    except SecurityOfficer.DoesNotExist:
        print("❌ SecurityOfficer profile MISSING - This might be the issue!")
        print("   The backend login might require a SecurityOfficer profile")
except:
    pass

print("\n💡 Next steps:")
print("   1. Check if SecurityOfficer profile is required")
print("   2. Check backend login serializer/view for requirements")
print("   3. Test with an existing working user to compare")

print("=" * 60)

