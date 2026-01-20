# Database Documentation

## Overview

This directory contains database-related documentation for the CV Generator application.

## Current Database: Supabase (PostgreSQL)

The application uses **Supabase** (PostgreSQL + Auth) for storing CV data with row-level security and multi-user support.

- **Connection**: Supabase REST API + Postgres
- **Data Model**: Relational tables with JSONB payloads
- **Query Language**: SQL (via Supabase API)
- **Features**: Auth, RLS policies, server-side admin access

## Database Schema

### Supabase/PostgreSQL
- Relational tables: `cv_profiles`, `cvs`, `cover_letters`
- JSONB fields for flexible data storage
- Row-level security for user isolation

## Configuration

### Supabase
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
