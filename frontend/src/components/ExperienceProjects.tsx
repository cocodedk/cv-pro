import { Control, UseFormRegister, useFieldArray } from 'react-hook-form'
import { CVData } from '../types/cv'
import ProjectEditor from './ProjectEditor'
import { useTranslation } from 'react-i18next'

interface ExperienceProjectsProps {
  control: Control<CVData>
  register: UseFormRegister<CVData>
  experienceIndex: number
  showAiAssist?: boolean
}

export default function ExperienceProjects({
  control,
  register,
  experienceIndex,
  showAiAssist,
}: ExperienceProjectsProps) {
  const { t } = useTranslation('cv')
  const { fields, append, remove } = useFieldArray({
    control,
    name: `experience.${experienceIndex}.projects` as const,
  })

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('experience.projects.title')}
        </h5>
        <button
          type="button"
          onClick={() =>
            append({
              name: '',
              description: '',
              url: '',
              technologies: [],
              highlights: [],
            })
          }
          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('experience.projects.add')}
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('experience.projects.empty')}</p>
      )}

      {fields.map((projectField, projectIndex) => (
        <ProjectEditor
          key={projectField.id}
          control={control}
          register={register}
          experienceIndex={experienceIndex}
          projectIndex={projectIndex}
          onRemove={() => remove(projectIndex)}
          showAiAssist={showAiAssist}
        />
      ))}
    </div>
  )
}
