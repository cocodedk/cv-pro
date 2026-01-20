import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { normalizeLanguage } from '../i18n'

const languageOptions = [
  { code: 'da-DK', label: 'Dansk' },
  { code: 'en-GB', label: 'English' },
]

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('navigation')
  const currentLanguage = normalizeLanguage(i18n.language)

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = normalizeLanguage(event.target.value)
    void i18n.changeLanguage(nextLanguage)
  }

  return (
    <div className="flex items-center">
      <label className="sr-only" htmlFor="language-switcher">
        {t('language')}
      </label>
      <select
        id="language-switcher"
        data-testid="language-switcher"
        value={currentLanguage}
        onChange={handleChange}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600"
        aria-label={t('language')}
      >
        {languageOptions.map(option => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
