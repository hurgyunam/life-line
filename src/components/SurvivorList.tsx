import { Fragment, useState } from 'react'
import type { Survivor } from '../types/survivor'

interface SurvivorListProps {
  survivors: Survivor[]
}

const statusColors: Record<string, string> = {
  굶주림: 'bg-amber-100 text-amber-800',
  지루함: 'bg-slate-100 text-slate-700',
  피로: 'bg-blue-100 text-blue-800',
  스트레스: 'bg-red-100 text-red-800',
  건강함: 'bg-emerald-100 text-emerald-800',
  만족: 'bg-green-100 text-green-800',
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">이름</th>
            <th className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">나이</th>
            <th className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">상태</th>
            <th className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">현재 행동</th>
            <th className="px-2 py-1.5 w-9" aria-label="상세 보기" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {survivors.map((survivor) => {
            const isExpanded = expandedId === survivor.id
            return (
              <Fragment key={survivor.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-1.5 font-medium text-gray-900 whitespace-nowrap">{survivor.name}</td>
                  <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{survivor.age}세</td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[survivor.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {survivor.status}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap" title={survivor.currentAction}>
                    {survivor.currentAction.length >= 5
                      ? `${survivor.currentAction.slice(0, 4)}...`
                      : survivor.currentAction}
                  </td>
                  <td className="px-2 py-1.5 w-9">
                    <button
                      type="button"
                      onClick={() => toggleExpand(survivor.id)}
                      className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? '상세 접기' : '상세 펼치기'}
                    >
                      <ChevronIcon expanded={isExpanded} />
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-2 py-3">
                      <div className="text-gray-600 space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">이름:</span> {survivor.name}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">나이:</span> {survivor.age}세
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">상태:</span>{' '}
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              statusColors[survivor.status] ?? 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {survivor.status}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">현재 행동:</span> {survivor.currentAction}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
