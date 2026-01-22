import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'

type UserRole = 'user' | 'admin' | null

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  role: UserRole
  isActive: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider: Starting up')
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole>('user')
  const [isActive, setIsActive] = useState(true)

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null)
      setIsActive(false)
      return
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', currentUser.id)
      .single()

    if (error || !data) {
      setRole(null)
      setIsActive(false)
      return
    }

    setRole(data.role ?? null)
    setIsActive(Boolean(data.is_active))
  }, [])

  useEffect(() => {
    let isMounted = true

    // Check for development auth fallback - only enable when explicitly set
    const allowDevFallback = import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK === 'true'
    console.log(
      'AuthContext: DEV =',
      import.meta.env.DEV,
      'ALLOW_DEV_FALLBACK =',
      import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK,
      'allowDevFallback =',
      allowDevFallback
    )

    if (allowDevFallback) {
      // Force development authentication - always use dev user when enabled
      const devUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'dev@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      }
      const devSession = {
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        expires_at: Date.now() / 1000 + 3600,
        user: devUser,
      }
      setSession(devSession as any)
      setUser(devUser as any)
      // Skip profile loading for development user to avoid Supabase API issues
      setRole('user')
      setIsActive(true)
      setLoading(false)
      return
    }

    // Set a timeout to ensure loading is set to false even if auth operations hang
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false)
      }
    }, 2000)

    const initialize = async () => {
      try {
        // Try to get the session, but don't wait indefinitely
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )

        const { data } = (await Promise.race([sessionPromise, timeoutPromise])) as Awaited<
          ReturnType<typeof supabase.auth.getSession>
        >
        if (!isMounted) return

        setSession(data.session)
        setUser(data.session?.user ?? null)
        await loadProfile(data.session?.user ?? null)
        setLoading(false)
        clearTimeout(loadingTimeout)
      } catch (error) {
        // If getSession fails or times out, rely on onAuthStateChange
        // Silent catch - onAuthStateChange will handle session restoration
      }
    }

    initialize()

    const { data } = supabase.auth.onAuthStateChange(async (_event, next) => {
      if (!isMounted) return
      try {
        setSession(next)
        setUser(next?.user ?? null)
        await loadProfile(next?.user ?? null)
        setLoading(false)
        clearTimeout(loadingTimeout)
      } catch (error) {
        console.error('Error in auth state change:', error)
        setLoading(false)
        clearTimeout(loadingTimeout)
      }
    })

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      data.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    // Check if we're in development mode with fake auth
    const allowDevFallback = import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK === 'true'

    if (allowDevFallback) {
      // In development mode, just reset the local state
      setUser(null)
      setSession(null)
      setRole(null)
      setIsActive(false)
      return
    }

    // In production, sign out from Supabase
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, role, isActive, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
