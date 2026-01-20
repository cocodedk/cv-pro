import { UseFormRegister } from 'react-hook-form'
import { CVData } from '../../types/cv'
import { useTranslation } from 'react-i18next'

interface AddressFieldsProps {
  register: UseFormRegister<CVData>
}

export default function AddressFields({ register }: AddressFieldsProps) {
  const { t } = useTranslation('cv')

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
        {t('personalInfo.address.title')}
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="address.street"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('personalInfo.address.street.label')}
          </label>
          <input
            type="text"
            id="address.street"
            {...register('personal_info.address.street')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            placeholder={t('personalInfo.address.street.placeholder')}
          />
        </div>

        <div>
          <label
            htmlFor="address.city"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('personalInfo.address.city')}
          </label>
          <input
            type="text"
            id="address.city"
            {...register('personal_info.address.city')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            htmlFor="address.state"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('personalInfo.address.state')}
          </label>
          <input
            type="text"
            id="address.state"
            {...register('personal_info.address.state')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            htmlFor="address.zip"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('personalInfo.address.zip')}
          </label>
          <input
            type="text"
            id="address.zip"
            {...register('personal_info.address.zip')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            htmlFor="address.country"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('personalInfo.address.country')}
          </label>
          <input
            type="text"
            id="address.country"
            {...register('personal_info.address.country')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>
      </div>
    </div>
  )
}
