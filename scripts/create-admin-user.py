#!/usr/bin/env python3
"""
Admin User Creation Script for CV Pro

This script allows administrators to create new admin users in the Supabase database.
Run this from inside the Docker container using docker-compose exec.

Requirements:
- Docker container must have scripts directory mounted (configured in docker-compose.yml)
- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set

Usage:
    docker-compose exec app python scripts/create-admin-user.py <email> [password]

Arguments:
    email: Email address for the new admin user
    password: Password for the new user (optional, will generate random if not provided)

Examples:
    docker-compose exec app python scripts/create-admin-user.py admin@example.com
    docker-compose exec app python scripts/create-admin-user.py admin@example.com MySecurePass123!
"""

import sys
import secrets
import string

try:
    from supabase import create_client
except ImportError:
    print("❌ Supabase package not available in container")
    sys.exit(1)


def generate_secure_password(length: int = 12) -> str:
    """Generate a secure random password."""
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(characters) for _ in range(length))

    # Ensure at least one of each type
    if not any(c.islower() for c in password):
        password = password[:-1] + secrets.choice(string.ascii_lowercase)
    if not any(c.isupper() for c in password):
        password = password[:-1] + secrets.choice(string.ascii_uppercase)
    if not any(c.isdigit() for c in password):
        password = password[:-1] + secrets.choice(string.digits)
    if not any(c in "!@#$%^&*" for c in password):
        password = password[:-1] + secrets.choice("!@#$%^&*")

    return password


def get_admin_client():
    """Create Supabase admin client."""
    import os

    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("❌ Missing Supabase configuration")
        return None

    return create_client(supabase_url, service_role_key)


def check_user_exists(client, email: str) -> bool:
    """Check if user already exists."""
    try:
        # Check in user_profiles table
        response = client.table("user_profiles").select("id").eq("email", email).execute()
        if response.data:
            return True

        # Also check if there's an auth user
        # Since we can't query auth.users directly, we'll try to get user by email later
        return False
    except Exception:
        return False


def create_admin_user(email: str, password: str) -> bool:
    """Create a new admin user."""
    client = get_admin_client()
    if not client:
        return False

    try:
        # First check if user already exists
        if check_user_exists(client, email):
            print(f"❌ User {email} already exists")
            return False

        # Create the user account
        print("🔄 Creating user account...")
        signup_response = client.auth.sign_up({
            'email': email,
            'password': password
        })

        if not signup_response.user:
            print("❌ Failed to create user account")
            return False

        user_id = signup_response.user.id
        print(f"✅ User account created with ID: {user_id}")

        # Set user as admin in user_profiles table
        print("🔄 Setting admin privileges...")

        # First check if profile already exists (created by trigger)
        existing_profile = client.table("user_profiles").select("*").eq("id", user_id).execute()

        if existing_profile.data:
            # Update existing profile
            profile_response = client.table("user_profiles").update({
                'role': 'admin',
                'is_active': True
            }).eq("id", user_id).execute()
        else:
            # Insert new profile
            profile_data = {
                'id': user_id,
                'email': email,
                'role': 'admin',
                'is_active': True
            }
            profile_response = client.table("user_profiles").insert(profile_data).execute()

        if not profile_response.data:
            print("⚠️  User created but failed to set admin privileges")
            print("You may need to manually update the user_profiles table")
            print(f"User ID: {user_id}")
            return False

        print("✅ Admin privileges granted")
        return True

    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False


def main():
    print("👑 CV Pro Admin User Creation Tool")
    print("=" * 50)
    print()

    # Check arguments
    if len(sys.argv) < 2:
        print("❌ Usage: docker-compose exec app python scripts/create-admin-user.py <email> [password]")
        print()
        print("Examples:")
        print("  docker-compose exec app python scripts/create-admin-user.py admin@example.com")
        print("  docker-compose exec app python scripts/create-admin-user.py admin@example.com MySecurePass123!")
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2] if len(sys.argv) > 2 else None

    # Validate email format
    import re
    email_pattern = re.compile(r'^[^@]+@[^@]+\.[^@]+$')
    if not email_pattern.match(email):
        print(f"❌ Invalid email format: {email}")
        sys.exit(1)

    try:
        print(f"📧 Creating admin user: {email}")

        # Generate or use provided password
        if password:
            print("✅ Using provided password")
        else:
            password = generate_secure_password()
            print("✅ Generated secure random password")

        # Create the admin user
        if create_admin_user(email, password):
            print("✅ Admin user created successfully!")
            print()
            print("🔑 ADMIN USER DETAILS")
            print("-" * 25)
            print(f"Email: {email}")
            print(f"Password: {password}")
            print("Role: admin")
            print()
            print("⚠️  SECURITY REMINDERS")
            print("-" * 20)
            print("• Share credentials securely with the admin")
            print("• Admin should change password after first login")
            print("• Store credentials in a secure password manager")
            print("• Delete this output after sharing")
            print()
            print("🔐 Admin Capabilities:")
            print("  • Manage users and roles")
            print("  • Access admin panel")
            print("  • View system statistics")
        else:
            print("❌ Failed to create admin user")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
