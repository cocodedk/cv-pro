import { CVData } from '../../types/cv'
import {
  UseFormRegister,
  Control,
  UseFormHandleSubmit,
  UseFormReset,
  FieldErrors,
} from 'react-hook-form'
import PersonalInfo from '../../components/PersonalInfo'
import Experience from '../../components/Experience'
import Education from '../../components/Education'
import Skills from '../../components/Skills'
import CvFormHeader from '../../components/CvFormHeader'
import { useTranslation } from 'react-i18next'

interface CVFormContentProps {
  isEditMode: boolean
  isSubmitting: boolean
  register: UseFormRegister<CVData>
  control: Control<CVData>
  errors: FieldErrors<CVData>
  handleSubmit: UseFormHandleSubmit<CVData>
  reset: UseFormReset<CVData>
  onSubmit: (data: CVData) => void | Promise<void>
  onLoadProfile: () => void
  onSaveProfile: () => void
  onGenerateFromJd: () => void
  onGenerateCoverLetter?: () => void
  onDownloadPdf?: () => void
  isGeneratingPdf?: boolean
}

/**
 * Component that renders the main CV form content.
 * Includes header, theme selector, and all form sections.
 */
export default function CVFormContent({
  isEditMode,
  isSubmitting,
  register,
  control,
  errors,
  handleSubmit,
  reset,
  onSubmit,
  onLoadProfile,
  onSaveProfile,
  onGenerateFromJd,
  onGenerateCoverLetter,
  onDownloadPdf,
  isGeneratingPdf = false,
}: CVFormContentProps) {
  const { t } = useTranslation('cv')

  return (
    <div className="bg-white shadow rounded-lg dark:bg-gray-900 dark:border dark:border-gray-800">
      <CvFormHeader
        title={isEditMode ? t('titles.edit') : t('titles.create')}
        onLoadProfile={onLoadProfile}
        onSaveProfile={onSaveProfile}
        onGenerateFromJd={onGenerateFromJd}
        onGenerateCoverLetter={onGenerateCoverLetter}
        onDownloadPdf={onDownloadPdf}
        isGeneratingPdf={isGeneratingPdf}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="theme">
              {t('fields.theme.label')}
            </label>
            <select
              id="theme"
              {...register('theme')}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            >
              <option value="accented">{t('fields.theme.options.accented')}</option>
              <option value="classic">{t('fields.theme.options.classic')}</option>
              <option value="colorful">{t('fields.theme.options.colorful')}</option>
              <option value="creative">{t('fields.theme.options.creative')}</option>
              <option value="elegant">{t('fields.theme.options.elegant')}</option>
              <option value="executive">{t('fields.theme.options.executive')}</option>
              <option value="minimal">{t('fields.theme.options.minimal')}</option>
              <option value="modern">{t('fields.theme.options.modern')}</option>
              <option value="professional">{t('fields.theme.options.professional')}</option>
              <option value="tech">{t('fields.theme.options.tech')}</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="layout"
            >
              {t('fields.layout.label')}
            </label>
            <select
              id="layout"
              {...register('layout')}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            >
              <optgroup label={t('fields.layout.groups.printFirst')}>
                <option value="classic-two-column">
                  {t('fields.layout.options.classicTwoColumn')}
                </option>
                <option value="ats-single-column">
                  {t('fields.layout.options.atsSingleColumn')}
                </option>
                <option value="modern-sidebar">{t('fields.layout.options.modernSidebar')}</option>
              </optgroup>
              <optgroup label={t('fields.layout.groups.webFirst')}>
                <option value="section-cards-grid">
                  {t('fields.layout.options.sectionCardsGrid')}
                </option>
                <option value="project-case-studies">
                  {t('fields.layout.options.projectCaseStudies')}
                </option>
                <option value="portfolio-spa">{t('fields.layout.options.portfolioSpa')}</option>
                <option value="dark-mode-tech">{t('fields.layout.options.darkModeTech')}</option>
              </optgroup>
              <optgroup label={t('fields.layout.groups.special')}>
                <option value="career-timeline">{t('fields.layout.options.careerTimeline')}</option>
                <option value="interactive-skills-matrix">
                  {t('fields.layout.options.interactiveSkillsMatrix')}
                </option>
                <option value="academic-cv">{t('fields.layout.options.academicCv')}</option>
              </optgroup>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="target_role"
            >
              {t('fields.targetRole.label')}
            </label>
            <input
              id="target_role"
              {...register('target_role')}
              type="text"
              placeholder={t('fields.targetRole.placeholder')}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            />
          </div>
          <div className="grid gap-2">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="target_company"
            >
              {t('fields.targetCompany.label')}
            </label>
            <input
              id="target_company"
              {...register('target_company')}
              type="text"
              placeholder={t('fields.targetCompany.placeholder')}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            />
          </div>
        </div>
        <PersonalInfo
          register={register}
          errors={errors}
          control={control}
          showAiAssist={isEditMode}
        />
        <Experience
          control={control}
          register={register}
          errors={errors}
          showAiAssist={isEditMode}
        />
        <Education control={control} register={register} />
        <Skills control={control} register={register} />

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-blue-500"
          >
            {isSubmitting
              ? isEditMode
                ? t('actions.updating')
                : t('actions.generating')
              : isEditMode
                ? t('actions.updateCv')
                : t('actions.generateCv')}
          </button>
        </div>
      </form>
    </div>
  )
}
