import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Survivor, SurvivorStatus } from '@/types/survivor'
import { useSurvivorStore } from '@/stores/survivorStore'
import { SurvivorDetailRow } from '@/components/survivor/SurvivorDetailRow'

interface SurvivorListProps {
  survivors: Survivor[]
}

export const statusColors: Record<SurvivorStatus, string> = {
  hungry: 'bg-amber-100 text-amber-800',
  bored: 'bg-slate-100 text-slate-700',
  tired: 'bg-blue-100 text-blue-800',
  stressed: 'bg-red-100 text-red-800',
  healthy: 'bg-emerald-100 text-emerald-800',
  satisfied: 'bg-green-100 text-green-800',
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function SurvivorList({ survivors }: SurvivorListProps) {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const pendingActivities = useSurvivorStore((state) => state.pendingActivities)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">{t('survivorList.name')}</th>
            <th className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">{t('survivorList.age')}</th>
            <th className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">{t('survivorList.status')}</th>
            <th className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">{t('survivorList.currentAction')}</th>
            <th className="px-2 py-1.5 w-9" aria-label={t('survivorList.detailExpand')} />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {survivors.map((survivor) => {
            const isExpanded = expandedId === survivor.id
            const isSearchingFood = pendingActivities.some(
              (a) => a.survivorId === survivor.id && a.type === 'searchFood'
            )
            const displayAction = isSearchingFood ? t('survivorList.searchingFood') : t(`action.${survivor.currentAction}`)
            return (
              <Fragment key={survivor.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-1.5 font-medium text-gray-900 whitespace-nowrap">{survivor.name}</td>
                  <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{survivor.age}{t('survivorList.ageSuffix')}</td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[survivor.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {t(`status.${survivor.status}`)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap" title={displayAction}>
                    {displayAction.length >= 5
                      ? `${displayAction.slice(0, 4)}...`
                      : displayAction}
                  </td>
                  <td className="px-2 py-1.5 w-9">
                    <button
                      type="button"
                      onClick={() => toggleExpand(survivor.id)}
                      className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? t('survivorList.detailCollapse') : t('survivorList.detailExpand')}
                    >
                      <ChevronIcon expanded={isExpanded} />
                    </button>
                  </td>
                </tr>
                <SurvivorDetailRow survivor={survivor} isExpanded={isExpanded} />
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
