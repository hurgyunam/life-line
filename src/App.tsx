import { useState } from 'react'
import { BottomNav, type NavPage } from './components/BottomNav'

const pageTitles: Record<NavPage, string> = {
  survivors: '생존자 리스트',
  research: '연구 트리',
  dashboard: '대시보드',
  regions: '지역 리스트',
  settings: '설정',
}

function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard')

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center md:p-4">
      {/* 모바일 뷰포트: PC에서는 가운데 정렬+여백, 모바일에서는 전체 화면 */}
      <main className="relative w-full max-w-[428px] min-h-screen md:min-h-[calc(100dvh-2rem)] bg-white md:shadow-xl md:rounded-2xl overflow-hidden flex flex-col pb-8">
        <div className="flex-1 flex items-center justify-center p-4 pb-20">
          <h1 className="text-2xl font-bold text-gray-800">
            {pageTitles[currentPage]}
          </h1>
        </div>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </main>
    </div>
  )
}

export default App
