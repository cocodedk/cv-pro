import { useState } from 'react'
import { AIGenerateCVResponse } from '../../types/ai'
import { useTranslation } from 'react-i18next'

interface AiGeneratePanelsProps {
  result: AIGenerateCVResponse
  isGenerating?: boolean
  onRegenerateWithAnswers?: (answers: string) => void
}

export default function AiGeneratePanels({
  result,
  isGenerating,
  onRegenerateWithAnswers,
}: AiGeneratePanelsProps) {
  const { t } = useTranslation('ai')
  const [answers, setAnswers] = useState('')

  const hasQuestions = result.questions.length > 0
  const canRegenerate = hasQuestions && answers.trim().length > 0 && onRegenerateWithAnswers

  return (
    <div className="space-y-4">
      {result.summary.length ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
          <div className="mb-2 font-medium">{t('panels.summary')}</div>
          <ul className="list-disc space-y-1 pl-5">
            {result.summary.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasQuestions ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="mb-2 font-medium">{t('panels.questions')}</div>
          <ul className="list-disc space-y-1 pl-5">
            {result.questions.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>

          {onRegenerateWithAnswers && (
            <div className="mt-3 space-y-2">
              <textarea
                value={answers}
                onChange={e => setAnswers(e.target.value)}
                className="w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-amber-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder={t('panels.answersPlaceholder')}
                rows={2}
                disabled={isGenerating}
              />
              <button
                type="button"
                onClick={() => onRegenerateWithAnswers(answers)}
                disabled={!canRegenerate || isGenerating}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? t('actions.regenerating') : t('actions.regenerateWithContext')}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
