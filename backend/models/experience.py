"""Experience and project models."""
from typing import Optional, List
import html as std_html
from lxml.html.clean import Cleaner
from pydantic import BaseModel, Field, field_validator
from pydantic_core import PydanticCustomError

ALLOWED_DESCRIPTION_TAGS = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
]


class Project(BaseModel):
    """Project model nested under an experience."""

    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    url: Optional[str] = None


class Experience(BaseModel):
    """Work experience model."""

    title: str = Field(..., min_length=1, max_length=200)
    company: str = Field(..., min_length=1, max_length=200)
    start_date: str = Field(..., description="Start date in YYYY-MM format")
    end_date: Optional[str] = Field(
        None, description="End date in YYYY-MM format or 'Present'"
    )
    description: Optional[str] = Field(
        None,
        description="Keep this short; put details under projects. HTML formatting is supported.",
    )
    location: Optional[str] = None
    projects: List[Project] = Field(default_factory=list)

    @field_validator("description")
    @classmethod
    def validate_and_sanitize_description(cls, v: str | None) -> str | None:
        """Sanitize HTML description and enforce plain text length."""
        if v is None:
            return v

        # Create cleaner that allows only specified tags and strips everything else
        cleaner = Cleaner(
            allow_tags=ALLOWED_DESCRIPTION_TAGS,
            kill_tags=['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'],
            safe_attrs=set(),  # Strip all attributes
            safe_attrs_only=True,
            page_structure=False,  # Return cleaned fragment instead of full HTML document
        )
        sanitized = cleaner.clean_html(v)

        # Extract plain text from sanitized HTML
        from lxml import html as lxml_html
        plain_text = lxml_html.fromstring(sanitized).text_content()
        plain_text = std_html.unescape(plain_text)

        if len(plain_text) > 300:
            raise PydanticCustomError(
                "string_too_long",
                "String should have at most 300 characters",
                {"max_length": 300},
            )
        return sanitized
