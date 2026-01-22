"""Tests for TranslateProfileRequest validation."""

import pytest

from backend.models.profile import TranslateProfileRequest, ProfileData, PersonalInfo


@pytest.fixture
def valid_profile_data() -> ProfileData:
    """Fixture returning a valid ProfileData using PersonalInfo."""
    return ProfileData(
        personal_info=PersonalInfo(name='Test User', email='test@example.com'),
        language='en'
    )


def test_valid_iso_acceptance(valid_profile_data):
    """Test that valid ISO language codes are accepted."""
    request = TranslateProfileRequest(
        profile_data=valid_profile_data,
        target_language='fr'
    )
    assert request.target_language == 'fr'


def test_uppercase_normalization(valid_profile_data):
    """Test that uppercase language codes are normalized to lowercase."""
    request = TranslateProfileRequest(
        profile_data=valid_profile_data,
        target_language='DE'
    )
    assert request.target_language == 'de'


def test_invalid_code_rejected(valid_profile_data):
    """Test that invalid language codes are rejected with ValueError."""
    with pytest.raises(ValueError):
        TranslateProfileRequest(
            profile_data=valid_profile_data,
            target_language='xx'
        )


def test_too_long_code_rejected(valid_profile_data):
    """Test that too-long language codes are rejected with ValueError."""
    with pytest.raises(ValueError):
        TranslateProfileRequest(
            profile_data=valid_profile_data,
            target_language='english'
        )


def test_too_short_code_rejected(valid_profile_data):
    """Test that too-short language codes are rejected with ValueError."""
    with pytest.raises(ValueError):
        TranslateProfileRequest(
            profile_data=valid_profile_data,
            target_language='a'
        )
