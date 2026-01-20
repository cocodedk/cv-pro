/** Search API service for GDPR-compliant CV searching */
import i18n from '../i18n'

export interface SearchFilters {
  person_name?: string
  target_role?: string
  location?: string
  skills?: string[]
}

export interface SearchResult {
  cv_id: string
  person_name?: string
  target_role?: string
  location?: string
  company_names?: string[]
  skills?: string[]
  last_updated: string
  theme?: string
  layout?: string
  target_company?: string
  filename?: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
}

/**
 * Search CVs using metadata fields (GDPR-compliant)
 * @param filters - Search criteria
 * @returns Search results with metadata only
 */
export async function searchCVs(filters: SearchFilters): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams()

    if (filters.person_name) params.append('person_name', filters.person_name)
    if (filters.target_role) params.append('target_role', filters.target_role)
    if (filters.location) params.append('location', filters.location)
    if (filters.skills && filters.skills.length > 0) {
      params.append('skills', filters.skills.join(','))
    }

    const response = await fetch(`/api/search/cvs?${params.toString()}`)

    if (!response.ok) {
      throw new Error(i18n.t('search:errors.searchFailed', { statusText: response.statusText }))
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Search error:', error)
    throw new Error(i18n.t('search:errors.requestFailed'))
  }
}

/**
 * Get popular search terms based on existing CV metadata
 * This helps users discover searchable content
 */
export async function getSearchSuggestions(): Promise<{
  popular_skills: string[]
  popular_roles: string[]
  popular_locations: string[]
}> {
  try {
    // This would be a separate endpoint to get aggregated search suggestions
    // For now, return some example suggestions
    return {
      popular_skills: ['Python', 'React', 'JavaScript', 'SQL', 'Docker', 'AWS'],
      popular_roles: [
        'Software Engineer',
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
      ],
      popular_locations: ['Copenhagen', 'Aarhus', 'Odense', 'Remote'],
    }
  } catch (error) {
    console.error('Failed to get search suggestions:', error)
    return {
      popular_skills: [],
      popular_roles: [],
      popular_locations: [],
    }
  }
}
