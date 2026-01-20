import type { DailyStat, ThemeStat } from './types'
import { useTranslation } from 'react-i18next'

interface AdminStatsProps {
  stats: DailyStat[]
  themes: ThemeStat[]
}

export default function AdminStats({ stats, themes }: AdminStatsProps) {
  const { t } = useTranslation('admin')

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('stats.daily.title')}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.slice(0, 6).map(stat => (
            <div
              key={stat.date}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.date}</p>
              <p className="text-sm">
                {t('stats.daily.activeUsers', { count: stat.active_users })}
              </p>
              <p className="text-sm">{t('stats.daily.cvsCreated', { count: stat.cvs_created })}</p>
              <p className="text-sm">{t('stats.daily.themedCvs', { count: stat.themed_cvs })}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('stats.themes.title')}
        </h2>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {themes.map(theme => (
              <li key={theme.theme} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-gray-700 dark:text-gray-200">{theme.theme}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('stats.themes.usage', {
                    uses: theme.usage_count,
                    users: theme.unique_users,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
