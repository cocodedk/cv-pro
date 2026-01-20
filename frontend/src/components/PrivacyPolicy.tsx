/** Privacy Policy component for GDPR compliance */
import React from 'react'
import { useTranslation } from 'react-i18next'

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation('privacy')

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('title')}</h1>

      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.introduction.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('sections.introduction.body')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.dataController.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>{t('sections.dataController.labels.controller')}</strong> CV Pro
            <br />
            <strong>{t('sections.dataController.labels.contact')}</strong> privacy@cocode.dk
            <br />
            <strong>{t('sections.dataController.labels.address')}</strong>{' '}
            {t('sections.dataController.address')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.dataCollected.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('sections.dataCollected.intro')}
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>
              <strong>{t('sections.dataCollected.items.personal.label')}</strong>{' '}
              {t('sections.dataCollected.items.personal.text')}
            </li>
            <li>
              <strong>{t('sections.dataCollected.items.professional.label')}</strong>{' '}
              {t('sections.dataCollected.items.professional.text')}
            </li>
            <li>
              <strong>{t('sections.dataCollected.items.technical.label')}</strong>{' '}
              {t('sections.dataCollected.items.technical.text')}
            </li>
            <li>
              <strong>{t('sections.dataCollected.items.account.label')}</strong>{' '}
              {t('sections.dataCollected.items.account.text')}
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.legalBasis.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('sections.legalBasis.intro')}</p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>
              <strong>{t('sections.legalBasis.items.contract.label')}</strong>{' '}
              {t('sections.legalBasis.items.contract.text')}
            </li>
            <li>
              <strong>{t('sections.legalBasis.items.consent.label')}</strong>{' '}
              {t('sections.legalBasis.items.consent.text')}
            </li>
            <li>
              <strong>{t('sections.legalBasis.items.legitimate.label')}</strong>{' '}
              {t('sections.legalBasis.items.legitimate.text')}
            </li>
            <li>
              <strong>{t('sections.legalBasis.items.legal.label')}</strong>{' '}
              {t('sections.legalBasis.items.legal.text')}
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.dataUse.title')}
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>{t('sections.dataUse.items.create')}</li>
            <li>{t('sections.dataUse.items.coverLetters')}</li>
            <li>{t('sections.dataUse.items.storeProfile')}</li>
            <li>{t('sections.dataUse.items.support')}</li>
            <li>{t('sections.dataUse.items.analytics')}</li>
            <li>{t('sections.dataUse.items.security')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.dataSharing.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('sections.dataSharing.intro')}</p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>
              <strong>{t('sections.dataSharing.items.ai.label')}</strong>{' '}
              {t('sections.dataSharing.items.ai.text')}
            </li>
            <li>
              <strong>{t('sections.dataSharing.items.hosting.label')}</strong>{' '}
              {t('sections.dataSharing.items.hosting.text')}
            </li>
            <li>
              <strong>{t('sections.dataSharing.items.analytics.label')}</strong>{' '}
              {t('sections.dataSharing.items.analytics.text')}
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('sections.dataSharing.noSell')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.dataRetention.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('sections.dataRetention.intro')}
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>{t('sections.dataRetention.items.cv')}</li>
            <li>{t('sections.dataRetention.items.account')}</li>
            <li>{t('sections.dataRetention.items.analytics')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.gdprRights.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('sections.gdprRights.intro')}</p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>
              <strong>{t('sections.gdprRights.items.access.label')}</strong>{' '}
              {t('sections.gdprRights.items.access.text')}
            </li>
            <li>
              <strong>{t('sections.gdprRights.items.rectification.label')}</strong>{' '}
              {t('sections.gdprRights.items.rectification.text')}
            </li>
            <li>
              <strong>{t('sections.gdprRights.items.erasure.label')}</strong>{' '}
              {t('sections.gdprRights.items.erasure.text')}
            </li>
            <li>
              <strong>{t('sections.gdprRights.items.restriction.label')}</strong>{' '}
              {t('sections.gdprRights.items.restriction.text')}
            </li>
            <li>
              <strong>{t('sections.gdprRights.items.portability.label')}</strong>{' '}
              {t('sections.gdprRights.items.portability.text')}
            </li>
            <li>
              <strong>{t('sections.gdprRights.items.object.label')}</strong>{' '}
              {t('sections.gdprRights.items.object.text')}
            </li>
            <li>
              <strong>{t('sections.gdprRights.items.withdraw.label')}</strong>{' '}
              {t('sections.gdprRights.items.withdraw.text')}
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('sections.gdprRights.contact', { email: 'privacy@cocode.dk' })}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.cookies.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('sections.cookies.body')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.security.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('sections.security.intro')}</p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>{t('sections.security.items.encryption')}</li>
            <li>{t('sections.security.items.access')}</li>
            <li>{t('sections.security.items.audits')}</li>
            <li>{t('sections.security.items.euDataCenters')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.international.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('sections.international.body')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.changes.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('sections.changes.body')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('sections.contact.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('sections.contact.intro', { email: 'privacy@cocode.dk' })}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>{t('sections.contact.labels.email')}</strong> privacy@cocode.dk
            <br />
            <strong>{t('sections.contact.labels.address')}</strong> {t('sections.contact.address')}
          </p>
        </section>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          {t('lastUpdated', { date: 'January 2026' })}
        </p>
      </div>
    </div>
  )
}

export default PrivacyPolicy
