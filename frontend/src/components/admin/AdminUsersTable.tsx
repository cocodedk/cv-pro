import type { AdminUser, UserRole } from './types'
import { useTranslation } from 'react-i18next'

interface AdminUsersTableProps {
  users: AdminUser[]
  error: string | null
  updatingUserId: string | null
  onRefresh: () => void
  onUpdateRole: (userId: string, role: UserRole) => void
  onDeactivate: (userId: string) => void
}

export default function AdminUsersTable({
  users,
  error,
  updatingUserId,
  onRefresh,
  onUpdateRole,
  onDeactivate,
}: AdminUsersTableProps) {
  const { t } = useTranslation('admin')

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('users.title')}
        </h2>
        <button onClick={onRefresh} className="text-sm text-blue-600 hover:text-blue-700">
          {t('users.refresh')}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2">{t('users.columns.email')}</th>
              <th className="px-4 py-2">{t('users.columns.role')}</th>
              <th className="px-4 py-2">{t('users.columns.active')}</th>
              <th className="px-4 py-2">{t('users.columns.cvs')}</th>
              <th className="px-4 py-2">{t('users.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map(user => (
              <tr key={user.id} className="bg-white dark:bg-gray-950">
                <td className="px-4 py-2">
                  <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                  <p className="text-xs text-gray-500">{user.full_name || t('users.noName')}</p>
                </td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2">
                  {user.is_active ? t('users.active.yes') : t('users.active.no')}
                </td>
                <td className="px-4 py-2">{user.cv_count ?? 0}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onUpdateRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                    disabled={updatingUserId === user.id}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {user.role === 'admin' ? t('users.makeUser') : t('users.makeAdmin')}
                  </button>
                  {user.is_active ? (
                    <button
                      onClick={() => onDeactivate(user.id)}
                      disabled={updatingUserId === user.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('users.deactivate')}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
