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

type CVTemplate = {
  layout: string
  theme: string
  file: string
  name: string
  description: string
  print_friendly: boolean
  web_optimized: boolean
}

type TemplateIndex = {
  generated_at: string
  profile_name: string
  templates: CVTemplate[]
}

type FilterType = 'all' | 'web' | 'print'

export default function Dashboard() {
  const { t } = useTranslation('dashboard')
  const { user } = useAuth()
  const [recentCVs, setRecentCVs] = useState<CVSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [templateData, setTemplateData] = useState<TemplateIndex | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplate | null>(null)

  useEffect(() => {
    // In a real app, this would fetch the user's CVs from the API
    // For now, we'll simulate loading
    setTimeout(() => {
      setRecentCVs([
        // Mock data - in real app this would come from API
      ])
      setLoading(false)
    }, 1000)

    // Load template index
    const basePath = import.meta.env.BASE_URL || '/'
    const indexUrl = `${basePath}templates/index.json`

    fetch(indexUrl)
      .then(async response => {
        if (response.ok) {
          const data = (await response.json()) as TemplateIndex
          setTemplateData(data)
        } else {
          setTemplateData(null)
        }
      })
      .catch(() => {
        setTemplateData(null)
      })
  }, [])

  const filteredTemplates =
    templateData?.templates.filter(template => {
      if (selectedFilter === 'web') return template.web_optimized
      if (selectedFilter === 'print') return template.print_friendly
      return true
    }) || []

  const templatesBase = `${import.meta.env.BASE_URL || '/'}templates/`

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

      {/* CV Templates Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('cv_templates')}
        </h2>

        {templateData?.templates ? (
          <>
            {/* Filter Controls */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('filters.all')} ({templateData.templates.length})
              </button>
              <button
                onClick={() => setSelectedFilter('web')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === 'web'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('filters.web')} ({templateData.templates.filter(t => t.web_optimized).length})
              </button>
              <button
                onClick={() => setSelectedFilter('print')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === 'print'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('filters.print')} ({templateData.templates.filter(t => t.print_friendly).length})
              </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <div
                  key={`${template.layout}-${template.theme}`}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Template Preview */}
                  <div className="h-48 bg-gray-50 dark:bg-gray-800 relative overflow-hidden border-b border-gray-200 dark:border-gray-700">
                    <div className="absolute inset-0 flex items-start justify-center">
                      <iframe
                        src={`${templatesBase}${template.file}`}
                        className="border-0"
                        style={{
                          width: '600px',
                          height: '849px', // A4 portrait (1:1.414)
                          transform: 'scale(0.2)',
                          transformOrigin: 'top center',
                        }}
                        title={t('template_preview', { name: template.name })}
                        loading="lazy"
                        scrolling="no"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {template.description}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.web_optimized && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                          {t('badges.web')}
                        </span>
                      )}
                      {template.print_friendly && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          {t('badges.print')}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {t('actions.preview')}
                      </button>
                      <a
                        href={`${templatesBase}${template.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center text-sm"
                      >
                        {t('actions.view_full')}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{t('empty.filtered')}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('loading_templates')}</p>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {previewTemplate.name}
              </h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <iframe
                src={`${templatesBase}${previewTemplate.file}`}
                className="w-full h-auto max-h-[70vh] border-0"
                title={previewTemplate.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}