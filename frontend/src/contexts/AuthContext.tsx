import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'

type UserRole = 'user' | 'admin' | null

interface UserProfileRecord {
  role: UserRole
  is_active: boolean | null
}

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
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole>(null)
  const [isActive, setIsActive] = useState(false)

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null)
      setIsActive(false)
      return
    }

    const { data, error } = await supabase
      .from<UserProfileRecord>('user_profiles')
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

    const initialize = async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      await loadProfile(data.session?.user ?? null)
      setLoading(false)
    }

    initialize()

    const { data } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next)
      setUser(next?.user ?? null)
      await loadProfile(next?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
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
