"""
Simple script to create a test security officer.
Copy and paste this entire code into: python manage.py shell
"""

from django.contrib.auth.models import User

# Create test officer
# Use these credentials OR the ones you already created:
# Username: SecurityOfficer1, Password: Officer001
USERNAME = "SecurityOfficer1"
EMAIL = "officer@safetnet.com"
PASSWORD = "Officer001"

# Check if exists
if User.objects.filter(username=USERNAME).exists():
    user = User.objects.get(username=USERNAME)
    user.set_password(PASSWORD)
    user.email = EMAIL
    user.is_active = True
    user.save()
    print(f"✅ Updated existing user: {USERNAME}")
else:
    user = User.objects.create_user(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
        is_active=True
    )
    print(f"✅ Created new user: {USERNAME}")

print(f"\n📋 LOGIN CREDENTIALS:")
print(f"   Username: {USERNAME}")
print(f"   Email: {EMAIL}")
print(f"   Password: {PASSWORD}")
print(f"\n✅ User ID: {user.id}")
print(f"✅ Active: {user.is_active}")

