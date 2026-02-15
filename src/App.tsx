import { useEffect, useState } from 'react'
import { BottomNav, type NavPage } from '@/components/BottomNav'
import { GameHeader } from '@/components/GameHeader'
import { SurvivorList } from '@/components/SurvivorList'
import { useGameTimeStore } from '@/stores/gameTimeStore'
import { useSurvivorStore } from '@/stores/survivorStore'

const pageTitles: Record<NavPage, string> = {
  survivors: '생존자 리스트',
  research: '연구 트리',
  dashboard: '대시보드',
  regions: '지역 리스트',
  settings: '설정',
}

function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('survivors')
  const survivors = useSurvivorStore((state) => state.survivors)
  const year = useGameTimeStore((state) => state.year)
  const hour = useGameTimeStore((state) => state.hour)
  const minute = useGameTimeStore((state) => state.minute)
  const completeDueActivities = useSurvivorStore((state) => state.completeDueActivities)

  useEffect(() => {
    completeDueActivities({ year, hour, minute })
  }, [year, hour, minute, completeDueActivities])

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center md:p-4">
      {/* 모바일 뷰포트: PC에서는 가운데 정렬+여백, 모바일에서는 전체 화면 */}
      <main className="relative w-full max-w-[428px] min-h-screen md:min-h-[calc(100dvh-2rem)] bg-white md:shadow-xl md:rounded-2xl overflow-hidden flex flex-col">
        <GameHeader />
        <header className="shrink-0 p-4 pb-2">
          <h1 className="text-2xl font-bold text-gray-800">
            {pageTitles[currentPage]}
          </h1>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24">
          {currentPage === 'survivors' && (
            <SurvivorList survivors={survivors} />
          )}
          {currentPage !== 'survivors' && (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-gray-500">준비 중입니다.</p>
            </div>
          )}
        </div>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </main>
    </div>
  )
}

export default App
