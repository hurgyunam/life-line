import { Fragment, useState } from 'react'
import type { Survivor } from '../types/survivor'
import { useGameTimeStore } from '../stores/gameTimeStore'
import { useSurvivorStore } from '../stores/survivorStore'
import { GaugeBar } from './GaugeBar'

const HOURS_FOOD_SEARCH = 1
const HOURS_WATER_SEARCH = 1
const HOURS_SURVIVOR_SEARCH = 6
const MINUTES_PER_HOUR = 60

function addMinutesToTime(
  year: number,
  hour: number,
  minute: number,
  add: number
): { year: number; hour: number; minute: number } {
  let m = minute + add
  let h = hour
  let y = year
  if (m >= 60) {
    h += Math.floor(m / 60)
    m = m % 60
  }
  if (h >= 24) {
    y += Math.floor(h / 24)
    h = h % 24
  }
  return { year: y, hour: h, minute: m }
}

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
  const year = useGameTimeStore((state) => state.year)
  const hour = useGameTimeStore((state) => state.hour)
  const minute = useGameTimeStore((state) => state.minute)
  const advanceByMinutes = useGameTimeStore((state) => state.advanceByMinutes)
  const eatCarrot = useSurvivorStore((state) => state.eatCarrot)
  const drinkWater = useSurvivorStore((state) => state.drinkWater)
  const pendingActivities = useSurvivorStore((state) => state.pendingActivities)
  const startSearchFood = useSurvivorStore((state) => state.startSearchFood)
  const searchWater = useSurvivorStore((state) => state.searchWater)
  const searchSurvivor = useSurvivorStore((state) => state.searchSurvivor)
  const doResearch = useSurvivorStore((state) => state.doResearch)

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
            const isSearchingFood = pendingActivities.some(
              (a) => a.survivorId === survivor.id && a.type === 'searchFood'
            )
            const displayAction = isSearchingFood ? '음식 찾아보기' : survivor.currentAction
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
                      aria-label={isExpanded ? '상세 접기' : '상세 펼치기'}
                    >
                      <ChevronIcon expanded={isExpanded} />
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-2 py-3">
                      <div className="text-gray-600 space-y-3 text-sm">
                        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
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
                          <div className="sm:col-span-2">
                            <span className="font-medium text-gray-700">현재 행동:</span> {displayAction}
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <p className="mb-2 text-xs font-medium text-gray-500">개인 소지품</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-gray-700">당근 {survivor.inventory.carrot}개</span>
                            <button
                              type="button"
                              onClick={() => eatCarrot(survivor.id)}
                              disabled={survivor.inventory.carrot <= 0}
                              className="rounded bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              당근 먹기
                            </button>
                            <span className="text-gray-700">식수 {survivor.inventory.water}개</span>
                            <button
                              type="button"
                              onClick={() => drinkWater(survivor.id)}
                              disabled={survivor.inventory.water <= 0}
                              className="rounded bg-sky-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              식수 마시기
                            </button>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <p className="mb-2 text-xs font-medium text-gray-500">활동</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const endAt = addMinutesToTime(
                                  year,
                                  hour,
                                  minute,
                                  HOURS_FOOD_SEARCH * MINUTES_PER_HOUR
                                )
                                startSearchFood(survivor.id, endAt)
                              }}
                              disabled={isSearchingFood}
                              className="rounded border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                              title={isSearchingFood ? '진행 중' : `${HOURS_FOOD_SEARCH}시간 소요`}
                            >
                              음식 찾아보기 (1시간)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                advanceByMinutes(HOURS_WATER_SEARCH * 60)
                                searchWater(survivor.id)
                              }}
                              className="rounded border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100"
                              title={`${HOURS_WATER_SEARCH}시간 소요`}
                            >
                              식수 찾아보기 (1시간)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                advanceByMinutes(HOURS_SURVIVOR_SEARCH * 60)
                                searchSurvivor(survivor.id)
                              }}
                              className="rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                              title={`${HOURS_SURVIVOR_SEARCH}시간 소요`}
                            >
                              또 다른 생존자 찾아보기 (6시간)
                            </button>
                            <button
                              type="button"
                              onClick={() => doResearch(survivor.id)}
                              className="rounded border border-violet-300 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 hover:bg-violet-100"
                            >
                              연구하기
                            </button>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <p className="mb-2 text-xs font-medium text-gray-500">상태 지수</p>
                          <div className="space-y-2">
                            <GaugeBar label="배고픔" value={survivor.hunger} color="amber" />
                            <GaugeBar label="피곤함" value={survivor.tiredness} color="blue" />
                            <GaugeBar label="목마름" value={survivor.thirst} color="slate" />
                            <GaugeBar label="지루함" value={survivor.boredom} color="green" />
                          </div>
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
