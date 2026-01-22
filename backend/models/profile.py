"""Profile data and response models."""
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from backend.models.personal import PersonalInfo
from backend.models.experience import Experience
from backend.models.education import Education, Skill

# Valid ISO 639-1 language codes (two-letter codes)
VALID_ISO_639_1_CODES = {
    "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu"
}


class ProfileData(BaseModel):
    """Master profile data model (same structure as CVData)."""

    personal_info: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[Skill] = []
    language: str = "en"  # ISO 639-1 language code, default English


class ProfileResponse(BaseModel):
    """Profile operation response."""

    status: str = "success"
    message: Optional[str] = None


class ProfileListItem(BaseModel):
    """Profile list item with basic info."""

    name: str
    updated_at: str


class ProfileListResponse(BaseModel):
    """Response model for profile list."""

    profiles: List[ProfileListItem]


class TranslateProfileRequest(BaseModel):
    """Request model for profile translation."""

    profile_data: ProfileData
    target_language: str = Field(
        pattern=r"^[A-Za-z]{2}$",
        description="ISO 639-1 language code (two letters, case insensitive)"
    )

    @field_validator("target_language")
    @classmethod
    def validate_target_language(cls, v: str) -> str:
        """Validate and normalize the target language code."""
        # Normalize to lowercase
        normalized = v.lower()

        # Check if it's in the valid ISO 639-1 codes
        if normalized not in VALID_ISO_639_1_CODES:
            raise ValueError(
                f"Invalid ISO 639-1 language code: '{v}'. "
                f"Must be a valid two-letter language code."
            )

        return normalized


class TranslateProfileResponse(BaseModel):
    """Response model for profile translation."""

    status: str
    translated_profile: ProfileData
    message: Optional[str] = None
