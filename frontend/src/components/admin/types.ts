export type UserRole = 'user' | 'admin'

export interface AdminUser {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  cv_count: number | null
  last_cv_update: string | null
}

export interface DailyStat {
  date: string
  active_users: number
  cvs_created: number
  themed_cvs: number
}

export interface ThemeStat {
  theme: string
  usage_count: number
  unique_users: number
}
