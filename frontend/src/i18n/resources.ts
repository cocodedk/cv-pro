import type { Resource } from 'i18next'

type LocaleModule = { default: Record<string, unknown> }

const localeModules = import.meta.glob('../locales/*/*.json', { eager: true }) as Record<
  string,
  LocaleModule
>

const resources: Resource = {}
const namespacesSet = new Set<string>()
const supportedLngsSet = new Set<string>()

for (const [path, module] of Object.entries(localeModules)) {
  const match = path.match(/..\/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!match) continue
  const [, locale, namespace] = match
  supportedLngsSet.add(locale)
  namespacesSet.add(namespace)
  if (!resources[locale]) {
    resources[locale] = {}
  }
  resources[locale]![namespace] = module.default
}

export const namespaces = Array.from(namespacesSet)
export const supportedLngs = Array.from(supportedLngsSet)
export { resources }
