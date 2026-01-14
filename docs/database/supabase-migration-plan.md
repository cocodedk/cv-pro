# Supabase Database Migration Plan

## Overview

This document outlines the plan to migrate from Neo4j graph database to Supabase (PostgreSQL) for the CV Generator application.

## Current Architecture (Neo4j)

### Data Model
- **Graph Structure**: CV data stored as interconnected nodes and relationships
- **Key Entities**:
  - CV nodes with metadata
  - Personal information nodes
  - Experience nodes
  - Education nodes
  - Profile master data
- **Relationships**: Complex graph relationships between entities
- **Queries**: Cypher queries for graph traversals

### Current Features
- CRUD operations for CVs
- Profile management with master data
- Search and filtering capabilities
- Graph-based relationships for data integrity

## Target Architecture (Supabase)

### Why Supabase?
- **PostgreSQL Foundation**: Robust relational database with ACID compliance
- **Real-time Capabilities**: Built-in real-time subscriptions for live updates
- **Authentication**: Integrated auth system (could replace current approach)
- **Edge Functions**: Serverless functions for complex logic
- **RESTful API**: Auto-generated REST API for data access
- **Type Safety**: TypeScript support with generated types
- **Scalability**: Better horizontal scaling than Neo4j for this use case

### Proposed Schema Design

#### Tables Structure
```sql
-- Master profile table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    personal_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV documents table
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    metadata JSONB,
    content JSONB, -- Full CV data as JSON
    theme VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiences table (normalized from graph structure)
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    description TEXT,
    achievements JSONB, -- Array of achievement strings
    technologies JSONB, -- Array of technologies used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education table
CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    gpa DECIMAL(3,2),
    achievements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    years_experience DECIMAL(4,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV Experiences junction table (for CV-specific ordering)
CREATE TABLE cv_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    UNIQUE(cv_id, experience_id)
);

-- CV Education junction table
CREATE TABLE cv_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
    education_id UUID REFERENCES education(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    UNIQUE(cv_id, education_id)
);
```

### Indexes and Performance
```sql
-- Performance indexes
CREATE INDEX idx_cvs_profile_id ON cvs(profile_id);
CREATE INDEX idx_experiences_profile_id ON experiences(profile_id);
CREATE INDEX idx_education_profile_id ON education(profile_id);
CREATE INDEX idx_skills_profile_id ON skills(profile_id);
CREATE INDEX idx_cv_experiences_cv_id ON cv_experiences(cv_id);
CREATE INDEX idx_cv_education_cv_id ON cv_education(cv_id);

-- Full-text search indexes
CREATE INDEX idx_cvs_title_search ON cvs USING gin(to_tsvector('english', title));
CREATE INDEX idx_experiences_company_search ON experiences USING gin(to_tsvector('english', company || ' ' || position));
CREATE INDEX idx_skills_name_search ON skills USING gin(to_tsvector('english', name));
```

## Migration Strategy

### Phase 1: Research and Planning
- [ ] Analyze current Neo4j queries and data access patterns
- [ ] Design PostgreSQL schema equivalent
- [ ] Plan data migration scripts
- [ ] Set up Supabase project and configuration

### Phase 2: Infrastructure Setup
- [ ] Update Python dependencies (supabase-py)
- [ ] Configure Supabase connection settings
- [ ] Update Docker configuration
- [ ] Set up environment variables

### Phase 3: Schema Implementation
- [ ] Create database tables and indexes
- [ ] Implement Row Level Security (RLS) policies
- [ ] Set up database functions and triggers

### Phase 4: Backend Migration
- [ ] Replace Neo4j connection with Supabase client
- [ ] Update all database query functions
- [ ] Implement new data access layer
- [ ] Update API endpoints to use new queries

### Phase 5: Data Migration
- [ ] Export data from existing Neo4j database
- [ ] Transform data to match new schema
- [ ] Import data into Supabase
- [ ] Verify data integrity

### Phase 6: Testing and Validation
- [ ] Update and run all tests
- [ ] Test all API endpoints
- [ ] Performance testing
- [ ] User acceptance testing

### Phase 7: Deployment and Documentation
- [ ] Update deployment configuration
- [ ] Update documentation
- [ ] Remove Neo4j dependencies
- [ ] Deploy to production

## Benefits of Migration

### Technical Benefits
- **Simplified Architecture**: Relational model easier to understand and maintain
- **Better Performance**: For typical CRUD operations vs complex graph traversals
- **Standard SQL**: Familiar query language for most developers
- **Built-in Features**: Authentication, real-time, file storage
- **Better Tooling**: Rich ecosystem of PostgreSQL tools

### Operational Benefits
- **Easier Scaling**: PostgreSQL scales better for this use case
- **Backup/Restore**: Standard PostgreSQL tooling
- **Monitoring**: Better observability with Supabase dashboard
- **Cost**: Potentially lower operational costs

### Development Benefits
- **Type Safety**: Better TypeScript integration
- **Auto-generated API**: REST API generated from schema
- **Real-time**: Built-in real-time capabilities for live updates
- **Serverless**: Edge functions for complex logic

## Risks and Considerations

### Data Complexity
- **Graph to Relational**: Some graph relationships may be harder to represent
- **Query Complexity**: Some Cypher queries may be complex to translate
- **Performance**: Need to ensure equivalent or better performance

### Migration Challenges
- **Data Loss Risk**: Careful planning needed for data migration
- **Downtime**: Potential service interruption during migration
- **Rollback Plan**: Need ability to rollback if issues arise

### Learning Curve
- **New Technology**: Team needs to learn Supabase specifics
- **Different Patterns**: Relational patterns vs graph patterns
- **New Tools**: Supabase CLI, dashboard, etc.

## Success Metrics

- **Performance**: Query response times should be equivalent or better
- **Reliability**: Zero data loss during migration
- **Functionality**: All current features working after migration
- **Maintainability**: Code should be easier to maintain and extend

## Timeline Estimate

- **Phase 1-2**: 1-2 weeks (Research, Planning, Infrastructure)
- **Phase 3-4**: 2-3 weeks (Schema, Backend Migration)
- **Phase 5**: 1 week (Data Migration)
- **Phase 6-7**: 1-2 weeks (Testing, Deployment)

**Total Estimate**: 5-8 weeks depending on complexity and testing requirements.
