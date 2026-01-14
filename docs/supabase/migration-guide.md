# Neo4j to Supabase Migration

## Architecture Changes

### Before (Neo4j)
- Graph database with nodes and relationships
- Cypher query language
- Complex graph traversals
- Bolt protocol connection

### After (Supabase)
- PostgreSQL relational database
- SQL query language
- Normalized table structure
- RESTful API access

## Code Changes Required

### Dependencies
```diff
# requirements.txt
- neo4j==5.15.0
+ supabase==2.3.0
+ psycopg2-binary==2.9.7
```

### Connection Setup
```python
# Before
from neo4j import GraphDatabase
driver = GraphDatabase.driver(uri, auth=(user, password))

# After
from supabase import create_client
client = create_client(url, key)
```

### Data Models

#### Profiles
```python
# Before: Node properties
profile_node = {
    "name": "John Doe",
    "email": "john@example.com"
}

# After: Table row
profile = {
    "id": "uuid",
    "user_id": "uuid",
    "personal_info": {"name": "John Doe", "email": "john@example.com"},
    "created_at": "2024-01-01T00:00:00Z"
}
```

### Query Translation

#### Get CV by ID
```python
# Before (Cypher)
MATCH (cv:CV {id: $cv_id})
RETURN cv

# After (Supabase)
result = client.table('cvs').select('*').eq('id', cv_id).execute()
```

#### Get Profile with Experiences
```python
# Before (Cypher)
MATCH (p:Profile)-[:HAS_EXPERIENCE]->(e:Experience)
WHERE p.id = $profile_id
RETURN p, collect(e) as experiences

# After (Supabase)
profile = client.table('profiles').select('*, experiences(*)').eq('id', profile_id).execute()
```

## Database Schema Migration

### Export Neo4j Data
```python
def export_neo4j_data():
    # Query all profiles, experiences, education, etc.
    # Transform to relational structure
    # Return as JSON/dict structures
```

### Import to Supabase
```python
def import_to_supabase(data):
    # Insert profiles
    # Insert experiences linked to profiles
    # Insert education linked to profiles
    # Create CVs with relationships
```

## Breaking Changes

### API Endpoints
- Same REST API structure maintained
- Internal database queries change
- Response formats remain compatible

### Environment Variables
```env
# Remove
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=cvpassword

# Add
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=key
SUPABASE_SERVICE_ROLE_KEY=key
```

## Rollback Strategy

1. Keep Neo4j container available during transition
2. Feature flag to switch between databases
3. Dual-write during migration period
4. Quick rollback by changing environment variables

## Testing Strategy

- Unit tests for new Supabase queries
- Integration tests with both databases
- Data consistency validation
- Performance benchmarks
- End-to-end API testing
