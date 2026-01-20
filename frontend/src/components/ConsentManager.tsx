/** GDPR Consent Management Component */
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface ConsentPreferences {
  dataProcessing: boolean
  aiProcessing: boolean
  marketing: boolean
  dataSharing: boolean
  analytics: boolean
}

interface ConsentManagerProps {
  onConsentGiven?: (preferences: ConsentPreferences) => void
  onConsentSaved?: () => void
  showModal?: boolean
  onClose?: () => void
  canClose?: boolean
}

const ConsentManager: React.FC<ConsentManagerProps> = ({
  onConsentGiven,
  onConsentSaved,
  showModal = false,
  onClose,
  canClose = true,
}) => {
  const { t } = useTranslation('consent')
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    dataProcessing: true,
    aiProcessing: false,
    marketing: false,
    dataSharing: false,
    analytics: false,
  })

  const [showConsentModal, setShowConsentModal] = useState(showModal)

  useEffect(() => {
    setShowConsentModal(showModal)
  }, [showModal])

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedConsent = localStorage.getItem('gdpr-consent')
    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent) as Partial<ConsentPreferences>
        setPreferences(prev => ({
          ...prev,
          ...parsedConsent,
          dataProcessing: true,
        }))
      } catch (error) {
        console.error('Error parsing saved consent:', error)
      }
    }
  }, [])

  const handlePreferenceChange = (key: keyof ConsentPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      dataProcessing: true,
      aiProcessing: true,
      marketing: true,
      dataSharing: true,
      analytics: true,
    }
    setPreferences(allAccepted)
    saveConsent(allAccepted)
    setShowConsentModal(false)
    onConsentGiven?.(allAccepted)
    onClose?.()
  }

  const handleAcceptEssential = () => {
    const essentialOnly = {
      dataProcessing: true,
      aiProcessing: false,
      marketing: false,
      dataSharing: false,
      analytics: false,
    }
    setPreferences(essentialOnly)
    saveConsent(essentialOnly)
    setShowConsentModal(false)
    onConsentGiven?.(essentialOnly)
    onClose?.()
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
    setShowConsentModal(false)
    onConsentGiven?.(preferences)
    onClose?.()
  }

  const saveConsent = (consentPrefs: ConsentPreferences) => {
    const consentData = {
      ...consentPrefs,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      version: '1.0',
    }
    localStorage.setItem('gdpr-consent', JSON.stringify(consentData))
    onConsentSaved?.()
  }

  // const hasEssentialConsent = preferences.dataProcessing

  if (!showConsentModal) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl lg:max-w-4xl max-h-[92vh] md:max-h-[94vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
            {canClose ? (
              <button
                onClick={() => {
                  setShowConsentModal(false)
                  onClose?.()
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ) : null}
          </div>

          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('intro')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{t('legalBasis.label')}</strong> {t('legalBasis.text')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Essential Data Processing */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="dataProcessing"
                  checked={preferences.dataProcessing}
                  onChange={e => handlePreferenceChange('dataProcessing', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled // Essential - cannot be unchecked
                />
                <div className="flex-1">
                  <label
                    htmlFor="dataProcessing"
                    className="text-lg font-medium text-gray-900 dark:text-white"
                  >
                    {t('sections.essential.title')}
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('sections.essential.description')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('sections.essential.requiredNote')}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Processing */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="aiProcessing"
                  checked={preferences.aiProcessing}
                  onChange={e => handlePreferenceChange('aiProcessing', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label
                    htmlFor="aiProcessing"
                    className="text-lg font-medium text-gray-900 dark:text-white"
                  >
                    {t('sections.ai.title')}
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('sections.ai.description')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('sections.ai.note')}
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={preferences.analytics}
                  onChange={e => handlePreferenceChange('analytics', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label
                    htmlFor="analytics"
                    className="text-lg font-medium text-gray-900 dark:text-white"
                  >
                    {t('sections.analytics.title')}
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('sections.analytics.description')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('sections.analytics.note')}
                  </p>
                </div>
              </div>
            </div>

            {/* Marketing */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={preferences.marketing}
                  onChange={e => handlePreferenceChange('marketing', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label
                    htmlFor="marketing"
                    className="text-lg font-medium text-gray-900 dark:text-white"
                  >
                    {t('sections.marketing.title')}
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('sections.marketing.description')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('sections.marketing.note')}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="dataSharing"
                  checked={preferences.dataSharing}
                  onChange={e => handlePreferenceChange('dataSharing', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label
                    htmlFor="dataSharing"
                    className="text-lg font-medium text-gray-900 dark:text-white"
                  >
                    {t('sections.research.title')}
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('sections.research.description')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('sections.research.note')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAcceptEssential}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {t('actions.acceptEssential')}
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {t('actions.savePreferences')}
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('actions.acceptAll')}
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>
              {t('footer.prefix')}{' '}
              <a href="#privacy" className="text-blue-600 hover:text-blue-500">
                {t('footer.privacyPolicyLink')}
              </a>{' '}
              {t('footer.suffix', { email: 'privacy@cocode.dk' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsentManager
