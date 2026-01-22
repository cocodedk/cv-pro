import { useState, useCallback, useEffect } from 'react'
import CVForm from './components/CVForm'
import CVList from './components/CVList'
import ProfileList from './components/ProfileList'
import ProfileManager from './components/ProfileManager'
import Dashboard from './components/Dashboard'
import Navigation from './components/Navigation'
import NotificationModal from './components/NotificationModal'
import Footer from './components/Footer'
import AuthView from './components/AuthView'
import AdminPanel from './components/admin/AdminPanel'
import PrivacyPolicy from './components/PrivacyPolicy'
import ConsentManager from './components/ConsentManager'
import CVSearch from './components/CVSearch'
import Settings from './components/Settings'
import { useHashRouting } from './app_helpers/useHashRouting'
import { useTheme } from './app_helpers/useTheme'
import { useMessage } from './app_helpers/useMessage'
import { BRANDING } from './app_helpers/branding'
import { useAuth } from './contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import './index.css'

function App() {
  const { t } = useTranslation('common')
  const { viewMode, cvId } = useHashRouting()
  const { isDark, setIsDark } = useTheme()
  const { message, showMessage, clearMessage } = useMessage()
  const [, setLoading] = useState(false)
  const { user, loading, role, isActive, signOut } = useAuth()
  const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== 'false'
  const devAuthFallbackEnabled =
    import.meta.env.DEV && import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK === 'true'
  const isAuthenticated = !authEnabled || Boolean(user)
  const isAdmin = role === 'admin' && isActive
  const resolvedViewMode =
    viewMode === 'auth' && isAuthenticated
      ? 'form'
      : viewMode === 'introduction' && !isAuthenticated
        ? 'auth'
        : viewMode

  // GDPR Consent Management
  // NOTE: devAuthFallbackEnabled automatically grants GDPR consent (hasConsent=true) ONLY for local/dev testing.
  // This is intentionally gated by devAuthFallbackEnabled + additional dual-gate checks to NEVER activate in production.
  // State variables: showConsentModal/setShowConsentModal control modal visibility, hasConsent/setHasConsent track consent status.
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [hasConsent, setHasConsent] = useState(devAuthFallbackEnabled)

  const closeConsentModal = useCallback(() => {
    setShowConsentModal(false)
  }, [])

  const checkConsentStatus = useCallback(() => {
    if (typeof window === 'undefined') {
      return false
    }
    // For development, always return true if dev fallback is enabled
    if (devAuthFallbackEnabled) {
      setHasConsent(true)
      return true
    }
    const savedConsent = window.localStorage.getItem('gdpr-consent')
    const hasSavedConsent = Boolean(savedConsent)
    setHasConsent(hasSavedConsent)
    return hasSavedConsent
  }, [devAuthFallbackEnabled])

  const openConsentModal = useCallback(() => {
    checkConsentStatus()
    setShowConsentModal(true)
  }, [checkConsentStatus])

  const maybeOpenConsentModal = useCallback(() => {
    const hasSavedConsent = checkConsentStatus()
    if (!hasSavedConsent) {
      setShowConsentModal(true)
    }
  }, [checkConsentStatus])

  const handleConsentSaved = useCallback(() => {
    setHasConsent(true)
  }, [])

  useEffect(() => {
    if (!authEnabled || loading || !user) {
      return
    }
    maybeOpenConsentModal()
  }, [authEnabled, loading, maybeOpenConsentModal, user])

  useEffect(() => {
    document.title = `${BRANDING.appName} — ${BRANDING.ownerName} (${BRANDING.companyName})`
  }, [])

  const handleSuccess = useCallback(
    (message: string) => showMessage('success', message),
    [showMessage]
  )

  const handleError = useCallback(
    (message: string | string[]) => showMessage('error', message),
    [showMessage]
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation
        viewMode={resolvedViewMode}
        isDark={isDark}
        onThemeToggle={() => setIsDark(current => !current)}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        user={user}
        onSignOut={signOut}
      />

      <NotificationModal message={message} onClose={clearMessage} />

      <ConsentManager
        showModal={showConsentModal}
        onClose={closeConsentModal}
        onConsentSaved={handleConsentSaved}
        canClose={hasConsent}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authEnabled && loading ? (
          <div className="text-sm text-gray-500">{t('checkingSession')}</div>
        ) : authEnabled && !user ? (
          <AuthView onSignUpSuccess={maybeOpenConsentModal} />
        ) : resolvedViewMode === 'introduction' ? (
          <Dashboard />
        ) : resolvedViewMode === 'admin' ? (
          <AdminPanel isAdmin={isAdmin} />
        ) : resolvedViewMode === 'settings' ? (
          <Settings onEditConsent={openConsentModal} />
        ) : resolvedViewMode === 'privacy' ? (
          <PrivacyPolicy />
        ) : resolvedViewMode === 'search' ? (
          isAdmin ? (
            <CVSearch onCVSelected={cvId => (window.location.hash = `#edit/${cvId}`)} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t('accessDenied')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{t('accessDeniedMessage')}</p>
            </div>
          )
        ) : resolvedViewMode === 'form' || resolvedViewMode === 'edit' ? (
          <CVForm
            onSuccess={handleSuccess}
            onError={handleError}
            setLoading={setLoading}
            cvId={cvId}
          />
        ) : resolvedViewMode === 'list' ? (
          <CVList onError={handleError} />
        ) : resolvedViewMode === 'profile-list' ? (
          <ProfileList onError={handleError} />
        ) : resolvedViewMode === 'profile' ? (
          <ProfileManager onSuccess={handleSuccess} onError={handleError} setLoading={setLoading} />
        ) : (
          <ProfileManager onSuccess={handleSuccess} onError={handleError} setLoading={setLoading} />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
