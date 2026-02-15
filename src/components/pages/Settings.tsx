import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n'
import {
  createSave,
  loadSave,
  deleteSave,
  getSaveList,
  getSettings,
  setSettings,
  type SaveSlot,
} from '@/utils/gameStorage'
import { AUTO_SAVE_INTERVAL_OPTIONS } from '@/constants/gameConfig'

const languageLabels: Record<SupportedLanguage, string> = {
  ko: 'settings.languageKo',
  en: 'settings.languageEn',
}

interface SettingTile {
  id: string
  icon: React.ReactNode
  labelKey: string
  onClick?: () => void
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  )
}

function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function PlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}

const APP_VERSION = '1.0.0'

/** Production dependencies - 라이선스 표시용 */
const THIRD_PARTY_LICENSES: Array<{ name: string; license: string; copyright: string }> = [
  { name: 'React', license: 'MIT', copyright: '© Meta Platforms, Inc. and affiliates' },
  { name: 'i18next', license: 'MIT', copyright: '© i18next' },
  { name: 'react-i18next', license: 'MIT', copyright: '© 2015-present i18next' },
  { name: 'Zustand', license: 'MIT', copyright: '© 2019 Paul Henschel' },
  { name: 'Lucide Icons', license: 'ISC/MIT', copyright: '© Cole Bemis, Lucide Contributors' },
  { name: 'Vite', license: 'MIT', copyright: '© VoidZero Inc., Vite contributors' },
  { name: 'Tailwind CSS', license: 'MIT', copyright: '© Tailwind Labs, Inc.' },
  { name: 'TypeScript', license: 'Apache-2.0', copyright: '© Microsoft Corporation' },
]

function formatSaveDate(createdAt: number): string {
  const d = new Date(createdAt)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function Settings() {
  const { t, i18n } = useTranslation()
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showAutoSaveModal, setShowAutoSaveModal] = useState(false)
  const [saveList, setSaveList] = useState<SaveSlot[]>([])
  const [autoSaveInterval, setAutoSaveIntervalState] = useState(
    getSettings().autoSaveIntervalMinutes
  )

  const refreshSaveList = () => setSaveList(getSaveList())

  const openSaveModal = () => {
    refreshSaveList()
    setShowSaveModal(true)
  }

  const openAutoSaveModal = () => {
    setAutoSaveIntervalState(getSettings().autoSaveIntervalMinutes)
    setShowAutoSaveModal(true)
  }

  const handleAutoSaveIntervalChange = (minutes: number) => {
    setSettings({ autoSaveIntervalMinutes: minutes })
    setAutoSaveIntervalState(minutes)
    setShowAutoSaveModal(false)
  }

  const handleCreateSave = () => {
    createSave()
    refreshSaveList()
  }

  const handleLoadSave = (id: string) => {
    loadSave(id)
    setShowSaveModal(false)
  }

  const handleDeleteSave = (id: string) => {
    deleteSave(id)
    refreshSaveList()
  }

  const handleLanguageChange = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng)
    document.documentElement.lang = lng
    setShowLanguageModal(false)
  }

  const tiles: SettingTile[] = [
    {
      id: 'save',
      icon: <SaveIcon className="h-8 w-8" />,
      labelKey: 'settings.saveManagement',
      onClick: openSaveModal,
    },
    {
      id: 'autoSave',
      icon: <ClockIcon className="h-8 w-8" />,
      labelKey: 'settings.autoSaveInterval',
      onClick: openAutoSaveModal,
    },
    {
      id: 'language',
      icon: <GlobeIcon className="h-8 w-8" />,
      labelKey: 'settings.language',
      onClick: () => setShowLanguageModal(true),
    },
    {
      id: 'sound',
      icon: <VolumeIcon className="h-8 w-8" />,
      labelKey: 'settings.sound',
    },
    {
      id: 'notifications',
      icon: <BellIcon className="h-8 w-8" />,
      labelKey: 'settings.notifications',
    },
    {
      id: 'about',
      icon: <InfoIcon className="h-8 w-8" />,
      labelKey: 'settings.about',
      onClick: () => setShowAboutModal(true),
    },
  ]

  const gridSize = 25
  const emptyTiles: SettingTile[] = Array.from(
    { length: gridSize - tiles.length },
    (_, i) => ({
      id: `empty-${i}`,
      icon: <PlaceholderIcon className="h-8 w-8" />,
      labelKey: '',
    })
  )

  const allTiles = [...tiles, ...emptyTiles]

  return (
    <div className="w-full">
      {/* 5x5 그리드 - 핸드폰 메인 화면 스타일 */}
      <div className="grid grid-cols-5 gap-3">
        {allTiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={tile.onClick}
            disabled={!tile.onClick}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gray-100 p-3 transition-all active:scale-95 disabled:cursor-default disabled:opacity-40 disabled:active:scale-100 enabled:hover:bg-gray-200"
          >
            <span className="flex items-center justify-center text-gray-600">
              {tile.icon}
            </span>
            {tile.labelKey && (
              <span className="text-center text-xs font-medium text-gray-600 line-clamp-2">
                {t(tile.labelKey)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 자동 저장 주기 모달 */}
      {showAutoSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAutoSaveModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {t('settings.autoSaveInterval')}
            </h3>
            <div className="flex flex-col gap-2">
              {AUTO_SAVE_INTERVAL_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => handleAutoSaveIntervalChange(minutes)}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                    autoSaveInterval === minutes
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {minutes === 0
                    ? t('settings.autoSaveOff')
                    : t('settings.autoSaveMinutes', { count: minutes })}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAutoSaveModal(false)}
              className="mt-4 w-full rounded-xl bg-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* 언어 선택 모달 */}
      {showLanguageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowLanguageModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {t('settings.language')}
            </h3>
            <div className="flex flex-col gap-2">
              {SUPPORTED_LANGUAGES.map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => handleLanguageChange(lng)}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                    i18n.language === lng
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(languageLabels[lng])}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowLanguageModal(false)}
              className="mt-4 w-full rounded-xl bg-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* 세이브 관리 모달 */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="shrink-0 p-4 pb-2 text-lg font-semibold text-gray-800">
              {t('settings.saveManagement')}
            </h3>
            <div className="flex-1 min-h-0 overflow-y-auto px-4">
              <button
                type="button"
                onClick={handleCreateSave}
                className="mb-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {t('settings.saveNew')}
              </button>
              {saveList.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  {t('settings.saveEmpty')}
                </p>
              ) : (
                <ul className="space-y-2 pb-4">
                  {saveList.map((slot) => (
                    <li
                      key={slot.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {slot.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatSaveDate(slot.createdAt)} ·{' '}
                          {t('settings.saveSurvivors', {
                            count: Array.isArray(slot.survivorData.survivors)
                              ? slot.survivorData.survivors.length
                              : 0,
                          })}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => handleLoadSave(slot.id)}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          {t('settings.saveLoad')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSave(slot.id)}
                          className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          {t('settings.saveDelete')}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="shrink-0 border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="w-full rounded-xl bg-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정보(About) 모달 - 앱 정보 및 오픈소스 라이선스 */}
      {showAboutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className="w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {t('settings.aboutTitle')}
            </h3>
            <p className="mb-1 text-base font-medium text-gray-900">
              {t('settings.aboutAppName')}
            </p>
            <p className="mb-4 text-sm text-gray-500">
              {t('settings.aboutVersion', { version: APP_VERSION })}
            </p>
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              {t('settings.aboutLicenses')}
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
              {THIRD_PARTY_LICENSES.map(({ name, license, copyright }) => (
                <li key={name}>
                  <span className="font-medium text-gray-700">{name}</span>
                  {' · '}
                  {license}
                  {' · '}
                  <span className="text-gray-500">{copyright}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowAboutModal(false)}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
