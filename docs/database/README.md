# Database Documentation

## Overview

This directory contains database-related documentation for the CV Generator application.

## Current Database: Neo4j

The application currently uses **Neo4j** graph database for storing CV data with complex relationships between entities.

- **Connection**: Bolt protocol to `neo4j:7687`
- **Data Model**: Graph-based with nodes and relationships
- **Query Language**: Cypher
- **Features**: Graph traversals, relationship queries, complex data relationships

## Planned Migration: Supabase (PostgreSQL)

### Branch: `feature/supabase-migration`

This branch contains the planning and eventual implementation for migrating from Neo4j to Supabase (PostgreSQL).

### Migration Goals

- **Simplify Architecture**: Move from graph database to relational database
- **Improve Performance**: Better performance for typical CRUD operations
- **Enhanced Features**: Leverage Supabase's built-in authentication, real-time capabilities
- **Easier Maintenance**: Standard SQL and familiar relational patterns

### Key Documents

- **[Supabase Migration Plan](supabase-migration-plan.md)**: Comprehensive migration strategy and implementation roadmap

### Migration Phases

1. **Planning** ✅ (Current Phase)
   - Research and analysis
   - Schema design
   - Migration strategy planning

2. **Implementation** (Next Phase)
   - Schema creation
   - Backend code updates
   - Data migration scripts

3. **Testing & Deployment**
   - Integration testing
   - Performance validation
   - Production deployment

## Database Schema

### Current (Neo4j)
- Graph-based data model
- Dynamic relationships
- Cypher query language

### Target (Supabase/PostgreSQL)
- Relational tables: `profiles`, `cvs`, `experiences`, `education`, `skills`
- Junction tables for CV-specific ordering
- Standard SQL queries
- JSONB fields for flexible data storage

## Configuration

### Neo4j (Current)
```env
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=cvpassword
NEO4J_DATABASE=neo4j
```

### Supabase (Planned)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Development Notes

- All changes should be made on the `feature/supabase-migration` branch
- Migration planning is complete, awaiting implementation approval
- Maintain backward compatibility during transition period
- Comprehensive testing required before production deployment