#!/usr/bin/env python
"""
Script to create a test security officer in Django database.
Run this in your Django project directory using: python manage.py shell < create_test_officer.py
Or copy-paste the code into: python manage.py shell
"""

import os
import django

# Setup Django environment (adjust if needed)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')
django.setup()

from django.contrib.auth.models import User

# ============================================
# CREATE SECURITY OFFICER
# ============================================

# Credentials for the test officer
USERNAME = "test_officer"
EMAIL = "test.officer@safetnet.com"
PASSWORD = "TestOfficer123!"

print("\n" + "="*60)
print("CREATING TEST SECURITY OFFICER")
print("="*60)

# Check if user already exists
if User.objects.filter(username=USERNAME).exists():
    print(f"\n⚠️  User '{USERNAME}' already exists!")
    user = User.objects.get(username=USERNAME)
    print(f"   User ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   Is Active: {user.is_active}")
    
    # Update password
    user.set_password(PASSWORD)
    user.save()
    print(f"\n✅ Password updated!")
else:
    # Create new user
    user = User.objects.create_user(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
        is_active=True,
        is_staff=False,
        is_superuser=False
    )
    print(f"\n✅ Security Officer created successfully!")
    print(f"   User ID: {user.id}")

# Display credentials
print("\n" + "-"*60)
print("LOGIN CREDENTIALS:")
print("-"*60)
print(f"   Username: {USERNAME}")
print(f"   Email:    {EMAIL}")
print(f"   Password: {PASSWORD}")
print("-"*60)

# Verify user
print(f"\n✅ User verified in database:")
print(f"   - Username: {user.username}")
print(f"   - Email: {user.email}")
print(f"   - Active: {user.is_active}")
print(f"   - Staff: {user.is_staff}")
print(f"   - Superuser: {user.is_superuser}")

print("\n" + "="*60)
print("READY TO TEST!")
print("="*60)
print("\nYou can now login to the app with:")
print(f"   Username/Email: {USERNAME} or {EMAIL}")
print(f"   Password: {PASSWORD}")
print("\n")

