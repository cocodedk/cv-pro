import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { BRANDING } from '../app_helpers/branding'

type CVSummary = {
  id: string
  name: string
  created_at: string
  updated_at: string
  template?: string
}

export default function Dashboard() {
  const { t } = useTranslation('dashboard')
  const { user } = useAuth()
  const [recentCVs, setRecentCVs] = useState<CVSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch the user's CVs from the API
    // For now, we'll simulate loading
    setTimeout(() => {
      setRecentCVs([
        // Mock data - in real app this would come from API
      ])
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.user_metadata?.full_name || user?.email || 'User'}!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('welcome_message')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('actions.create_cv')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('actions.create_cv_desc')}
          </p>
          <button
            onClick={() => { window.location.hash = 'form' }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('actions.create_now')}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('actions.my_cvs')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('actions.my_cvs_desc')}
          </p>
          <button
            onClick={() => { window.location.hash = 'list' }}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('actions.view_cvs')}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('actions.profile')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('actions.profile_desc')}
          </p>
          <button
            onClick={() => { window.location.hash = 'profile' }}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('actions.manage_profile')}
          </button>
        </div>
      </div>

      {/* Recent CVs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('recent_cvs')}
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">{t('loading')}</p>
          </div>
        ) : recentCVs.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('no_cvs_yet')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('no_cvs_desc')}
            </p>
            <button
              onClick={() => { window.location.hash = 'form' }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('create_first_cv')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCVs.map((cv) => (
              <div key={cv.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{cv.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Updated {new Date(cv.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => { window.location.hash = `edit/${cv.id}` }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {t('edit')}
                  </button>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    {t('download')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}