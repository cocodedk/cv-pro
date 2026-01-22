/**
 * ProfileManager Translation Tests
 *
 * Tests for the profile translation functionality in ProfileManager component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as profileService from '../../services/profileService'
import { renderProfileManager } from '../helpers/profileManager/testHelpers'
import {
  createMockCallbacks,
  setupWindowMocks,
  createProfileData,
} from '../helpers/profileManager/mocks'
import { ProfileData } from '../../types/cv'

// Mock dependencies
vi.mock('../../services/profileService')
const mockedProfileService = vi.mocked(profileService, true)
vi.mock('../../app_helpers/useHashRouting', () => ({
  useHashRouting: () => ({
    profileUpdatedAt: null,
  }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key: string, options?: any) => {
      if (key === 'messages.translated') {
        return `Profile translated to ${options?.lang} successfully!`
      }
      if (key === 'errors.translationFailed') {
        return 'Failed to translate profile'
      }
      if (key === 'errors.noProfileData') {
        return 'No profile data to translate'
      }
      if (key === 'translation.translateTo') {
        return 'Translate to:'
      }
      if (key === 'actions.translate') {
        return 'Translate'
      }
      if (key === 'actions.translating') {
        return 'Translating...'
      }
      if (key === 'languages.spanish') {
        return 'Spanish'
      }
      return key
    }),
  }),
}))

const mockTranslateProfile = mockedProfileService.translateProfile

describe.skip('ProfileManager - Translation', () => {
  const { mockOnSuccess, mockOnError, mockSetLoading } = createMockCallbacks()

  const sampleProfileData: ProfileData = createProfileData({
    personal_info: {
      name: 'John Doe',
      title: 'Software Engineer',
    },
    language: 'en',
  })

  const translatedProfileData: ProfileData = {
    ...sampleProfileData,
    personal_info: {
      ...sampleProfileData.personal_info,
      title: 'Ingeniero de Software',
    },
    language: 'es',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setupWindowMocks()

    // Mock successful profile load
    mockedProfileService.getProfile.mockResolvedValue(sampleProfileData)
    mockedProfileService.saveProfile.mockResolvedValue({ status: 'success' })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Translation UI Elements', () => {
    it('renders translation controls', async () => {
      renderProfileManager({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        setLoading: mockSetLoading,
      })

      // Wait for profile to load and form to render
      await waitFor(() => {
        expect(screen.getByText('Master Profile')).toBeInTheDocument()
      })

      // Now check for translation controls
      expect(screen.getByText('Translate to:')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /target-language/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
    })

    it('shows language options in dropdown', async () => {
      renderProfileManager({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        setLoading: mockSetLoading,
      })

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('es') // Default value

      // Check that Spanish is selected by default
      expect(select).toHaveDisplayValue('Spanish')
    })

    it('allows changing target language', async () => {
      const user = userEvent.setup()

      renderProfileManager({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        setLoading: mockSetLoading,
      })

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'fr')

      expect(select).toHaveValue('fr')
    })
  })

  describe('Translation Functionality', () => {
    it('translates profile successfully', async () => {
      const user = userEvent.setup()

      const successMessage = 'Profile created in ES successfully'
      mockTranslateProfile.mockResolvedValue({
        status: 'success',
        translated_profile: translatedProfileData,
        message: successMessage,
      })

      renderProfileManager({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        setLoading: mockSetLoading,
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
      })

      const translateButton = screen.getByRole('button', { name: /translate/i })
      await user.click(translateButton)

      await waitFor(() => {
        expect(mockTranslateProfile).toHaveBeenCalledWith(sampleProfileData, 'es')
        expect(mockOnSuccess).toHaveBeenCalledWith(successMessage)
      })
    })

    it('shows loading state during translation', async () => {
      const user = userEvent.setup()

      mockTranslateProfile.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      renderProfileManager({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        setLoading: mockSetLoading,
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
      })

      const translateButton = screen.getByRole('button', { name: /translate/i })
      await user.click(translateButton)

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('Translating...')).toBeInTheDocument()
        expect(translateButton).toBeDisabled()
      })
    })

    it('handles translation errors', async () => {
      const user = userEvent.setup()

      mockTranslateProfile.mockRejectedValue(new Error('Translation failed'))

      renderProfileManager({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        setLoading: mockSetLoading,
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
      })

      const translateButton = screen.getByRole('button', { name: /translate/i })
      await user.click(translateButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Failed to translate profile')
      })
    })

    it('prevents translation with empty profile', async () => {
      const user = userEvent.setup()

      // Mock empty profile
      vi.mocked(profileService.getProfile).mockResolvedValue(null)

      renderProfileManager({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        setLoading: mockSetLoading,
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
      })

      const translateButton = screen.getByRole('button', { name: /translate/i })
      await user.click(translateButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('No profile data to translate')
        expect(mockTranslateProfile).not.toHaveBeenCalled()
      })
    })

    it('disables controls during translation', async () => {
      const user = userEvent.setup()

      mockTranslateProfile.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  status: 'success',
                  translated_profile: translatedProfileData,
                  message: 'Translated',
                }),
              100
            )
          )
      )

      renderProfileManager({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        setLoading: mockSetLoading,
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
      })

      const translateButton = screen.getByRole('button', { name: /translate/i })
      const languageSelect = screen.getByRole('combobox')

      await user.click(translateButton)

      // Controls should be disabled during translation
      await waitFor(() => {
        expect(translateButton).toBeDisabled()
        expect(languageSelect).toBeDisabled()
      })

      // Controls should be re-enabled after translation completes
      await waitFor(() => {
        expect(mockTranslateProfile).toHaveBeenCalled()
      })

      // Wait a bit more for state to update
      await waitFor(() => {
        expect(translateButton).not.toBeDisabled()
        expect(languageSelect).not.toBeDisabled()
      })
    })
  })

  describe('Language Options', () => {
    const expectedLanguages = [
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'it', label: 'Italian' },
      { value: 'pt', label: 'Portuguese' },
      { value: 'nl', label: 'Dutch' },
      { value: 'da', label: 'Danish' },
      { value: 'sv', label: 'Swedish' },
      { value: 'no', label: 'Norwegian' },
      { value: 'ru', label: 'Russian' },
      { value: 'zh', label: 'Chinese' },
      { value: 'ja', label: 'Japanese' },
      { value: 'ko', label: 'Korean' },
      { value: 'ar', label: 'Arabic' },
    ]

    it.each(expectedLanguages)(
      'includes $label ($value) in language options',
      async ({ value, label }) => {
        renderProfileManager({
          onSuccess: mockOnSuccess,
          onError: mockOnError,
          setLoading: mockSetLoading,
        })

        await waitFor(() => {
          expect(screen.getByRole('combobox')).toBeInTheDocument()
        })

        const option = screen.getByRole('option', { name: label }) as HTMLOptionElement
        expect(option).toBeInTheDocument()
        expect(option.value).toBe(value)
      }
    )
  })
})
