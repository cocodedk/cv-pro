import { AIGenerateCVRequest, AIGenerateStyle } from '../../types/ai'
import { useTranslation } from 'react-i18next'

interface AiGenerateFieldsProps {
  payload: AIGenerateCVRequest
  isGenerating: boolean
  canGenerate: boolean
  onChange: <K extends keyof AIGenerateCVRequest>(key: K, value: AIGenerateCVRequest[K]) => void
}

export default function AiGenerateFields({
  payload,
  isGenerating,
  canGenerate,
  onChange,
}: AiGenerateFieldsProps) {
  const { t } = useTranslation('ai')

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="ai_target_role"
        >
          {t('fields.targetRole.label')}
        </label>
        <input
          id="ai_target_role"
          value={payload.target_role || ''}
          onChange={e => onChange('target_role', e.target.value || undefined)}
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t('fields.targetRole.placeholder')}
          disabled={isGenerating}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="ai_seniority"
          >
            {t('fields.seniority.label')}
          </label>
          <input
            id="ai_seniority"
            value={payload.seniority || ''}
            onChange={e => onChange('seniority', e.target.value || undefined)}
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            placeholder={t('fields.seniority.placeholder')}
            disabled={isGenerating}
          />
        </div>
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="ai_style"
          >
            {t('fields.style.label')}
          </label>
          <select
            id="ai_style"
            value={payload.style || 'select_and_reorder'}
            onChange={e => onChange('style', e.target.value as AIGenerateStyle)}
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            disabled={isGenerating}
          >
            <option value="select_and_reorder">{t('fields.style.options.selectReorder')}</option>
            <option value="rewrite_bullets">{t('fields.style.options.rewriteBullets')}</option>
            <option value="llm_tailor">{t('fields.style.options.llmTailor')}</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="ai_max_exp"
          >
            {t('fields.maxExperiences.label')}
          </label>
          <input
            id="ai_max_exp"
            type="number"
            min={1}
            max={10}
            value={payload.max_experiences || 4}
            onChange={e => onChange('max_experiences', Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            disabled={isGenerating}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="ai_jd">
          {t('fields.jobDescription.label')}
        </label>
        <textarea
          id="ai_jd"
          value={payload.job_description}
          onChange={e => onChange('job_description', e.target.value)}
          className="min-h-[180px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t('fields.jobDescription.placeholder')}
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('fields.jobDescription.minLength')}{' '}
          {canGenerate ? t('fields.jobDescription.ready') : t('fields.jobDescription.keepPasting')}
        </p>
      </div>

      {payload.style === 'llm_tailor' && (
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="ai_additional_context"
          >
            {t('fields.additionalContext.label')}
          </label>
          <textarea
            id="ai_additional_context"
            value={payload.additional_context || ''}
            onChange={e => onChange('additional_context', e.target.value || undefined)}
            className="min-h-[60px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            placeholder={t('fields.additionalContext.placeholder')}
            disabled={isGenerating}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('fields.additionalContext.helper')}
          </p>
        </div>
      )}
    </div>
  )
}
