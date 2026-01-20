import { useState, useEffect, useRef, useCallback } from 'react'
import { listProfiles, deleteProfileByUpdatedAt } from '../services/profileService'
import { ProfileListItem } from '../types/cv'
import { getErrorMessage } from '../app_helpers/axiosError'
import { useTranslation } from 'react-i18next'

interface ProfileListProps {
  onError: (message: string) => void
}

export default function ProfileList({ onError }: ProfileListProps) {
  const { t, i18n } = useTranslation('profile')
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const searchRef = useRef(search)

  // Keep search ref in sync
  useEffect(() => {
    searchRef.current = search
  }, [search])

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const response = await listProfiles()
      let filteredProfiles = response.profiles
      const currentSearch = searchRef.current.trim()
      if (currentSearch) {
        const searchLower = currentSearch.toLowerCase()
        filteredProfiles = response.profiles.filter(p => p.name.toLowerCase().includes(searchLower))
      }
      setProfiles(filteredProfiles)
    } catch (error: unknown) {
      onError(getErrorMessage(error, t('profileList.errors.loadFailed')))
    } finally {
      setLoading(false)
    }
  }, [onError, t])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  // Refresh list when navigating back from edit mode
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      // Refresh when navigating to list view
      if (hash === '#profile-list' || hash === '#profiles') {
        // Use current search value from ref to avoid stale closure
        fetchProfiles()
      }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [fetchProfiles])

  const handleSearch = () => {
    fetchProfiles()
  }

  const handleDelete = async (updatedAt: string) => {
    if (!confirm(t('profileList.confirmDelete'))) {
      return
    }
    try {
      await deleteProfileByUpdatedAt(updatedAt)
      fetchProfiles()
    } catch (error: unknown) {
      onError(getErrorMessage(error, t('profileList.errors.deleteFailed')))
    }
  }

  const handleEdit = (updatedAt: string) => {
    window.location.hash = `#profile-edit/${encodeURIComponent(updatedAt)}`
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="bg-white shadow rounded-lg dark:bg-gray-900 dark:border dark:border-gray-800">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('profileList.title', { count: profiles.length })}
          </h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('profileList.search.placeholder')}
              className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500"
            >
              {t('profileList.search.action')}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">{t('profileList.loading')}</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {search ? t('profileList.empty.search') : t('profileList.empty.default')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map(profile => (
              <div
                key={profile.updated_at}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                      {t('profileList.updated', { date: formatDate(profile.updated_at) })}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(profile.updated_at)}
                      className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      {t('actions.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(profile.updated_at)}
                      className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {t('actions.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
