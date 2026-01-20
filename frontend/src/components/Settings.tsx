import { useTranslation } from 'react-i18next'

interface SettingsProps {
  onEditConsent: () => void
}

export default function Settings({ onEditConsent }: SettingsProps) {
  const { t } = useTranslation('settings')

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>

      <div className="mt-6 space-y-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('sections.consent.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('sections.consent.description')}
          </p>
          <button
            type="button"
            onClick={onEditConsent}
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('actions.editConsent')}
          </button>
        </div>
      </div>
    </div>
  )
}
