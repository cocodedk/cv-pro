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
import { useHashRouting } from './app_helpers/useHashRouting'
import { useTheme } from './app_helpers/useTheme'
import { useMessage } from './app_helpers/useMessage'
import { BRANDING } from './app_helpers/branding'
import { useAuth } from './contexts/AuthContext'
import './index.css'

function App() {
  const { viewMode, cvId } = useHashRouting()
  const { isDark, setIsDark } = useTheme()
  const { message, showMessage, clearMessage } = useMessage()
  const [, setLoading] = useState(false)
  const { user, loading, role, isActive, signOut } = useAuth()
  const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== 'false'
  const isAuthenticated = !authEnabled || Boolean(user)
  const isAdmin = role === 'admin' && isActive
  const resolvedViewMode = viewMode === 'auth' && isAuthenticated ? 'form' : viewMode

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
        onSignOut={signOut}
      />

      <NotificationModal message={message} onClose={clearMessage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authEnabled && loading ? (
          <div className="text-sm text-gray-500">Checking session...</div>
        ) : authEnabled && !user && resolvedViewMode !== 'introduction' ? (
          <AuthView />
        ) : resolvedViewMode === 'introduction' ? (
          <Introduction />
        ) : resolvedViewMode === 'admin' ? (
          <AdminPanel isAdmin={isAdmin} />
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
        ) : (
          <ProfileManager onSuccess={handleSuccess} onError={handleError} setLoading={setLoading} />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
