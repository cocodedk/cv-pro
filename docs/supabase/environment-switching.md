# Environment Switching

## Intelligent Environment Detection

The application automatically switches between local and production Supabase based on environment variables and configuration.

## Environment Variables Strategy

```python
# config.py
import os

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

# Auto-detect environment
IS_PRODUCTION = SUPABASE_URL and 'supabase.co' in SUPABASE_URL
IS_LOCAL = SUPABASE_URL and 'localhost' in SUPABASE_URL
```

## Docker Compose Changes

### Current (Neo4j)
```yaml
services:
  neo4j:
    image: neo4j:5.15
    ports:
      - "7474:7474"
      - "7687:7687"
```

### Future (Supabase Local)
```yaml
services:
  supabase:
    image: supabase/supabase-local:latest
    ports:
      - "54321:54321"  # API
      - "54322:54322"  # Database
      - "54323:54323"  # Studio
```

## Runtime Detection

```python
from supabase import create_client

def get_supabase_client():
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_ANON_KEY')

    if not url or not key:
        if os.getenv('NODE_ENV') == 'development':
            # Use local Supabase defaults
            url = "http://localhost:54321"
            key = "local-anon-key"
        else:
            raise ValueError("Supabase credentials required")

    return create_client(url, key)
```

## Development vs Production Behavior

### Development
- Uses local Supabase container
- Auto-reload on schema changes
- Debug logging enabled
- Test data available

### Production
- Uses hosted Supabase
- Optimized queries
- Caching enabled
- Error logging to external service

## Migration Path

1. **Phase 1**: Environment detection logic
2. **Phase 2**: Local Supabase setup
3. **Phase 3**: Production Supabase configuration
4. **Phase 4**: Seamless switching based on environment