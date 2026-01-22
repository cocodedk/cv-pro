# Issue 03: Missing HTML Content Sanitization

## Severity
**Medium** - Potential XSS and content injection attacks

## Description
User-provided HTML content in experience descriptions is not properly sanitized, potentially allowing cross-site scripting (XSS) attacks and malicious content injection.

## Location
- **Backend**: `backend/models.py` (lines 65-92) - Experience description validation
- **Frontend**: User input in experience description fields

## Technical Details

### Current Validation
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

## Recommended Fix
1. **Implement HTML sanitization library** (e.g., `bleach` for Python)
2. **Define allowed HTML tags and attributes** whitelist
3. **Strip dangerous content** (scripts, event handlers, etc.)
4. **Validate HTML structure** to prevent malformed content

### Implementation Example
```python
import bleach

class Experience(BaseModel):
    # ...
    description: Optional[str] = Field(
        None,
        description="Keep this short; put details under projects. HTML formatting is supported.",
    )

    @field_validator("description")
    @classmethod
    def validate_and_sanitize_description(
        cls, v: str | None, info: ValidationInfo
    ) -> str | None:
        """Validate and sanitize HTML description content."""
        if v is None:
            return v

        # Define allowed HTML tags and attributes
        allowed_tags = [
            'p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
        ]
        allowed_attributes = {}

        # Sanitize HTML content
        sanitized = bleach.clean(
            v,
            tags=allowed_tags,
            attributes=allowed_attributes,
            strip=True
        )

        # Check plain text length after sanitization
        plain_text = bleach.clean(sanitized, tags=[], strip=True)
        if len(plain_text) > 300:
            from pydantic_core import PydanticCustomError
            raise PydanticCustomError(
                "string_too_long",
                "String should have at most 300 characters",
                {"max_length": 300},
            )

        return sanitized
```

## Immediate Mitigation
- Add basic HTML tag filtering to remove `<script>`, `<style>`, and event handler attributes
- Implement length limits on HTML content size
- Add content type validation

## Long-term Solution
- Implement comprehensive HTML sanitization
- Add HTML validation and structure checking
- Consider moving to a rich text editor with built-in sanitization
- Add content security policy (CSP) headers
- Implement XSS protection middleware
