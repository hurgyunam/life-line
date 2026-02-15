import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n'

const languageLabels: Record<SupportedLanguage, string> = {
  ko: 'settings.languageKo',
  en: 'settings.languageEn',
}

export function Settings() {
  const { t, i18n } = useTranslation()

  const handleLanguageChange = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng)
    document.documentElement.lang = lng
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          {t('settings.language')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map((lng) => (
            <button
              key={lng}
              type="button"
              onClick={() => handleLanguageChange(lng)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                i18n.language === lng
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t(languageLabels[lng])}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
