import { useGameTimeStore } from '@/stores/gameTimeStore'
import { useSurvivorStore } from '@/stores/survivorStore'
import type { Survivor } from '@/types/survivor'
import { GaugeBar } from '@/components/GaugeBar'
import { statusColors } from '@/components/SurvivorList'
import { GAME_TIME_CONFIG, ACTIVITY_BALANCE } from '@/constants/gameConfig'

function addMinutesToTime(
  year: number,
  hour: number,
  minute: number,
  add: number
): { year: number; hour: number; minute: number } {
  let m = minute + add
  let h = hour
  let y = year
  if (m >= GAME_TIME_CONFIG.MINUTES_PER_HOUR) {
    h += Math.floor(m / GAME_TIME_CONFIG.MINUTES_PER_HOUR)
    m = m % GAME_TIME_CONFIG.MINUTES_PER_HOUR
  }
  if (h >= GAME_TIME_CONFIG.HOURS_PER_DAY) {
    y += Math.floor(h / GAME_TIME_CONFIG.HOURS_PER_DAY)
    h = h % GAME_TIME_CONFIG.HOURS_PER_DAY
  }
  return { year: y, hour: h, minute: m }
}

interface SurvivorDetailRowProps {
  survivor: Survivor
  isExpanded: boolean
}

export function SurvivorDetailRow({ survivor, isExpanded }: SurvivorDetailRowProps) {
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

  if (!isExpanded) return null

  const isSearchingFood = pendingActivities.some(
    (a) => a.survivorId === survivor.id && a.type === 'searchFood'
  )
  const displayAction = isSearchingFood ? '음식 찾아보기' : survivor.currentAction

  return (
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
                    ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR
                  )
                  startSearchFood(survivor.id, endAt)
                }}
                disabled={isSearchingFood}
                className="rounded border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                title={isSearchingFood ? '진행 중' : `${ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS}시간 소요`}
              >
                음식 찾아보기 ({ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS}시간)
              </button>
              <button
                type="button"
                onClick={() => {
                  advanceByMinutes(ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR)
                  searchWater(survivor.id)
                }}
                className="rounded border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100"
                title={`${ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS}시간 소요`}
              >
                식수 찾아보기 ({ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS}시간)
              </button>
              <button
                type="button"
                onClick={() => {
                  advanceByMinutes(ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR)
                  searchSurvivor(survivor.id)
                }}
                className="rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                title={`${ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS}시간 소요`}
              >
                또 다른 생존자 찾아보기 ({ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS}시간)
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
  )
}
