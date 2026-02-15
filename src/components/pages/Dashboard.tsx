import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Survivor } from '@/types/survivor'
import { SurvivorList } from '@/components/survivor/SurvivorList'
import { RegionList } from '@/components/region/RegionList'
import { GuidelinesList } from '@/components/guidelines/GuidelinesList'
import { TimeController } from '@/components/layout/TimeController'

interface DashboardTile {
  id: string
  icon: React.ReactNode
  labelKey: string
  onClick?: () => void
}

export type DashboardPopup = 'survivors' | 'research' | 'regions' | 'guidelines' | null

interface DashboardProps {
  survivors: Survivor[]
}

function PeopleIcon({ className }: { className?: string }) {
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ResearchIcon({ className }: { className?: string }) {
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
      <path d="M12 2v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="M12 18v4" />
      <path d="m17.24 17.24 2.83-2.83" />
      <path d="M18 12h4" />
      <path d="m19.07 4.93-2.83 2.83" />
      <path d="M12 8a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4Z" />
    </svg>
  )
}

function RegionsIcon({ className }: { className?: string }) {
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
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
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
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

function PackageIcon({ className }: { className?: string }) {
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function GuidelinesIcon({ className }: { className?: string }) {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h4" />
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

export function Dashboard({ survivors }: DashboardProps) {
  const { t } = useTranslation()
  const [popupPage, setPopupPage] = useState<DashboardPopup>(null)

  const tiles: DashboardTile[] = [
    {
      id: 'survivors',
      icon: <PeopleIcon className="h-8 w-8" />,
      labelKey: 'nav.survivors',
      onClick: () => setPopupPage('survivors'),
    },
    {
      id: 'research',
      icon: <ResearchIcon className="h-8 w-8" />,
      labelKey: 'nav.research',
      onClick: () => setPopupPage('research'),
    },
    {
      id: 'regions',
      icon: <RegionsIcon className="h-8 w-8" />,
      labelKey: 'nav.regions',
      onClick: () => setPopupPage('regions'),
    },
    {
      id: 'guidelines',
      icon: <GuidelinesIcon className="h-8 w-8" />,
      labelKey: 'nav.guidelines',
      onClick: () => setPopupPage('guidelines'),
    },
    {
      id: 'stats',
      icon: <ChartIcon className="h-8 w-8" />,
      labelKey: 'dashboard.stats',
    },
    {
      id: 'resources',
      icon: <PackageIcon className="h-8 w-8" />,
      labelKey: 'dashboard.resources',
    },
    {
      id: 'calendar',
      icon: <CalendarIcon className="h-8 w-8" />,
      labelKey: 'dashboard.calendar',
    },
  ]

  const gridSize = 25
  const emptyTiles: DashboardTile[] = Array.from(
    { length: gridSize - tiles.length },
    (_, i) => ({
      id: `empty-${i}`,
      icon: <PlaceholderIcon className="h-8 w-8" />,
      labelKey: '',
    })
  )

  const allTiles = [...tiles, ...emptyTiles]

  const popupTitleKey =
    popupPage === 'survivors'
      ? 'page.survivors'
      : popupPage === 'research'
        ? 'page.research'
        : popupPage === 'regions'
          ? 'page.regions'
          : popupPage === 'guidelines'
            ? 'page.guidelines'
            : ''

  const popupContent =
    popupPage === 'survivors' ? (
      <SurvivorList survivors={survivors} />
    ) : popupPage === 'regions' ? (
      <RegionList />
    ) : popupPage === 'guidelines' ? (
      <GuidelinesList />
    ) : popupPage ? (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">{t('page.comingSoon')}</p>
      </div>
    ) : null

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

      {/* 페이지 팝업 - 모바일 UI 레이아웃 유지 (PC에서는 max-w-[428px] 프레임 내 표시) */}
      {popupPage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
        >
          <div className="flex flex-col w-full max-w-[428px] min-h-screen md:min-h-[calc(100dvh-2rem)] bg-white md:shadow-xl md:rounded-2xl overflow-hidden">
            <header className="shrink-0 flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
              <h2 id="popup-title" className="text-lg font-semibold text-gray-800">
                {t(popupTitleKey)}
              </h2>
              <button
                type="button"
                onClick={() => setPopupPage(null)}
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label={t('common.close')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </header>
            <div className="shrink-0 border-b border-gray-200 px-4 py-3">
              <TimeController />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">{popupContent}</div>
          </div>
        </div>
      )}
    </div>
  )
}
