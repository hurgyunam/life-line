import { useTranslation } from 'react-i18next'

export type NavPage = 'quest' | 'campResources' | 'dashboard' | 'settings' | 'activityLog'

interface BottomNavProps {
  currentPage: NavPage
  onNavigate: (page: NavPage) => void
}

const navKeys: Record<NavPage, string> = {
  quest: 'nav.quest',
  campResources: 'nav.campResources',
  dashboard: 'nav.dashboard',
  settings: 'nav.settings',
  activityLog: 'nav.activityLog',
}

const navItems: { page: NavPage; icon: React.ReactNode }[] = [
  {
    page: 'quest',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    page: 'campResources',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    page: 'dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    page: 'activityLog',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    page: 'settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const { t } = useTranslation()
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-5 h-[57px] px-1">
        {navItems.map((item) => {
          const isCenter = item.page === 'dashboard'
          const isActive = currentPage === item.page

          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={
                isCenter
                  ? 'flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all w-[48px] h-[48px] justify-self-center'
                  : `flex flex-col items-center justify-center gap-0.5 min-w-0 py-2 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`
              }
              aria-label={t(navKeys[item.page])}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="[&>svg]:w-6 [&>svg]:h-6 shrink-0">{item.icon}</span>
              {!isCenter && (
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {t(navKeys[item.page])}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
