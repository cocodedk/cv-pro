# Issue 03: Missing HTML Content Sanitization

## Severity
**Medium** - Potential XSS and content injection attacks

## Status
**Remediated** - Server-side HTML sanitization is enforced with an allowlist.

## Description
User-provided HTML content in experience descriptions is not properly sanitized, potentially allowing cross-site scripting (XSS) attacks and malicious content injection.

## Location
- **Backend**: `backend/models.py` - Experience description validation
- **Frontend**: User input in experience description fields

## Technical Details

### Previous Validation
```python
class Experience(BaseModel):
    # ...
    description: Optional[str] = Field(
        None,
        description="Keep this short; put details under projects. HTML formatting is supported.",
    )

    @field_validator("description")
    @classmethod
    def validate_description_length(
        cls, v: str | None, info: ValidationInfo
    ) -> str | None:
        """Validate description length by counting plain text (HTML stripped)."""
        if v is None:
            return v
        # Strip HTML tags to count only plain text
        plain_text = re.sub(r"<[^>]+>", "", v)
        # Replace HTML entities with single characters
        plain_text = plain_text.replace("&nbsp;", " ")
        plain_text = plain_text.replace("&amp;", "&")
        plain_text = plain_text.replace("&lt;", "<")
        plain_text = plain_text.replace("&gt;", ">")
        plain_text = plain_text.replace("&quot;", '"')
        plain_text = plain_text.replace("&#39;", "'")
        # Decode numeric entities
        plain_text = re.sub(r"&#(\d+);", lambda m: chr(int(m.group(1))), plain_text)
        if len(plain_text) > 300:
            from pydantic_core import PydanticCustomError

            raise PydanticCustomError(
                "string_too_long",
                "String should have at most 300 characters",
                {"max_length": 300},
            )
        return v
```

## Impact
- **Cross-Site Scripting (XSS)**: Malicious scripts could be injected into CV content
- **Content Injection**: Malicious HTML/CSS could break CV layout or hide content
- **Data Corruption**: Invalid HTML could cause rendering issues or data corruption
- **Privacy Concerns**: Scripts could potentially access sensitive data

## Root Cause
- HTML content is accepted but not sanitized
- Only length validation is performed, not content validation
- No whitelist of allowed HTML tags/attributes
- Manual HTML stripping is insufficient for security

## Fix Applied
1. **HTML sanitization** uses `bleach` with a strict allowlist.
2. **Dangerous tags/attributes** are stripped and comments removed.
3. **Length validation** runs on sanitized plain text.

### Current Implementation
```python
import bleach
import html

ALLOWED_DESCRIPTION_TAGS = [
    "p", "br", "strong", "em", "u", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6"
]

class Experience(BaseModel):
    # ...
    description: Optional[str] = Field(
        None,
        description="Keep this short; put details under projects. HTML formatting is supported.",
    )

    @field_validator("description")
    @classmethod
    def validate_and_sanitize_description(cls, v: str | None) -> str | None:
        """Sanitize HTML description and enforce plain text length."""
        if v is None:
            return v

        sanitized = bleach.clean(
            v,
            tags=ALLOWED_DESCRIPTION_TAGS,
            attributes={},
            strip=True,
            strip_comments=True,
        )

        plain_text = bleach.clean(sanitized, tags=[], attributes={}, strip=True)
        plain_text = html.unescape(plain_text)
        if len(plain_text) > 300:
            from pydantic_core import PydanticCustomError
            raise PydanticCustomError(
                "string_too_long",
                "String should have at most 300 characters",
                {"max_length": 300},
            )

        return sanitized
```

## Applied Mitigations
- Add basic HTML tag filtering to remove `<script>`, `<style>`, and event handler attributes
- Implement length limits on HTML content size
- Add content type validation

## Future Enhancements
- Implement comprehensive HTML sanitization
- Add HTML validation and structure checking
- Consider moving to a rich text editor with built-in sanitization
- Add content security policy (CSP) headers
- Implement XSS protection middleware
