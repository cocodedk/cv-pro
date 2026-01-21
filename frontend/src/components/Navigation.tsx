import { useState, useEffect, useRef } from 'react'
import { ViewMode } from '../app_helpers/types'
import { BRANDING } from '../app_helpers/branding'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import type { User } from '@supabase/supabase-js'

interface NavigationProps {
  viewMode: ViewMode
  isDark: boolean
  onThemeToggle: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  user: User | null
  onSignOut: () => void
}

export default function Navigation({
  viewMode,
  isDark,
  onThemeToggle,
  isAuthenticated,
  isAdmin,
  user,
  onSignOut,
}: NavigationProps) {
  const { t } = useTranslation('navigation')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-900 dark:border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {BRANDING.appName}
                </h1>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                window.location.hash = 'introduction'
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'introduction'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {t('introduction')}
            </button>
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  window.location.hash = 'auth'
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'auth'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {t('signIn')}
              </button>
            ) : null}
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    window.location.hash = 'form'
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'form' || viewMode === 'edit'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {viewMode === 'edit' ? t('editCv') : t('createCv')}
                </button>
                <button
                  onClick={() => {
                    window.location.hash = 'list'
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('myCvs')}
                </button>
                <button
                  onClick={() => {
                    window.location.hash = 'search'
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'search'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('searchCvs')}
                </button>
                <button
                  onClick={() => {
                    window.location.hash = 'profile-list'
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'profile-list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('myProfiles')}
                </button>
                <button
                  onClick={() => {
                    window.location.hash = 'profile'
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'profile' || viewMode === 'profile-edit'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('profile')}
                </button>
                {isAdmin ? (
                  <button
                    onClick={() => {
                      window.location.hash = 'admin'
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      viewMode === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t('admin')}
                  </button>
                ) : null}
                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <span className="mr-2">
                      {user?.user_metadata?.full_name || user?.email || t('user')}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          {user?.email}
                        </div>
                        <button
                          onClick={() => {
                            window.location.hash = 'settings'
                            setIsUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {t('settings')}
                        </button>
                        <button
                          onClick={() => {
                            onThemeToggle()
                            setIsUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          {isDark ? t('lightMode') : t('darkMode')}
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <div className="px-4 py-2">
                          <LanguageSwitcher />
                        </div>
                        <button
                          onClick={() => {
                            onSignOut()
                            setIsUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          {t('signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}
