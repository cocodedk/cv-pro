import { useState } from 'react'
import { UseFormReset } from 'react-hook-form'
import axios from 'axios'
import { CVData, ProfileData } from '../../types/cv'
import { getErrorDetail, getErrorMessage, getErrorResponse } from '../axiosError'

interface UseProfileManagerProps {
  reset: UseFormReset<CVData>
  onSuccess: (message: string) => void
  onError: (message: string) => void
  setLoading: (loading: boolean) => void
}

export function useProfileManager({
  reset,
  onSuccess,
  onError,
  setLoading,
}: UseProfileManagerProps) {
  const [showProfileLoader, setShowProfileLoader] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [selectedExperiences, setSelectedExperiences] = useState<Set<number>>(new Set())
  const [selectedEducations, setSelectedEducations] = useState<Set<number>>(new Set())

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await axios.get<ProfileData | null>('/api/profile')
      const profile = response.data
      if (profile) {
        setProfileData(profile)
        setShowProfileLoader(true)
        const expIndices = new Set<number>(profile.experience.map((_item, i) => i))
        const eduIndices = new Set<number>(profile.education.map((_item, i) => i))
        setSelectedExperiences(expIndices)
        setSelectedEducations(eduIndices)
      } else {
        onError('No profile found. Please save a profile first.')
      }
    } catch (error: unknown) {
      const { status, data } = getErrorResponse(error)
      if (status === 404) {
        onError('No profile found. Please save a profile first.')
      } else {
        onError(getErrorDetail(data) || 'Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const applySelectedProfile = () => {
    if (!profileData) return

    const selectedExp = profileData.experience.filter((_, i) => selectedExperiences.has(i))
    const selectedEdu = profileData.education.filter((_, i) => selectedEducations.has(i))

    reset({
      personal_info: profileData.personal_info,
      experience: selectedExp,
      education: selectedEdu,
      skills: profileData.skills,
      theme: 'classic',
    })

    setShowProfileLoader(false)
    setProfileData(null)
    setSelectedExperiences(new Set())
    setSelectedEducations(new Set())
    onSuccess('Profile data loaded successfully!')
  }

  const saveToProfile = async (data: CVData) => {
    setLoading(true)
    try {
      const profileData: ProfileData = {
        personal_info: data.personal_info,
        experience: data.experience,
        education: data.education,
        skills: data.skills,
      }
      await axios.post('/api/profile', profileData)
      onSuccess('Current form data saved to profile!')
    } catch (error: unknown) {
      onError(getErrorMessage(error, 'Failed to save to profile'))
    } finally {
      setLoading(false)
    }
  }

  const closeProfileLoader = () => {
    setShowProfileLoader(false)
    setProfileData(null)
    setSelectedExperiences(new Set())
    setSelectedEducations(new Set())
  }

  const handleExperienceToggle = (index: number, checked: boolean) => {
    const newSet = new Set(selectedExperiences)
    if (checked) {
      newSet.add(index)
    } else {
      newSet.delete(index)
    }
    setSelectedExperiences(newSet)
  }

  const handleEducationToggle = (index: number, checked: boolean) => {
    const newSet = new Set(selectedEducations)
    if (checked) {
      newSet.add(index)
    } else {
      newSet.delete(index)
    }
    setSelectedEducations(newSet)
  }

  return {
    showProfileLoader,
    profileData,
    selectedExperiences,
    selectedEducations,
    loadProfile,
    applySelectedProfile,
    saveToProfile,
    closeProfileLoader,
    handleExperienceToggle,
    handleEducationToggle,
  }
}
