"""
Verify user credentials in Django database.
Run this in Django shell: python manage.py shell < verify_user_credentials.py
Or copy-paste into: python manage.py shell
"""

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

# Try different possible usernames
POSSIBLE_USERNAMES = [
    "test_officer",
    "test.officer@safetnet.com",
    "TestOfficer",
    "testofficer",
]

PASSWORD = "TestOfficer123!"

print("\n" + "="*60)
print("VERIFYING USER CREDENTIALS")
print("="*60)

found_users = []

# Check which users exist
for username in POSSIBLE_USERNAMES:
    try:
        user = User.objects.get(username=username)
        found_users.append(user)
        print(f"\n✅ Found user: {username}")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Active: {user.is_active}")
        if hasattr(user, 'role'):
            print(f"   Role: {user.role}")
    except User.DoesNotExist:
        print(f"❌ User '{username}' not found")
    except User.MultipleObjectsReturned:
        users = User.objects.filter(username=username)
        print(f"⚠️  Multiple users found with username '{username}': {users.count()}")
        found_users.extend(list(users))

if not found_users:
    print("\n❌ No users found with any of the tested usernames!")
    print("\n🔧 Creating test_officer user...")
    
    user = User.objects.create_user(
        username='test_officer',
        email='test.officer@safetnet.com',
        password='TestOfficer123!',
        is_active=True
    )
    
    if hasattr(user, 'role'):
        user.role = 'security_officer'
        user.save()
    
    print(f"✅ Created: test_officer")
    found_users = [user]

# Test authentication with each found user
print("\n" + "-"*60)
print("TESTING AUTHENTICATION")
print("-"*60)

for user in found_users:
    print(f"\n🔐 Testing login with username: {user.username}")
    
    # Test with username
    auth_user = authenticate(username=user.username, password=PASSWORD)
    if auth_user:
        print(f"   ✅ Authentication SUCCESS with username: {user.username}")
    else:
        print(f"   ❌ Authentication FAILED with username: {user.username}")
    
    # Test with email if different
    if user.email and user.email != user.username:
        print(f"\n🔐 Testing login with email: {user.email}")
        auth_user = authenticate(username=user.email, password=PASSWORD)
        if auth_user:
            print(f"   ✅ Authentication SUCCESS with email: {user.email}")
        else:
            print(f"   ❌ Authentication FAILED with email: {user.email}")

# Display correct credentials
print("\n" + "="*60)
print("📋 CORRECT LOGIN CREDENTIALS")
print("="*60)

if found_users:
    user = found_users[0]
    print(f"\n✅ Use these credentials:")
    print(f"   Username: {user.username}")
    if user.email:
        print(f"   Email: {user.email}")
    print(f"   Password: {PASSWORD}")
    print(f"\n💡 In the app, enter '{user.username}' in the 'Badge ID or Email' field")
else:
    print("\n❌ No users found. Please create a user first.")

print("\n")

