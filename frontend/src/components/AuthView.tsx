import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../config/supabase'

type AuthMode = 'sign-in' | 'sign-up'

interface AuthViewProps {
  onSignUpSuccess?: () => void
}

export default function AuthView({ onSignUpSuccess }: AuthViewProps) {
  const { t } = useTranslation('auth')
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')
    setError(null)
    setMessage(null)

    try {
      if (mode === 'sign-in') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) {
          setError(signInError.message)
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) {
          setError(signUpError.message)
        } else {
          setMessage(t('messages.confirmEmail'))
          onSignUpSuccess?.()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unexpected'))
      console.error(err)
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {mode === 'sign-in' ? t('titles.signIn') : t('titles.signUp')}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {mode === 'sign-in' ? t('subtitles.signIn') : t('subtitles.signUp')}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('fields.email')}
          <input
            type="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('fields.password')}
          <input
            type="password"
            required
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-600">{message}</p> : null}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-md bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {status === 'loading'
            ? t('actions.loading')
            : mode === 'sign-in'
              ? t('actions.signIn')
              : t('actions.signUp')}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {mode === 'sign-in' ? t('footer.noAccount') : t('footer.hasAccount')}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
            setError(null)
            setMessage(null)
          }}
          className="ml-2 text-blue-600 hover:text-blue-700"
        >
          {mode === 'sign-in' ? t('actions.signUp') : t('actions.signIn')}
        </button>
      </div>
    </div>
  )
}
