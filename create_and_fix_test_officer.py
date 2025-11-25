"""
Create and fix test_officer user for login testing.
This script will:
1. Check if user exists
2. Create if doesn't exist
3. Reset password
4. Make sure user is active
5. Set role to security_officer
6. Test authentication

Run: python manage.py shell < create_and_fix_test_officer.py
Or copy-paste into: python manage.py shell
"""

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

USERNAME = "test_officer"
EMAIL = "test.officer@safetnet.com"
PASSWORD = "TestOfficer123!"

print("\n" + "="*60)
print("CREATING/FIXING TEST OFFICER")
print("="*60)

# Step 1: Check if user exists
try:
    user = User.objects.get(username=USERNAME)
    print(f"\n✅ User '{USERNAME}' found!")
    print(f"   ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   Active: {user.is_active}")
    if hasattr(user, 'role'):
        print(f"   Role: {user.role}")
    
    # Step 2: Fix user
    print(f"\n🔧 Fixing user...")
    
    # Update email
    user.email = EMAIL
    print(f"   ✅ Email set to: {EMAIL}")
    
    # Make sure user is active
    if not user.is_active:
        user.is_active = True
        print(f"   ✅ User activated")
    else:
        print(f"   ✅ User is already active")
    
    # Set role if field exists
    if hasattr(user, 'role'):
        user.role = "security_officer"
        print(f"   ✅ Role set to: security_officer")
    else:
        print(f"   ⚠️  No 'role' field found (might be using different user model)")
    
    # Reset password
    user.set_password(PASSWORD)
    print(f"   ✅ Password reset to: {PASSWORD}")
    
    # Save all changes
    user.save()
    print(f"\n✅ User updated successfully!")
    
except User.DoesNotExist:
    # Step 3: Create user if doesn't exist
    print(f"\n❌ User '{USERNAME}' not found!")
    print(f"🔧 Creating new user...")
    
    try:
        # Try to create with role field
        user = User.objects.create_user(
            username=USERNAME,
            email=EMAIL,
            password=PASSWORD,
            is_active=True
        )
        
        # Set role if field exists
        if hasattr(user, 'role'):
            user.role = "security_officer"
            user.save()
            print(f"   ✅ Role set to: security_officer")
        
        print(f"✅ User created successfully!")
        print(f"   ID: {user.id}")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Active: {user.is_active}")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        print(f"\n🔧 Trying alternative method...")
        
        # Alternative: Create without role first
        user = User.objects.create_user(
            username=USERNAME,
            email=EMAIL,
            password=PASSWORD,
            is_active=True
        )
        
        # Try to set role separately
        try:
            if hasattr(user, 'role'):
                user.role = "security_officer"
                user.save()
        except:
            pass
        
        print(f"✅ User created (role may need manual setting)")

# Step 4: Verify user
print(f"\n" + "-"*60)
print("VERIFYING USER")
print("-"*60)

try:
    user = User.objects.get(username=USERNAME)
    print(f"✅ User exists:")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Active: {user.is_active}")
    if hasattr(user, 'role'):
        print(f"   Role: {user.role}")
    else:
        print(f"   Role: (field not found)")
    
    # Step 5: Test authentication
    print(f"\n🔐 Testing authentication...")
    
    # Test with username
    auth_user = authenticate(username=USERNAME, password=PASSWORD)
    if auth_user:
        print(f"   ✅ Authentication SUCCESS with username!")
        print(f"   ✅ User can login!")
    else:
        print(f"   ❌ Authentication FAILED with username")
        print(f"   ⚠️  Password might still be wrong")
        
        # Try resetting password again
        print(f"\n🔧 Resetting password again...")
        user.set_password(PASSWORD)
        user.save()
        
        # Test again
        auth_user = authenticate(username=USERNAME, password=PASSWORD)
        if auth_user:
            print(f"   ✅ Authentication SUCCESS after password reset!")
        else:
            print(f"   ❌ Still failing - check Django auth backend settings")
    
    # Test with email
    if user.email and user.email != USERNAME:
        print(f"\n🔐 Testing authentication with email...")
        auth_user = authenticate(username=user.email, password=PASSWORD)
        if auth_user:
            print(f"   ✅ Authentication SUCCESS with email!")
        else:
            print(f"   ⚠️  Email login not supported (use username instead)")
    
except User.DoesNotExist:
    print(f"❌ User still doesn't exist after creation attempt!")
    print(f"   Check for errors above")

# Step 6: Display final credentials
print(f"\n" + "="*60)
print("📋 FINAL CREDENTIALS")
print("="*60)
print(f"\n✅ Use these credentials in the app:")
print(f"   Badge ID or Email: {USERNAME}")
print(f"   Password: {PASSWORD}")
print(f"\n💡 Important: Use the username '{USERNAME}', not the email")
print(f"\n🧪 Test with curl:")
print(f'   curl -X POST "http://localhost:8000/api/security/login/" \\')
print(f'     -H "Content-Type: application/json" \\')
print(f'     -d \'{{"username": "{USERNAME}", "password": "{PASSWORD}"}}\'')
print("\n")

