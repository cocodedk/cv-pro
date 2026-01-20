import { useFieldArray, Control, UseFormRegister } from 'react-hook-form'
import { CVData } from '../types/cv'
import { useTranslation } from 'react-i18next'

interface SkillsProps {
  control: Control<CVData>
  register: UseFormRegister<CVData>
}

export default function Skills({ control, register }: SkillsProps) {
  const { t } = useTranslation('cv')
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  })

  const addSkill = () => {
    append({
      name: '',
      category: '',
      level: '',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('sections.skills')}
        </h3>
        <button
          type="button"
          onClick={addSkill}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('skills.add')}
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('skills.empty')}</p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border border-gray-200 rounded-lg p-4 dark:border-gray-800 dark:bg-gray-900/40"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
              {t('skills.item.title', { index: index + 1 })}
            </h4>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {t('actions.remove')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor={`skill-name-${index}`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('skills.fields.name.label')}
              </label>
              <input
                id={`skill-name-${index}`}
                type="text"
                {...register(`skills.${index}.name` as const, {
                  required: t('skills.fields.name.required'),
                })}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label
                htmlFor={`skill-category-${index}`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('skills.fields.category.label')}
              </label>
              <input
                id={`skill-category-${index}`}
                type="text"
                {...register(`skills.${index}.category` as const)}
                placeholder={t('skills.fields.category.placeholder')}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label
                htmlFor={`skill-level-${index}`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('skills.fields.level.label')}
              </label>
              <input
                id={`skill-level-${index}`}
                type="text"
                {...register(`skills.${index}.level` as const)}
                placeholder={t('skills.fields.level.placeholder')}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={addSkill}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('skills.add')}
        </button>
      </div>
    </div>
  )
}
