/** GDPR-compliant CV search component */
import React, { useState, useEffect } from 'react'
import {
  SearchFilters,
  SearchResult,
  searchCVs,
  getSearchSuggestions,
} from '../services/searchService'

interface CVSearchProps {
  onResultsFound?: (results: SearchResult[]) => void
  onCVSelected?: (cvId: string) => void
  className?: string
}

const CVSearch: React.FC<CVSearchProps> = ({ onResultsFound, onCVSelected, className = '' }) => {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<{
    popular_skills: string[]
    popular_roles: string[]
    popular_locations: string[]
  }>({
    popular_skills: [],
    popular_roles: [],
    popular_locations: [],
  })

  // Load search suggestions on component mount
  useEffect(() => {
    getSearchSuggestions().then(setSuggestions).catch(console.error)
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await searchCVs(filters)
      setResults(response.results)
      onResultsFound?.(response.results)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const addSkill = (skill: string) => {
    const currentSkills = filters.skills || []
    if (!currentSkills.includes(skill)) {
      handleFilterChange('skills', [...currentSkills, skill])
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = filters.skills || []
    handleFilterChange(
      'skills',
      currentSkills.filter(skill => skill !== skillToRemove)
    )
  }

  const clearFilters = () => {
    setFilters({})
    setResults([])
  }

  const hasActiveFilters = Object.values(filters).some(value =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  )

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Search Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Search CVs</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Find CVs by name, role, location, or skills. Search is privacy-safe and GDPR-compliant.
        </p>
      </div>

      {/* Search Filters */}
      <div className="p-6 space-y-4">
        {/* Person Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Person Name
          </label>
          <input
            type="text"
            value={filters.person_name || ''}
            onChange={e => handleFilterChange('person_name', e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Target Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Role
          </label>
          <input
            type="text"
            value={filters.target_role || ''}
            onChange={e => handleFilterChange('target_role', e.target.value)}
            placeholder="e.g. Software Engineer"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location || ''}
            onChange={e => handleFilterChange('location', e.target.value)}
            placeholder="e.g. Copenhagen"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skills
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(filters.skills || []).map(skill => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add a skill..."
            onKeyPress={e => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement
                if (input.value.trim()) {
                  addSkill(input.value.trim())
                  input.value = ''
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {suggestions.popular_skills.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Popular skills:</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.popular_skills.slice(0, 8).map(skill => (
                  <button
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleSearch}
            disabled={loading || !hasActiveFilters}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Search Results ({results.length})
            </h3>
            <div className="space-y-4">
              {results.map(result => (
                <div
                  key={result.cv_id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => onCVSelected?.(result.cv_id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {result.person_name || 'Anonymous'}
                      </h4>
                      {result.target_role && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {result.target_role}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      {new Date(result.last_updated).toLocaleDateString()}
                    </div>
                  </div>

                  {result.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      📍 {result.location}
                    </p>
                  )}

                  {result.skills && result.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {result.skills.slice(0, 5).map(skill => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {result.skills.length > 5 && (
                        <span className="text-xs px-2 py-1 text-gray-500">
                          +{result.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {result.company_names && result.company_names.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      💼 Experience: {result.company_names.slice(0, 2).join(', ')}
                      {result.company_names.length > 2 &&
                        ` +${result.company_names.length - 2} more`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {hasActiveFilters && !loading && results.length === 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
          No CVs found matching your criteria. Try adjusting your search terms.
        </div>
      )}

      {/* Privacy Notice */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          🔒 Search is privacy-safe: Only non-sensitive metadata is searchable. Full CV details
          remain encrypted and protected.
        </p>
      </div>
    </div>
  )
}

export default CVSearch
