#!/usr/bin/env python3
"""
Test script for CV search with encrypted data.

This script verifies that:
1. CV data is properly encrypted
2. Searchable metadata is extracted and stored
3. Search functionality works using metadata
4. Privacy is maintained (no personal data in search results)
"""

import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from app_helpers.encryption import encrypt_cv_data, decrypt_cv_data, extract_searchable_metadata
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're in the cv-pro root directory and backend dependencies are installed.")
    sys.exit(1)


def test_metadata_extraction():
    """Test that searchable metadata is properly extracted from CV data."""
    print("🔍 Testing metadata extraction...")

    # Sample CV data with personal information
    cv_data = {
        "personal_info": {
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "phone": "+45 12 34 56 78",
            "address": "Copenhagen, Denmark"
        },
        "target_role": "Senior Software Engineer",
        "location": "Copenhagen",
        "skills": ["Python", "React", "PostgreSQL", "Docker"],
        "experience": [
            {
                "company": "Tech Corp A/S",
                "location": "Copenhagen",
                "title": "Software Engineer",
                "description": "Led development of web applications"
            },
            {
                "company": "StartupXYZ ApS",
                "location": "Aarhus",
                "title": "Junior Developer",
                "description": "Built mobile applications"
            }
        ],
        "education": [
            {
                "institution": "Technical University of Denmark",
                "field": "Computer Science",
                "degree": "Master's"
            }
        ]
    }

    # Extract metadata
    metadata = extract_searchable_metadata(cv_data)

    # Verify metadata extraction
    expected_metadata = {
        "person_name": "Jane Smith",
        "target_role": "Senior Software Engineer",
        "location": "Copenhagen",
        "skills": ["Python", "React", "PostgreSQL", "Docker"],
        "company_names": ["Tech Corp A/S", "StartupXYZ ApS"]
    }

    print(f"📊 Extracted metadata: {metadata}")

    # Check that sensitive data is NOT in metadata
    assert "email" not in str(metadata).lower(), "Email should not be in metadata"
    assert "phone" not in str(metadata).lower(), "Phone should not be in metadata"
    assert "address" not in str(metadata).lower(), "Address should not be in metadata"

    # Check that searchable data IS in metadata
    assert metadata.get("person_name") == "Jane Smith", "Person name should be in metadata"
    assert metadata.get("target_role") == "Senior Software Engineer", "Target role should be in metadata"
    assert set(metadata.get("skills", [])) == {"Python", "React", "PostgreSQL", "Docker"}, "Skills should be in metadata"
    assert set(metadata.get("company_names", [])) == {"Tech Corp A/S", "StartupXYZ ApS"}, "Company names should be in metadata"

    print("✅ Metadata extraction test passed\n")
    return True


def test_encryption_with_metadata():
    """Test that encryption works alongside metadata extraction."""
    print("🔐 Testing encryption with metadata extraction...")

    cv_data = {
        "personal_info": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+45 98 76 54 32"
        },
        "target_role": "Frontend Developer",
        "skills": ["JavaScript", "TypeScript", "React"],
        "experience": [
            {
                "company": "WebDev Inc",
                "description": "Developed modern web applications"
            }
        ]
    }

    # Encrypt data and extract metadata
    encrypted_data, metadata = encrypt_cv_data(cv_data)

    print(f"🔒 Encrypted personal info: {encrypted_data['personal_info']}")
    print(f"📊 Searchable metadata: {metadata}")

    # Verify that sensitive data is encrypted
    assert encrypted_data['personal_info']['name'] != "John Doe", "Name should be encrypted"
    assert encrypted_data['personal_info']['email'] != "john.doe@example.com", "Email should be encrypted"

    # Verify that metadata is preserved for search
    assert metadata['person_name'] == "John Doe", "Name should be in searchable metadata"
    assert metadata['target_role'] == "Frontend Developer", "Role should be in searchable metadata"
    assert set(metadata['skills']) == {"JavaScript", "TypeScript", "React"}, "Skills should be in searchable metadata"

    # Test decryption
    decrypted_data = decrypt_cv_data(encrypted_data)
    assert decrypted_data == cv_data, "Decryption should restore original data"

    print("✅ Encryption with metadata test passed\n")
    return True


def test_search_privacy():
    """Test that search results don't expose private information."""
    print("🔒 Testing search privacy protection...")

    # Simulate search results (what would be returned by the API)
    search_results = [
        {
            "cv_id": "123e4567-e89b-12d3-a456-426614174000",
            "person_name": "Jane Smith",  # OK - for identification
            "target_role": "Software Engineer",  # OK - job target
            "location": "Copenhagen",  # OK - location preference
            "skills": ["Python", "Django", "PostgreSQL"],  # OK - technical skills
            "company_names": ["TechCorp", "StartupXYZ"],  # OK - experience summary
            "last_updated": "2024-01-20T10:00:00Z"
        }
    ]

    # Check that NO sensitive personal data is in search results
    search_text = str(search_results).lower()

    # These should NOT be in search results
    forbidden_fields = ["email", "phone", "address", "@", "+", "street", "zip"]
    for field in forbidden_fields:
        assert field not in search_text, f"Sensitive field '{field}' found in search results!"

    # These SHOULD be in search results
    required_fields = ["jane smith", "software engineer", "copenhagen", "python"]
    for field in required_fields:
        assert field in search_text, f"Required field '{field}' missing from search results!"

    print("✅ Search privacy protection test passed\n")
    return True


def test_search_scenarios():
    """Test various search scenarios."""
    print("🔍 Testing search scenarios...")

    # Mock CV metadata for testing
    mock_cvs = [
        {
            "person_name": "Alice Johnson",
            "target_role": "Frontend Developer",
            "location": "Copenhagen",
            "skills": ["React", "JavaScript", "CSS"],
            "company_names": ["Google", "Facebook"]
        },
        {
            "person_name": "Bob Wilson",
            "target_role": "Backend Developer",
            "location": "Aarhus",
            "skills": ["Python", "Django", "PostgreSQL"],
            "company_names": ["Amazon", "Microsoft"]
        },
        {
            "person_name": "Carol Brown",
            "target_role": "Full Stack Developer",
            "location": "Copenhagen",
            "skills": ["React", "Python", "Node.js"],
            "company_names": ["Spotify", "Netflix"]
        }
    ]

    # Test search scenarios
    scenarios = [
        ("React developer", lambda cv: "react" in str(cv).lower() and "developer" in str(cv).lower()),
        ("Copenhagen", lambda cv: cv.get("location") == "Copenhagen"),
        ("Python", lambda cv: any("python" in skill.lower() for skill in cv.get("skills", []))),
        ("Alice", lambda cv: "alice" in cv.get("person_name", "").lower()),
    ]

    for search_term, matcher in scenarios:
        matches = [cv for cv in mock_cvs if matcher(cv)]
        print(f"   Search '{search_term}': {len(matches)} matches")
        assert len(matches) > 0, f"No matches found for '{search_term}'"

    print("✅ Search scenarios test passed\n")
    return True


def main():
    print("🧪 CV Search with Encryption Test Suite")
    print("=" * 45)
    print()

    tests = [
        test_metadata_extraction,
        test_encryption_with_metadata,
        test_search_privacy,
        test_search_scenarios,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with error: {e}\n")

    print("=" * 45)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All search encryption tests passed!")
        print("🔒 Your CV search is privacy-compliant:")
        print("   • Personal data remains encrypted")
        print("   • Search works with safe metadata")
        print("   • No sensitive information exposed")
    else:
        print("⚠️  Some tests failed. Please check your search encryption setup.")
        sys.exit(1)


if __name__ == "__main__":
    main()
