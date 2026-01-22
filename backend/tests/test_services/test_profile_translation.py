"""Tests for profile translation service."""
import pytest
from unittest.mock import AsyncMock, patch
from backend.services.profile_translation import ProfileTranslationService


@pytest.mark.asyncio
class TestProfileTranslationService:
    """Test ProfileTranslationService."""

    def setup_method(self):
        """Set up test instance."""
        self.service = ProfileTranslationService()

    async def test_translate_profile_success(self):
        """Test successful profile translation."""
        profile_data = {
            "personal_info": {
                "name": "John Doe",
                "title": "Software Engineer",
                "summary": "Experienced software engineer with 5 years of experience",
                "email": "john@example.com",
            },
            "experience": [
                {
                    "title": "Senior Developer",
                    "company": "Tech Corp",
                    "description": "Developed web applications",
                    "location": "New York",
                    "projects": [
                        {
                            "name": "E-commerce Platform",
                            "description": "Built a scalable e-commerce platform",
                            "highlights": ["Increased performance by 40%", "Handled 10k users"],
                        }
                    ],
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Science",
                    "institution": "State University",
                    "field": "Computer Science",
                }
            ],
            "skills": [{"name": "Python", "category": "Programming"}],
            "language": "en",
        }

        translated_profile = {
            "personal_info": {
                "name": "John Doe",
                "title": "Ingeniero de Software",
                "summary": "Ingeniero de software experimentado con 5 años de experiencia",
                "email": "john@example.com",
            },
            "experience": [
                {
                    "title": "Desarrollador Senior",
                    "company": "Tech Corp",
                    "description": "Desarrollé aplicaciones web",
                    "location": "Nueva York",
                    "projects": [
                        {
                            "name": "Plataforma de Comercio Electrónico",
                            "description": "Construí una plataforma de comercio electrónico escalable",
                            "highlights": ["Aumenté el rendimiento en un 40%", "Manejé 10k usuarios"],
                        }
                    ],
                }
            ],
            "education": [
                {
                    "degree": "Licenciatura en Ciencias",
                    "institution": "Universidad Estatal",
                    "field": "Ciencias de la Computación",
                }
            ],
            "skills": [{"name": "Python", "category": "Programming"}],
            "language": "es",
        }

        with patch.object(self.service, 'llm_client') as mock_client:
            mock_client.is_configured.return_value = True
            mock_client.generate_text = AsyncMock(side_effect=[
                "Ingeniero de Software",
                "Ingeniero de software experimentado con 5 años de experiencia",
                "Desarrollador Senior",
                "Tech Corp",
                "Desarrollé aplicaciones web",
                "Nueva York",
                "Plataforma de Comercio Electrónico",
                "Construí una plataforma de comercio electrónico escalable",
                "Aumenté el rendimiento en un 40%",
                "Manejé 10k usuarios",
                "Licenciatura en Ciencias",
                "Universidad Estatal",
                "Ciencias de la Computación",
            ])

            result = await self.service.translate_profile(profile_data, "es", "en")

            assert result == translated_profile
            assert result["language"] == "es"
            assert result["personal_info"]["name"] == "John Doe"  # Name should not be translated
            assert result["personal_info"]["email"] == "john@example.com"  # Email should not be translated

    async def test_translate_profile_same_language(self):
        """Test translation with same source and target language."""
        profile_data = {
            "personal_info": {"name": "John Doe", "title": "Software Engineer"},
            "experience": [],
            "education": [],
            "skills": [],
            "language": "en",
        }

        result = await self.service.translate_profile(profile_data, "en", "en")

        assert result == profile_data

    async def test_translate_profile_ai_not_configured(self):
        """Test translation when AI is not configured."""
        profile_data = {
            "personal_info": {"name": "John Doe"},
            "experience": [],
            "education": [],
            "skills": [],
            "language": "en",
        }

        with patch.object(self.service, 'llm_client') as mock_client:
            mock_client.is_configured.return_value = False

            with pytest.raises(ValueError, match="AI service is not configured"):
                await self.service.translate_profile(profile_data, "es", "en")

    async def test_translate_profile_ai_error(self):
        """Test translation when AI call fails."""
        profile_data = {
            "personal_info": {"title": "Software Engineer"},
            "experience": [],
            "education": [],
            "skills": [],
            "language": "en",
        }

        with patch.object(self.service, 'llm_client') as mock_client:
            mock_client.is_configured.return_value = True
            mock_client.generate_text = AsyncMock(side_effect=Exception("AI Error"))

            result = await self.service.translate_profile(profile_data, "es", "en")

            # Should return original text when AI fails
            assert result["personal_info"]["title"] == "Software Engineer"
            assert result["language"] == "es"

    async def test_translate_text_empty(self):
        """Test translating empty text."""
        result = await self.service._translate_text("", "es", "en", "test")
        assert result == ""

    async def test_translate_text_with_em_dashes(self):
        """Test that em dashes are converted to hyphens."""
        with patch.object(self.service, 'llm_client') as mock_client:
            mock_client.is_configured.return_value = True
            mock_client.generate_text = AsyncMock(return_value="Text with — em dash and – en dash")

            result = await self.service._translate_text("Test text", "es", "en", "test")

            assert "—" not in result
            assert "–" not in result
            assert "-" in result

    async def test_translate_personal_info(self):
        """Test personal info translation."""
        personal_info = {
            "name": "John Doe",
            "title": "Software Engineer",
            "summary": "Experienced developer",
            "email": "john@example.com",
        }

        with patch.object(self.service, 'llm_client') as mock_client:
            mock_client.is_configured.return_value = True
            mock_client.generate_text = AsyncMock(side_effect=[
                "Ingeniero de Software",
                "Desarrollador experimentado"
            ])

            result = await self.service._translate_personal_info(personal_info, "es", "en")

            assert result["name"] == "John Doe"  # Should not translate
            assert result["email"] == "john@example.com"  # Should not translate
            assert result["title"] == "Ingeniero de Software"
            assert result["summary"] == "Desarrollador experimentado"

    async def test_translate_experience(self):
        """Test experience translation."""
        experience = {
            "title": "Senior Developer",
            "company": "Tech Corp",
            "description": "Built web apps",
            "location": "New York",
            "start_date": "2020-01-01",
            "technologies": ["Python", "React"],
        }

        with patch.object(self.service, 'llm_client') as mock_client:
            mock_client.is_configured.return_value = True
            mock_client.generate_text = AsyncMock(side_effect=[
                "Desarrollador Senior",
                "Tech Corp",
                "Construí aplicaciones web",
                "Nueva York"
            ])

            result = await self.service._translate_experience(experience, "es", "en")

            assert result["title"] == "Desarrollador Senior"
            assert result["company"] == "Tech Corp"
            assert result["description"] == "Construí aplicaciones web"
            assert result["location"] == "Nueva York"
            assert result["start_date"] == "2020-01-01"  # Should not translate
            assert result["technologies"] == ["Python", "React"]  # Should not translate
