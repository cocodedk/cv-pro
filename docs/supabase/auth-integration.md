# Supabase Authentication Integration

Supabase Auth will handle sign-in/out and session management. The frontend will use supabase-js for auth and the backend will validate access tokens on API requests.

## Frontend Setup

1. Install supabase-js:
```bash
cd frontend
npm install @supabase/supabase-js
```

2. Create a Supabase client (`frontend/src/config/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

3. Add an auth context (`frontend/src/contexts/AuthContext.tsx`) and keep it minimal:
```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setUser(next?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

4. Attach access tokens to API requests (`frontend/src/config/axios.ts`):
```typescript
import axios from 'axios'
import { supabase } from './supabase'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
```

## Backend Auth Dependencies

Create a dependency that validates access tokens (`backend/app_helpers/auth.py`):
```python
import os
from fastapi import Depends, Header, HTTPException
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "", 1)
    try:
        response = supabase.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    if not response or not response.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return response.user


def get_current_admin(current_user=Depends(get_current_user)):
    admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    profile = (
        admin_client.table("user_profiles")
        .select("role, is_active")
        .eq("id", current_user.id)
        .single()
        .execute()
    )
    role = profile.data.get("role") if profile and profile.data else None
    is_active = profile.data.get("is_active") if profile and profile.data else False
    if role != "admin" or not is_active:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
```

Use it in routes:
```python
@router.get("/api/cvs")
async def list_cvs(current_user=Depends(get_current_user)):
    ...
```

## Auth Flow

Frontend sign-up/sign-in uses supabase-js:
```typescript
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
```

## Security Notes
- Do not use `supabase.auth.admin` in the frontend (service role key must stay server-only).
- Use RLS and also enforce `user_id` filters in the backend for defense-in-depth.
