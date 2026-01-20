import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { namespaces, resources, supportedLngs } from './resources'

const normalizeLanguage = (language: string): string => {
  const normalized = language.toLowerCase()
  if (normalized.startsWith('da')) return 'da-DK'
  if (normalized.startsWith('en')) return 'en-GB'
  return 'en-GB'
}

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'en-GB'
  const stored = window.localStorage.getItem('cv-pro-language')
  if (stored) return normalizeLanguage(stored)
  const navigatorLanguage = window.navigator?.language || ''
  return normalizeLanguage(navigatorLanguage)
}

const setDocumentLanguage = (language: string) => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en-GB',
  supportedLngs,
  defaultNS: 'common',
  ns: namespaces,
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
  returnNull: false,
  returnEmptyString: false,
  react: {
    useSuspense: false,
  },
})

if (typeof window !== 'undefined') {
  setDocumentLanguage(i18n.language)
  i18n.on('languageChanged', language => {
    window.localStorage.setItem('cv-pro-language', language)
    setDocumentLanguage(language)
  })
}

export default i18n
export { normalizeLanguage }
