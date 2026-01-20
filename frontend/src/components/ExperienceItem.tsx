import { Control, UseFormRegister, FieldErrors, useController } from 'react-hook-form'
import { CVData } from '../types/cv'
import ExperienceProjects from './ExperienceProjects'
import RichTextarea, { stripHtml } from './RichTextarea'
import { useTranslation } from 'react-i18next'

interface ExperienceItemProps {
  control: Control<CVData>
  register: UseFormRegister<CVData>
  index: number
  onRemove: () => void
  errors: FieldErrors<CVData>
  showAiAssist?: boolean
}

export default function ExperienceItem({
  control,
  register,
  index,
  onRemove,
  errors,
  showAiAssist,
}: ExperienceItemProps) {
  const { t } = useTranslation('cv')
  const descriptionError = errors?.experience?.[index]?.description
  const descriptionController = useController({
    control,
    name: `experience.${index}.description` as const,
    rules: {
      validate: (value: string | undefined) => {
        if (!value) return true
        const textLength = stripHtml(value).length
        return textLength <= 300 || t('experience.validation.descriptionMax')
      },
    },
  })

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4 dark:border-gray-800 dark:bg-gray-900/40">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
          {t('experience.item.title', { index: index + 1 })}
        </h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          {t('actions.remove')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`experience-title-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('experience.fields.title.label')}
          </label>
          <input
            id={`experience-title-${index}`}
            type="text"
            {...register(`experience.${index}.title` as const, {
              required: t('experience.fields.title.required'),
            })}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            htmlFor={`experience-company-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('experience.fields.company.label')}
          </label>
          <input
            id={`experience-company-${index}`}
            type="text"
            {...register(`experience.${index}.company` as const, {
              required: t('experience.fields.company.required'),
            })}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            htmlFor={`experience-start-date-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('experience.fields.startDate.label')}
          </label>
          <input
            id={`experience-start-date-${index}`}
            type="text"
            {...register(`experience.${index}.start_date` as const, {
              required: t('experience.fields.startDate.required'),
            })}
            placeholder={t('experience.fields.startDate.placeholder')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            htmlFor={`experience-end-date-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('experience.fields.endDate.label')}
          </label>
          <input
            id={`experience-end-date-${index}`}
            type="text"
            {...register(`experience.${index}.end_date` as const)}
            placeholder={t('experience.fields.endDate.placeholder')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            htmlFor={`experience-location-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('experience.fields.location.label')}
          </label>
          <input
            id={`experience-location-${index}`}
            type="text"
            {...register(`experience.${index}.location` as const)}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>
      </div>

      <div>
        <label
          id={`experience-description-${index}-label`}
          htmlFor={`experience-description-${index}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('experience.fields.summary.label')}
        </label>
        <RichTextarea
          id={`experience-description-${index}`}
          value={descriptionController.field.value || ''}
          onChange={descriptionController.field.onChange}
          rows={10}
          placeholder={t('experience.fields.summary.placeholder')}
          error={descriptionError}
          maxLength={300}
          className="mt-1"
          showAiAssist={showAiAssist}
        />
      </div>

      <ExperienceProjects
        control={control}
        register={register}
        experienceIndex={index}
        showAiAssist={showAiAssist}
      />
    </div>
  )
}
