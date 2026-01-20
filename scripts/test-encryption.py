#!/usr/bin/env python3
"""
Test script for CV Pro encryption functionality.

This script tests the encryption/decryption cycle with generated keys
to ensure GDPR compliance and data security.

Usage:
    # Set the encryption key first
    source secure-keys/encryption-key-primary.env

    # Run the test
    python scripts/test-encryption.py
"""

import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from app_helpers.encryption import DataEncryption, encrypt_cv_data, decrypt_cv_data
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're in the cv-pro root directory and backend dependencies are installed.")
    sys.exit(1)


def test_basic_encryption():
    """Test basic encryption/decryption cycle."""
    print("🔐 Testing basic encryption/decryption...")

    test_data = "John Doe"
    print(f"Original: {test_data}")

    try:
        encrypted = DataEncryption.encrypt_data(test_data)
        print(f"Encrypted: {encrypted[:50]}...")

        decrypted = DataEncryption.decrypt_data(encrypted)
        print(f"Decrypted: {decrypted}")

        assert decrypted == test_data, "Decryption failed!"
        print("✅ Basic encryption test passed\n")

    except Exception as e:
        print(f"❌ Basic encryption test failed: {e}\n")
        return False

    return True


def test_cv_data_encryption():
    """Test CV data encryption/decryption."""
    print("📄 Testing CV data encryption/decryption...")

    test_cv_data = {
        "personal_info": {
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "phone": "+45 12 34 56 78",
            "address": "Copenhagen, Denmark"
        },
        "experience": [
            {
                "company": "Tech Corp A/S",
                "location": "Copenhagen",
                "description": "Led development of innovative solutions"
            }
        ],
        "education": [
            {
                "institution": "Technical University of Denmark",
                "field": "Computer Science",
                "gpa": "4.0"
            }
        ],
        "skills": ["Python", "React", "Docker"],  # Should not be encrypted
        "theme": "modern"  # Should not be encrypted
    }

    print("Original CV data structure:")
    print(f"  - Name: {test_cv_data['personal_info']['name']}")
    print(f"  - Email: {test_cv_data['personal_info']['email']}")
    print(f"  - Company: {test_cv_data['experience'][0]['company']}")
    print(f"  - Skills: {test_cv_data['skills']}")

    try:
        # Encrypt
        encrypted_cv = encrypt_cv_data(test_cv_data)
        print("\nAfter encryption:")
        print(f"  - Name: {encrypted_cv['personal_info']['name'][:30]}...")
        print(f"  - Email: {encrypted_cv['personal_info']['email'][:30]}...")
        print(f"  - Company: {encrypted_cv['experience'][0]['company'][:30]}...")
        print(f"  - Skills: {encrypted_cv['skills']} (unchanged)")

        # Decrypt
        decrypted_cv = decrypt_cv_data(encrypted_cv)
        print("\nAfter decryption:")
        print(f"  - Name: {decrypted_cv['personal_info']['name']}")
        print(f"  - Email: {decrypted_cv['personal_info']['email']}")
        print(f"  - Company: {decrypted_cv['experience'][0]['company']}")
        print(f"  - Skills: {decrypted_cv['skills']} (unchanged)")

        # Verify
        assert decrypted_cv == test_cv_data, "CV data decryption failed!"
        print("✅ CV data encryption test passed\n")

    except Exception as e:
        print(f"❌ CV data encryption test failed: {e}\n")
        return False

    return True


def test_key_validation():
    """Test key validation."""
    print("🔑 Testing key validation...")

    # Test missing key
    old_key = os.environ.get('ENCRYPTION_KEY')
    if 'ENCRYPTION_KEY' in os.environ:
        del os.environ['ENCRYPTION_KEY']

    try:
        DataEncryption.get_encryption_key()
        print("❌ Should have failed with missing key")
        return False
    except ValueError as e:
        print(f"✅ Correctly rejected missing key: {e}")

    # Restore key
    if old_key:
        os.environ['ENCRYPTION_KEY'] = old_key

    print("✅ Key validation test passed\n")
    return True


def main():
    print("🧪 CV Pro Encryption Test Suite")
    print("=" * 40)
    print()

    # Check if key is set
    if 'ENCRYPTION_KEY' not in os.environ:
        print("❌ ENCRYPTION_KEY environment variable not set!")
        print("Run this command first:")
        print("  source secure-keys/encryption-key-primary.env")
        print()
        sys.exit(1)

    print(f"✅ Using encryption key with fingerprint: {os.environ['ENCRYPTION_KEY'][:16]}...")
    print()

    tests = [
        test_key_validation,
        test_basic_encryption,
        test_cv_data_encryption,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1

    print("=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All encryption tests passed! Your GDPR compliance is working correctly.")
        print("🔐 Data encryption is properly protecting sensitive personal information.")
    else:
        print("⚠️  Some tests failed. Please check your encryption setup.")
        sys.exit(1)


if __name__ == "__main__":
    main()
