import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomNav, type NavPage } from '@/components/layout/BottomNav'
import {
  loadLastSave,
  getSettings,
  getLastLoadedId,
  overwriteSave,
} from '@/utils/gameStorage'
import { GameHeader } from '@/components/layout/GameHeader'
import { Dashboard } from '@/components/pages/Dashboard'
import { Settings } from '@/components/pages/Settings'
import { CampResources } from '@/components/camp/CampResources'
import { useGameTimeStore } from '@/stores/gameTimeStore'
import { useSurvivorStore } from '@/stores/survivorStore'

const pageKeys: Record<NavPage, string> = {
  dashboard: 'page.dashboard',
  settings: 'page.settings',
  quest: 'page.quest',
  campResources: 'page.campResources',
  activityLog: 'page.activityLog',
}

function App() {
  const { t, i18n } = useTranslation()
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard')

  useEffect(() => {
    loadLastSave()
  }, [])

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])
  const survivors = useSurvivorStore((state) => state.survivors)
  const year = useGameTimeStore((state) => state.year)
  const hour = useGameTimeStore((state) => state.hour)
  const minute = useGameTimeStore((state) => state.minute)
  const completeDueActivities = useSurvivorStore((state) => state.completeDueActivities)

  useEffect(() => {
    completeDueActivities({ year, hour, minute })
  }, [year, hour, minute, completeDueActivities])

  // 자동 저장: 주기(분)마다 현재 세이브 덮어쓰기
  const lastSaveRef = useRef(Date.now())
  useEffect(() => {
    const intervalMinutes = getSettings().autoSaveIntervalMinutes
    if (intervalMinutes <= 0) return

    const id = setInterval(() => {
      const lastLoadedId = getLastLoadedId()
      if (!lastLoadedId) return
      const now = Date.now()
      const elapsedMinutes = (now - lastSaveRef.current) / (60 * 1000)
      if (elapsedMinutes >= intervalMinutes) {
        overwriteSave(lastLoadedId)
        lastSaveRef.current = now
      }
    }, 30 * 1000) // 30초마다 체크

    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center md:p-4">
      {/* 모바일 뷰포트: PC에서는 가운데 정렬+여백, 모바일에서는 전체 화면 */}
      <main className="relative w-full max-w-[428px] min-h-screen md:min-h-[calc(100dvh-2rem)] bg-white md:shadow-xl md:rounded-2xl overflow-hidden flex flex-col">
        <GameHeader />
        <header className="shrink-0 p-4 pb-2">
          <h1 className="text-2xl font-bold text-gray-800">
            {t(pageKeys[currentPage])}
          </h1>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24">
          {currentPage === 'dashboard' && <Dashboard survivors={survivors} />}
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'campResources' && <CampResources />}
          {(currentPage === 'quest' || currentPage === 'activityLog') && (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-gray-500">{t('page.comingSoon')}</p>
            </div>
          )}
        </div>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </main>
    </div>
  )
}

export default App
