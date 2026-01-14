# Multi-User Architecture

## Overview

Transform the CV Generator from single-user to multi-user with Supabase authentication, enabling each user to have their own isolated CV management experience.

## User Model

### User Table Schema
```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
```

### User Roles
- **user**: Standard user with personal CV management
- **admin**: Full access to all user data and system management

## Data Isolation Strategy

### Row Level Security (RLS)

Enable RLS on all user data tables:
```sql
-- CVs table with user isolation
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cvs"
ON cvs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cvs"
ON cvs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cvs"
ON cvs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all cvs"
ON cvs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);
```

### User-Specific Tables

All existing tables get `user_id` column:
- `cvs` - Links to user profiles
- `experiences` - User's work experience
- `education` - User's education history
- `skills` - User's skills
- `cv_experiences` - CV-specific experience ordering
- `cv_education` - CV-specific education ordering

## Authentication Flow

### Sign Up Process
```typescript
// Frontend signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
});

// Automatic profile creation via database trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Sign In Process
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

## Session Management

### Client-Side Session Handling
```typescript
// Check authentication state
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User signed in
    setUser(session.user);
  } else if (event === 'SIGNED_OUT') {
    // User signed out
    setUser(null);
  }
});

// Get current session
const { data: { session } } = await supabase.auth.getSession();
```

### Protected Routes
```typescript
// Route protection component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
}
```

## Multi-Tenant Features

### User Dashboard
- Personal CV library
- Profile management
- Usage statistics
- Account settings

### Admin Dashboard
- User management
- System analytics
- CV statistics across all users
- Admin controls

## Migration Strategy

### Current Single-User Data
Existing data becomes the first admin user's data:
```sql
-- Migrate existing data to first admin user
UPDATE cvs SET user_id = 'admin-user-id' WHERE user_id IS NULL;
UPDATE experiences SET user_id = 'admin-user-id' WHERE user_id IS NULL;
-- etc for all tables
```

### Backward Compatibility
- Existing API endpoints maintain functionality
- New endpoints for user management
- Gradual rollout of multi-user features