import { createClient } from '@supabase/supabase-js'

const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== 'false'
const isTestEnv = import.meta.env.MODE === 'test'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (authEnabled && !isTestEnv && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required')
}

const resolvedUrl = supabaseUrl || 'http://localhost:54321'
const resolvedAnonKey = supabaseAnonKey || 'test-anon-key'

export const supabase = createClient(resolvedUrl, resolvedAnonKey)
