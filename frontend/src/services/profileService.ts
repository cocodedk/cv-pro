/** Profile API service for managing profile operations. */
import axios from 'axios'
import { ProfileData, ProfileResponse, ProfileListResponse } from '../types/cv'
import { normalizeProfileDataForApi } from '../app_helpers/cvForm/normalizeCvData'
import { getErrorDetail, getErrorMessage, getErrorResponse } from '../app_helpers/axiosError'
import i18n from '../i18n'

/**
 * Get the master profile from the server.
 * @returns Profile data or null if not found
 * @throws Error if request fails
 */
export async function getProfile(): Promise<ProfileData | null> {
  try {
    const response = await axios.get<ProfileData>('/api/profile')
    return response.data || null
  } catch (error: unknown) {
    const { status, data } = getErrorResponse(error)
    if (status === 404) {
      return null
    }
    throw new Error(getErrorDetail(data) || i18n.t('profile:errors.loadFailedPlain'))
  }
}

/**
 * Save or update the master profile.
 * @param profileData - Profile data to save
 * @returns Success response
 * @throws Error if save fails
 */
export async function saveProfile(profileData: ProfileData): Promise<ProfileResponse> {
  try {
    const payload = normalizeProfileDataForApi(profileData)
    const response = await axios.post<ProfileResponse>('/api/profile', payload)
    return response.data
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, i18n.t('profile:errors.saveFailed')))
  }
}

/**
 * Delete the master profile.
 * @returns Success response
 * @throws Error if delete fails
 */
export async function deleteProfile(): Promise<ProfileResponse> {
  try {
    const response = await axios.delete<ProfileResponse>('/api/profile', {
      headers: { 'X-Confirm-Delete-Profile': 'true' },
    })
    return response.data
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, i18n.t('profile:errors.deleteFailed')))
  }
}

/**
 * List all profiles with basic info.
 * @returns List of profiles with name and updated_at
 * @throws Error if request fails
 */
export async function listProfiles(): Promise<ProfileListResponse> {
  try {
    const response = await axios.get<ProfileListResponse>('/api/profiles')
    return response.data
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, i18n.t('profile:errors.listFailed')))
  }
}

/**
 * Get a specific profile by its updated_at timestamp.
 * @param updatedAt - ISO timestamp string identifying the profile
 * @returns Profile data or null if not found
 * @throws Error if request fails
 */
export async function getProfileByUpdatedAt(updatedAt: string): Promise<ProfileData | null> {
  try {
    const response = await axios.get<ProfileData>(`/api/profile/${encodeURIComponent(updatedAt)}`)
    return response.data || null
  } catch (error: unknown) {
    const { status, data } = getErrorResponse(error)
    if (status === 404) {
      return null
    }
    throw new Error(getErrorDetail(data) || i18n.t('profile:errors.loadFailedPlain'))
  }
}

/**
 * Delete a specific profile by its updated_at timestamp.
 * @param updatedAt - ISO timestamp string identifying the profile
 * @returns Success response
 * @throws Error if delete fails
 */
export async function deleteProfileByUpdatedAt(updatedAt: string): Promise<ProfileResponse> {
  try {
    const response = await axios.delete<ProfileResponse>(
      `/api/profile/${encodeURIComponent(updatedAt)}`,
      { headers: { 'X-Confirm-Delete-Profile': 'true' } }
    )
    return response.data
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, i18n.t('profile:errors.deleteFailed')))
  }
}
