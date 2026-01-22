"""Profile translation service using AI."""
import asyncio
import copy
import logging
import threading
from typing import Dict, Any, List, Optional
from backend.services.ai.llm_client import get_llm_client

logger = logging.getLogger(__name__)

# Fields that should NOT be translated
NON_TRANSLATABLE_FIELDS = {
    "name", "email", "phone", "address", "linkedin", "github", "website",
    "start_date", "end_date", "year", "gpa", "technologies", "url"
}

# Skills should not be translated
NON_TRANSLATABLE_SECTIONS = {"skills"}


class ProfileTranslationService:
    """Service for translating profile content using AI."""

    def __init__(self):
        self.llm_client = get_llm_client()

    async def translate_profile(
        self, profile_data: Dict[str, Any], target_language: str, source_language: str = "en"
    ) -> Dict[str, Any]:
        """
        Translate a profile to the target language.

        Args:
            profile_data: The profile data to translate
            target_language: ISO 639-1 language code for target language
            source_language: ISO 639-1 language code for source language (default: en)

        Returns:
            Translated profile data with same structure
        """
        if not self.llm_client.is_configured():
            raise ValueError("AI service is not configured")

        if target_language == source_language:
            logger.info(f"Source and target languages are the same ({target_language}), returning original profile")
            return profile_data

        translated_profile = copy.deepcopy(profile_data)

        # Translate personal info
        translated_profile["personal_info"] = await self._translate_personal_info(
            profile_data["personal_info"], target_language, source_language
        )

        # Translate experience
        translated_profile["experience"] = await self._translate_experience_list(
            profile_data["experience"], target_language, source_language
        )

        # Translate education
        translated_profile["education"] = await self._translate_education_list(
            profile_data["education"], target_language, source_language
        )

        # Skills are not translated
        translated_profile["skills"] = profile_data["skills"]

        # Set the target language for the translated profile
        translated_profile["language"] = target_language

        return translated_profile

    async def _translate_personal_info(
        self, personal_info: Dict[str, Any], target_language: str, source_language: str
    ) -> Dict[str, Any]:
        """Translate personal info fields."""
        translated = personal_info.copy()

        # Only translate title and summary
        if personal_info.get("title"):
            translated["title"] = await self._translate_text(
                personal_info["title"], target_language, source_language, "professional title"
            )

        if personal_info.get("summary"):
            translated["summary"] = await self._translate_text(
                personal_info["summary"], target_language, source_language, "professional summary"
            )

        return translated

    async def _translate_experience_list(
        self, experience_list: List[Dict[str, Any]], target_language: str, source_language: str
    ) -> List[Dict[str, Any]]:
        """Translate experience entries."""
        coros = [
            self._translate_experience(experience, target_language, source_language)
            for experience in experience_list
        ]
        return await asyncio.gather(*coros)

    async def _translate_experience(
        self, experience: Dict[str, Any], target_language: str, source_language: str
    ) -> Dict[str, Any]:
        """Translate a single experience entry."""
        translated = experience.copy()

        # Translate translatable fields
        if experience.get("title"):
            translated["title"] = await self._translate_text(
                experience["title"], target_language, source_language, "job title"
            )

        if experience.get("company"):
            translated["company"] = await self._translate_text(
                experience["company"], target_language, source_language, "company name"
            )

        if experience.get("description"):
            translated["description"] = await self._translate_text(
                experience["description"], target_language, source_language, "job description"
            )

        if experience.get("location"):
            translated["location"] = await self._translate_text(
                experience["location"], target_language, source_language, "location"
            )

        # Translate projects
        if experience.get("projects"):
            translated["projects"] = await self._translate_projects(
                experience["projects"], target_language, source_language
            )

        return translated

    async def _translate_project(
        self, project: Dict[str, Any], target_language: str, source_language: str
    ) -> Dict[str, Any]:
        """Translate a single project entry."""
        translated_proj = project.copy()

        if project.get("name"):
            translated_proj["name"] = await self._translate_text(
                project["name"], target_language, source_language, "project name"
            )

        if project.get("description"):
            translated_proj["description"] = await self._translate_text(
                project["description"], target_language, source_language, "project description"
            )

        if project.get("highlights"):
            translated_proj["highlights"] = await asyncio.gather(
                *(self._translate_text(h, target_language, source_language, "project highlight") for h in project["highlights"])
            )

        return translated_proj

    async def _translate_projects(
        self, projects: List[Dict[str, Any]], target_language: str, source_language: str
    ) -> List[Dict[str, Any]]:
        """Translate project entries."""
        coros = [
            self._translate_project(project, target_language, source_language)
            for project in projects
        ]
        return await asyncio.gather(*coros)

    async def _translate_education(
        self, education: Dict[str, Any], target_language: str, source_language: str
    ) -> Dict[str, Any]:
        """Translate a single education entry."""
        translated_edu = education.copy()

        if education.get("degree"):
            translated_edu["degree"] = await self._translate_text(
                education["degree"], target_language, source_language, "degree"
            )

        if education.get("institution"):
            translated_edu["institution"] = await self._translate_text(
                education["institution"], target_language, source_language, "institution name"
            )

        if education.get("field"):
            translated_edu["field"] = await self._translate_text(
                education["field"], target_language, source_language, "field of study"
            )

        return translated_edu

    async def _translate_education_list(
        self, education_list: List[Dict[str, Any]], target_language: str, source_language: str
    ) -> List[Dict[str, Any]]:
        """Translate education entries."""
        coros = [
            self._translate_education(education, target_language, source_language)
            for education in education_list
        ]
        return await asyncio.gather(*coros)

    async def _translate_text(
        self, text: str, target_language: str, source_language: str, text_type: str
    ) -> str:
        """
        Translate a single text using AI.

        Args:
            text: The text to translate
            target_language: Target language code
            source_language: Source language code
            text_type: Type of text (e.g., "job title", "summary") for context

        Returns:
            Translated text
        """
        if not text or not text.strip():
            return text

        # Create translation prompt
        prompt = self._create_translation_prompt(text, target_language, source_language, text_type)

        try:
            translated_text = await self.llm_client.generate_text(prompt)
            # Clean up the response - remove any extra formatting
            translated_text = translated_text.strip()
            # Remove em dashes as requested
            translated_text = translated_text.replace("—", "-").replace("–", "-")
            return translated_text
        except Exception as e:
            logger.error(f"Failed to translate text: {e}")
            # Return original text if translation fails
            return text

    def _create_translation_prompt(
        self, text: str, target_language: str, source_language: str, text_type: str
    ) -> str:
        """Create a translation prompt for the LLM."""
        language_names = {
            "en": "English",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "nl": "Dutch",
            "ru": "Russian",
            "zh": "Chinese",
            "ja": "Japanese",
            "ko": "Korean",
            "ar": "Arabic",
        }

        source_name = language_names.get(source_language, source_language.upper())
        target_name = language_names.get(target_language, target_language.upper())

        return f"""Translate the following {text_type} from {source_name} to {target_name}.

IMPORTANT INSTRUCTIONS:
- Maintain the same professional tone and style as the original
- Keep the same level of formality and vocabulary
- Do not add or remove information
- Do not use em dashes (—) or en dashes (–), use regular hyphens (-) instead
- Return ONLY the translated text, no explanations or additional content

Original text:
{text}

Translated text:"""


# Singleton instance
_translation_service: Optional[ProfileTranslationService] = None
_translation_service_lock = threading.Lock()


def get_translation_service() -> ProfileTranslationService:
    """Get or create translation service instance."""
    global _translation_service
    if _translation_service is None:
        with _translation_service_lock:
            if _translation_service is None:  # Double-check
                _translation_service = ProfileTranslationService()
    return _translation_service
