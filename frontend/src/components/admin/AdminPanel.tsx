import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import AdminStats from './AdminStats'
import AdminUsersTable from './AdminUsersTable'
import type { AdminUser, DailyStat, ThemeStat, UserRole } from './types'

interface AdminPanelProps {
  isAdmin: boolean
}

const resolveError = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { detail?: string } } }).response
    return response?.data?.detail || fallback
  }
  return fallback
}

export default function AdminPanel({ isAdmin }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<DailyStat[]>([])
  const [themes, setThemes] = useState<ThemeStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true)
      const [usersRes, statsRes, themesRes] = await Promise.all([
        axios.get<{ users: AdminUser[] }>('/api/admin/users'),
        axios.get<{ stats: DailyStat[] }>('/api/admin/stats/daily'),
        axios.get<{ themes: ThemeStat[] }>('/api/admin/stats/themes'),
      ])
      setUsers(usersRes.data.users ?? [])
      setStats(statsRes.data.stats ?? [])
      setThemes(themesRes.data.themes ?? [])
      setError(null)
    } catch (err: unknown) {
      setError(resolveError(err, 'Failed to load admin data'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    } else {
      setLoading(false)
    }
  }, [isAdmin, loadAdminData])

  const updateRole = async (userId: string, role: UserRole) => {
    try {
      setUpdatingUserId(userId)
      await axios.put(`/api/admin/users/${userId}/role`, { role })
      await loadAdminData()
    } catch (err: unknown) {
      setError(resolveError(err, 'Failed to update role'))
    } finally {
      setUpdatingUserId(null)
    }
  }

  const deactivateUser = async (userId: string) => {
    try {
      setUpdatingUserId(userId)
      await axios.put(`/api/admin/users/${userId}/deactivate`)
      await loadAdminData()
    } catch (err: unknown) {
      setError(resolveError(err, 'Failed to deactivate user'))
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
        Admin access required.
      </div>
    )
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading admin data...</div>
  }

  return (
    <div className="space-y-8">
      <AdminStats stats={stats} themes={themes} />
      <AdminUsersTable
        users={users}
        error={error}
        updatingUserId={updatingUserId}
        onRefresh={loadAdminData}
        onUpdateRole={updateRole}
        onDeactivate={deactivateUser}
      />
    </div>
  )
}
