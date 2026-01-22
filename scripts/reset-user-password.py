#!/usr/bin/env python3
"""
User Password Reset Script for CV Pro

This script allows administrators to reset user passwords directly in Supabase.
Run this from inside the Docker container.

Usage:
    docker-compose exec app python scripts/reset-user-password.py <email_or_user_id> [new_password]

Arguments:
    email_or_user_id: User's email address or Supabase user ID
    new_password: New password (optional, will generate random if not provided)

Examples:
    docker-compose exec app python scripts/reset-user-password.py user@example.com
    docker-compose exec app python scripts/reset-user-password.py user@example.com MyNewPass123!
    docker-compose exec app python scripts/reset-user-password.py 550e8400-e29b-41d4-a716-446655440000
"""

import sys
import os
import re
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
    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("❌ Missing Supabase configuration")
        return None

    return create_client(supabase_url, service_role_key)


def find_user_by_email_or_id(identifier: str):
    """Find user by email or user ID."""
    client = get_admin_client()
    if not client:
        return None

    try:
        # Try to find in user_profiles table first (this is what the app uses)
        response = client.table("user_profiles").select("id, email").eq("email", identifier).execute()
        if response.data:
            user = response.data[0]
            return {
                'id': user['id'],
                'email': user['email'],
                'created_at': None  # Not available in user_profiles
            }

        # If not found in user_profiles, check if it's a UUID and try admin API
        uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

        if uuid_pattern.match(identifier):
            # For UUIDs, verify user exists via admin API
            try:
                response = client.auth.admin.get_user_by_id(identifier)
                if response.user:
                    return {
                        'id': response.user.id,
                        'email': response.user.email,
                        'created_at': response.user.created_at
                    }
                else:
                    return None  # User not found
            except Exception:
                return None  # User not found or error

        # For emails, verify user exists via admin API
        try:
            response = client.auth.admin.list_users(page=1, per_page=100)
            # Filter client-side by email
            for user in response.users:
                if user.email == identifier:
                    return {
                        'id': user.id,
                        'email': user.email,
                        'created_at': user.created_at
                    }
            return None  # User not found
        except Exception:
            return None  # User not found or error

    except Exception as e:
        print(f"❌ Error querying user: {e}")
        return None


def reset_user_password(user_id: str, new_password: str) -> bool:
    """Reset user password using Supabase admin API."""
    client = get_admin_client()
    if not client:
        return False

    try:
        # Try to update existing user password
        # Supabase admin API might require attributes parameter
        response = client.auth.admin.update_user_by_id(
            user_id,
            attributes={'password': new_password}
        )

        # Check if the update was successful
        if response.user:
            return True
        else:
            print(f"❌ Password reset failed: {response}")
            return False

    except Exception as e:
        print(f"❌ Error resetting password: {e}")
        return False


def main():
    print("🔐 CV Pro User Password Reset Tool")
    print("=" * 50)
    print()

    # Check arguments
    if len(sys.argv) < 2:
        print("❌ Usage: docker-compose exec app python scripts/reset-user-password.py <email_or_user_id> [new_password]")
        print()
        print("Examples:")
        print("  docker-compose exec app python scripts/reset-user-password.py user@example.com")
        print("  docker-compose exec app python scripts/reset-user-password.py user@example.com MyNewPass123!")
        print("  docker-compose exec app python scripts/reset-user-password.py 550e8400-e29b-41d4-a716-446655440000")
        sys.exit(1)

    identifier = sys.argv[1]
    new_password = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        print("🔍 Looking up user...")

        # Find user
        user = find_user_by_email_or_id(identifier)
        if not user:
            print(f"❌ User not found: {identifier}")
            print("Make sure the email or user ID is correct.")
            sys.exit(1)

        print(f"✅ Found user: {user['email']} (ID: {user['id']})")

        # Generate or use provided password
        if new_password:
            print("✅ Using provided password")
        else:
            new_password = generate_secure_password()
            print("✅ Generated secure random password")

        # Reset password
        print("🔄 Resetting password...")
        if reset_user_password(user['id'], new_password):
            print("✅ Password reset successful!")
            print()
            print("🔑 NEW PASSWORD DETAILS")
            print("-" * 25)
            print(f"User: {user['email']}")
            print(f"New Password: {new_password}")
            print()
            print("⚠️  SECURITY REMINDERS")
            print("-" * 20)
            print("• Share this password securely with the user")
            print("• User should change password after first login")
            print("• Delete this output after sharing")
        else:
            print("❌ Failed to reset password")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
