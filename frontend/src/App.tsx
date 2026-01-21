import { useState, useCallback, useEffect } from 'react'
import CVForm from './components/CVForm'
import CVList from './components/CVList'
import ProfileList from './components/ProfileList'
import ProfileManager from './components/ProfileManager'
import Introduction from './components/Introduction'
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
  // Force authentication for development testing
  const devBypass = import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK === 'true'
  const isAuthenticated = !authEnabled || Boolean(user) || devBypass
  const isAdmin = (role === 'admin' && isActive) || devBypass
  const resolvedViewMode = viewMode === 'auth' && isAuthenticated ? 'form' : viewMode

  // GDPR Consent Management
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [hasConsent, setHasConsent] = useState(
    import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK === 'true'
  )

  const closeConsentModal = useCallback(() => {
    setShowConsentModal(false)
  }, [])

  const checkConsentStatus = useCallback(() => {
    if (typeof window === 'undefined') {
      return false
    }
    // For development, always return true if dev fallback is enabled
    if (import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK === 'true') {
      setHasConsent(true)
      return true
    }
    const savedConsent = window.localStorage.getItem('gdpr-consent')
    const hasSavedConsent = Boolean(savedConsent)
    setHasConsent(hasSavedConsent)
    return hasSavedConsent
  }, [])

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
        ) : authEnabled && !user && resolvedViewMode !== 'introduction' ? (
          <AuthView onSignUpSuccess={maybeOpenConsentModal} />
        ) : resolvedViewMode === 'introduction' ? (
          <Introduction />
        ) : resolvedViewMode === 'admin' ? (
          <AdminPanel isAdmin={isAdmin} />
        ) : resolvedViewMode === 'settings' ? (
          <Settings onEditConsent={openConsentModal} />
        ) : resolvedViewMode === 'privacy' ? (
          <PrivacyPolicy />
        ) : resolvedViewMode === 'search' ? (
          <CVSearch onCVSelected={cvId => (window.location.hash = `#edit/${cvId}`)} />
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
