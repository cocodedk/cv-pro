# Supabase Authentication Integration

## Authentication Capabilities

Leverage Supabase's built-in authentication system for secure, scalable user management with email, social logins, and advanced security features.

## Core Authentication Features

### Email & Password Auth
```typescript
// Sign up with email
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'user'
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
});

// Sign out
const { error } = await supabase.auth.signOut();
```

### Social Authentication
```typescript
// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://app.cv-pro.com/auth/callback'
  }
});

// GitHub OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
});
```

## Advanced Security Features

### Multi-Factor Authentication (MFA)
```typescript
// Enable MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
});

// Verify MFA code
const { data, error } = await supabase.auth.mfa.verify({
  factorId: 'factor-id',
  code: '123456'
});
```

### Session Management
```typescript
// Get current session
const { data: { session }, error } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  // Handle sign in, sign out, token refresh
});

// Refresh session
const { data, error } = await supabase.auth.refreshSession();
```

## User Profile Management

### Profile Creation & Updates
```typescript
// Update user metadata
const { data, error } = await supabase.auth.updateUser({
  data: {
    full_name: 'Updated Name',
    avatar_url: 'https://example.com/avatar.jpg'
  }
});

// Update password
const { data, error } = await supabase.auth.updateUser({
  password: 'newpassword123'
});
```

### Database-Linked Profiles
```sql
-- Sync auth.users with profiles table
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE profiles SET
      email = NEW.email,
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        profiles.full_name
      ),
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_user_profile_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_profile();
```

## Email Integration

### Built-in Email Features
```typescript
// Password reset
const { data, error } = await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://app.cv-pro.com/reset-password'
});

// Email confirmation
const { data, error } = await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com'
});

// Invite users (admin only)
const { data, error } = await supabase.auth.admin.inviteUserByEmail('newuser@example.com');
```

### Custom Email Templates
```typescript
// Configure email templates in Supabase dashboard
// Templates for:
// - Welcome emails
// - Password reset
// - Email verification
// - CV generation notifications
```

## Security Best Practices

### Row Level Security (RLS)
```sql
-- Enable RLS on user data
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can access own data"
ON cvs FOR ALL
USING (auth.uid() = user_id);

-- Admins can access all data
CREATE POLICY "Admins can access all data"
ON cvs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### JWT Token Handling
```typescript
// Extract user info from JWT
const { data: { user } } = await supabase.auth.getUser();

// Use in API calls
const response = await fetch('/api/cvs', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
});
```

### Secure API Endpoints
```python
# Backend authentication middleware
from fastapi import Depends, HTTPException
from supabase import create_client

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Verify JWT token with Supabase
        user = supabase.auth.get_user(token)
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    return supabase.table('profiles').select('*').eq('id', current_user['id']).execute()
```

## Frontend Integration

### React Auth Context
```typescript
// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Route Protection
```typescript
// ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.user_metadata?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

## Migration from Current Auth

### Current State
- No authentication system
- Single user operation
- All data stored without user isolation

### Migration Steps
1. **Set up Supabase Auth**
2. **Create user profiles table**
3. **Implement RLS policies**
4. **Add authentication UI components**
5. **Migrate existing data to admin user**
6. **Update API endpoints with user context**
7. **Add protected routes**
8. **Implement admin features**

## Email & Communication

### Transactional Emails
```typescript
// Send CV generation notification
const { data, error } = await supabase.functions.invoke('send-cv-notification', {
  body: {
    userEmail: user.email,
    cvId: cv.id,
    downloadUrl: `https://app.cv-pro.com/cv/${cv.id}/download`
  }
});
```

### Marketing Emails (Future)
```typescript
// User onboarding sequence
// Feature announcements
// Usage tips and updates
```

This authentication system provides enterprise-grade security while maintaining developer-friendly APIs for rapid feature development.