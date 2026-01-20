import { CoverLetterRequest } from '../../types/coverLetter'
import { useTranslation } from 'react-i18next'

interface RecipientFieldsProps {
  payload: CoverLetterRequest
  isGenerating: boolean
  onChange: <K extends keyof CoverLetterRequest>(key: K, value: CoverLetterRequest[K]) => void
}

export default function RecipientFields({ payload, isGenerating, onChange }: RecipientFieldsProps) {
  const { t } = useTranslation('coverLetter')

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="cl_company_name"
        >
          {t('recipient.companyName.label')}
        </label>
        <input
          id="cl_company_name"
          value={payload.company_name}
          onChange={e => onChange('company_name', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t('recipient.companyName.placeholder')}
          disabled={isGenerating}
          required
        />
      </div>

      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="cl_hiring_manager"
        >
          {t('recipient.hiringManager.label')}
        </label>
        <input
          id="cl_hiring_manager"
          value={payload.hiring_manager_name || ''}
          onChange={e => onChange('hiring_manager_name', e.target.value || undefined)}
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t('recipient.hiringManager.placeholder')}
          disabled={isGenerating}
        />
      </div>

      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="cl_company_address"
        >
          {t('recipient.companyAddress.label')}
        </label>
        <textarea
          id="cl_company_address"
          value={payload.company_address || ''}
          onChange={e => onChange('company_address', e.target.value || undefined)}
          className="min-h-[80px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t('recipient.companyAddress.placeholder')}
          disabled={isGenerating}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="cl_tone">
          {t('recipient.tone.label')}
        </label>
        <select
          id="cl_tone"
          value={payload.tone}
          onChange={e => onChange('tone', e.target.value as CoverLetterRequest['tone'])}
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          disabled={isGenerating}
        >
          <option value="professional">{t('recipient.tone.options.professional')}</option>
          <option value="enthusiastic">{t('recipient.tone.options.enthusiastic')}</option>
          <option value="conversational">{t('recipient.tone.options.conversational')}</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="cl_llm_instructions"
        >
          {t('recipient.instructions.label')}
        </label>
        <textarea
          id="cl_llm_instructions"
          value={payload.llm_instructions || ''}
          onChange={e => onChange('llm_instructions', e.target.value || undefined)}
          className="min-h-[80px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t('recipient.instructions.placeholder')}
          disabled={isGenerating}
        />
      </div>

      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="cl_job_description"
        >
          {t('recipient.jobDescription.label')}
        </label>
        <textarea
          id="cl_job_description"
          value={payload.job_description}
          onChange={e => onChange('job_description', e.target.value)}
          className="min-h-[180px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t('recipient.jobDescription.placeholder')}
          disabled={isGenerating}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('recipient.jobDescription.minLength')}
        </p>
      </div>
    </div>
  )
}
