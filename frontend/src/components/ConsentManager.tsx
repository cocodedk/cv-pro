/** GDPR Consent Management Component */
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ConsentPreferences {
  dataProcessing: boolean
  aiProcessing: boolean
  marketing: boolean
  dataSharing: boolean
  analytics: boolean
}

interface ConsentManagerProps {
  onConsentGiven?: (preferences: ConsentPreferences) => void
  showModal?: boolean
  onClose?: () => void
}

const ConsentManager: React.FC<ConsentManagerProps> = ({
  onConsentGiven,
  showModal = false,
  onClose,
}) => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    dataProcessing: false,
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
        const parsedConsent = JSON.parse(savedConsent)
        setPreferences(parsedConsent)
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
  }

  // const hasEssentialConsent = preferences.dataProcessing

  if (!showConsentModal) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Data Processing Consent
            </h2>
            <button
              onClick={() => setShowConsentModal(false)}
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
          </div>

          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To provide you with the best CV creation experience, we need your consent for various
              data processing activities. Please review and choose your preferences below.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Legal Basis:</strong> Your explicit consent (Article 6(1)(a) GDPR) or
              legitimate interest (Article 6(1)(f) GDPR) for essential services.
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
                    Essential Data Processing *
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Required to create, store, and generate your CV documents. Includes processing
                    your personal information, work experience, education, and skills data.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    * This consent is required to use our service
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
                    AI-Powered Features
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Allow us to use artificial intelligence to enhance your CV with personalized
                    suggestions, automated cover letter generation, and job matching
                    recommendations.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Your data will be processed by our AI service providers for this purpose only.
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
                    Analytics & Performance
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Help us improve our service by analyzing how you use our application. This
                    includes page views, feature usage, and performance metrics.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Data is anonymized and aggregated - we cannot identify individual users.
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
                    Marketing Communications
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Receive updates about new features, tips for better CVs, and occasional
                    promotional offers related to career development.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    You can unsubscribe at any time.
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
                    Data Sharing for Research
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Allow anonymized CV data to be used for research purposes to improve CV writing
                    practices and job market insights.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    All personal identifiers are removed - data cannot be traced back to you.
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
              Accept Essential Only
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Accept All
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>
              You can change your preferences at any time by visiting our{' '}
              <a href="#privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>{' '}
              or contacting us at privacy@cocode.dk
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsentManager
