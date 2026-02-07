import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'
import type { Survivor } from '@/types/survivor'
import { GAME_TIME_CONFIG, ACTIVITY_BALANCE, SURVIVOR_BALANCE } from '@/constants/gameConfig'
import { decaySurvivors, computeStatusFromStats } from '@/logic/survivorDecay'
import { getGuidelineActivityForSurvivor } from '@/logic/guidelineActivities'
import { getSettings } from '@/utils/gameStorage'
import { useGameTimeStore } from '@/stores/gameTimeStore'
import { useRestPlaceStore } from '@/stores/restPlaceStore'
import type { SleepingBag } from '@/types/sleepingBag'
import type { RestPlace } from '@/types/restPlace'

/** 게임 시각 (진행 중 활동 완료 시점 비교용) */
export interface GameTimePoint {
  year: number
  hour: number
  minute: number
}

/** 진행 중 활동 (시간이 지나면 완료 처리) */
export interface PendingActivity {
  id: string
  survivorId: string
  type: 'searchFood' | 'restWithSleepingBag' | 'restAtPlace'
  endAt: GameTimePoint
  sleepingBag?: SleepingBag
  restPlace?: RestPlace
}

/** 예약 활동 타입 */
export type ReservedActivityType =
  | 'eatWildStrawberry'
  | 'drinkWater'
  | 'searchFood'
  | 'searchWater'
  | 'searchSurvivor'
  | 'doResearch'
  | 'restWithSleepingBag'
  | 'restAtPlace'

/** 예약 활동 (버튼 클릭 시 리스트에 추가, 실행 시 실제 효과 적용) */
export interface ReservedActivity {
  id: string
  survivorId: string
  type: ReservedActivityType
}

function toMinutes(t: GameTimePoint): number {
  return (
    t.year * GAME_TIME_CONFIG.HOURS_PER_DAY * GAME_TIME_CONFIG.MINUTES_PER_HOUR +
    t.hour * GAME_TIME_CONFIG.MINUTES_PER_HOUR +
    t.minute
  )
}

function addMinutesToPoint(t: GameTimePoint, minutes: number): GameTimePoint {
  let m = t.minute + minutes
  let h = t.hour
  let y = t.year
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

const defaultInventory = { 
  wildStrawberry: SURVIVOR_BALANCE.INITIAL_INVENTORY.WILD_STRAWBERRY, 
  water: SURVIVOR_BALANCE.INITIAL_INVENTORY.WATER 
}

const initialSurvivors: Survivor[] = [
  { id: '1', name: '김민수', age: 32, status: 'healthy', currentAction: 'waiting', hunger: 85, tiredness: 70, thirst: 90, boredom: 75, inventory: { ...defaultInventory } },
  { id: '2', name: '이서연', age: 28, status: 'bored', currentAction: 'waiting', hunger: 60, tiredness: 55, thirst: 45, boredom: 30, inventory: { ...defaultInventory } },
  { id: '3', name: '박준호', age: 45, status: 'hungry', currentAction: 'waiting', hunger: 20, tiredness: 65, thirst: 50, boredom: 65, inventory: { ...defaultInventory } },
  { id: '4', name: '최지은', age: 24, status: 'tired', currentAction: 'waiting', hunger: 75, tiredness: 25, thirst: 80, boredom: 55, inventory: { ...defaultInventory } },
  { id: '5', name: '정현우', age: 38, status: 'satisfied', currentAction: 'waiting', hunger: 90, tiredness: 80, thirst: 85, boredom: 90, inventory: { ...defaultInventory } },
  { id: '6', name: '한소희', age: 29, status: 'stressed', currentAction: 'waiting', hunger: 50, tiredness: 15, thirst: 70, boredom: 50, inventory: { ...defaultInventory } },
  { id: '7', name: '강민준', age: 41, status: 'healthy', currentAction: 'waiting', hunger: 70, tiredness: 60, thirst: 65, boredom: 80, inventory: { ...defaultInventory } },
  { id: '8', name: '윤수아', age: 26, status: 'bored', currentAction: 'waiting', hunger: 55, tiredness: 50, thirst: 40, boredom: 25, inventory: { ...defaultInventory } },
]

/** 생존자별 첫 번째 예약 활동의 시작 시각 */
interface ActivityStartRecord {
  activityId: string
  startedAt: GameTimePoint
}

interface SurvivorState {
  survivors: Survivor[]
  /** 진행 중 활동 (1시간 지나면 완료) */
  pendingActivities: PendingActivity[]
  /** 예약 활동 (실행 전 대기 중) */
  reservedActivities: ReservedActivity[]
  /** 생존자별 첫 번째 예약 활동 시작 시각 (대기 시간 경과 후 실행용) */
  activityStartTimes: Record<string, ActivityStartRecord>
  /** 생존자별 욕구 충족 중인 지침 키 (threshold 이하→100까지 반복용) */
  guidelineSatisfyingPhase: Record<string, string | null>
  /** 발견한 생존자 수 (또 다른 생존자 찾아보기) */
  discoveredSurvivorCount: number
  /** 연구 진행도 */
  researchProgress: number
  eatWildStrawberry: (survivorId: string) => void
  drinkWater: (survivorId: string) => void
  /** 음식 찾기 시작 — 1시간 후 완료 시 야생 딸기 1개 추가 */
  startSearchFood: (survivorId: string, endAt: GameTimePoint) => void
  /** 진행 중 활동 취소 */
  cancelPendingActivity: (id: string) => void
  /** 현재 시각 기준으로 만료된 진행 중 활동 완료 처리 */
  completeDueActivities: (now: GameTimePoint) => void
  /** 게임 분 경과에 따른 수치 감소 (배속 반영된 분 수 전달) */
  decayByMinutes: (gameMinutes: number) => void
  searchWater: (survivorId: string) => void
  searchSurvivor: (survivorId: string) => void
  doResearch: (survivorId: string) => void
  /** 예약 활동 추가 */
  addReservedActivity: (survivorId: string, type: ReservedActivityType) => void
  /** 예약 활동 제거 */
  removeReservedActivity: (id: string) => void
  /** 예약 활동 실행 (효과 적용 후 리스트에서 제거) */
  executeReservedActivity: (id: string) => boolean
  /** 예약 활동 순서 변경 (해당 생존자 내에서) */
  reorderReservedActivities: (survivorId: string, oldIndex: number, newIndex: number) => void
  /** 행동 지침 조건에 부합하는 생존자에게 지침 활동을 예약 최상단에 삽입 */
  insertGuidelineActivitiesIfNeeded: () => void
  /** 맨 위 예약부터 자동 실행 (게임 시간 tick 시 호출) */
  processReservedActivities: () => void
}

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let nextActivityId = 1
function genActivityId() {
  return `activity-${nextActivityId++}`
}

let nextReservedId = 1
function genReservedId() {
  return `reserved-${nextReservedId++}`
}

/** 로드된 reservedActivities 기준으로 nextReservedId 동기화 */
export function syncNextReservedId(activities: ReservedActivity[]) {
  const max = activities.reduce((acc, a) => {
    const n = parseInt(a.id.replace('reserved-', ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  nextReservedId = max + 1
}

/** 로드된 pendingActivities 기준으로 nextActivityId 동기화 (gameStorage에서 사용) */
export function syncNextActivityId(activities: PendingActivity[]) {
  const max = activities.reduce((acc, a) => {
    const n = parseInt(a.id.replace('activity-', ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  nextActivityId = max + 1
}

const QUEUE_WAIT = ACTIVITY_BALANCE.QUEUE_WAIT_MINUTES

export const useSurvivorStore = create<SurvivorState>((set, get) => ({
  survivors: initialSurvivors,
  pendingActivities: [],
  reservedActivities: [],
  activityStartTimes: {},
  guidelineSatisfyingPhase: {},
  discoveredSurvivorCount: 0,
  researchProgress: 0,
  eatWildStrawberry: (survivorId) =>
    set((state) => ({
      survivors: state.survivors.map((s) => {
        if (s.id !== survivorId || s.inventory.wildStrawberry <= 0) return s
        return {
          ...s,
          inventory: { ...s.inventory, wildStrawberry: s.inventory.wildStrawberry - 1 },
          hunger: Math.min(100, s.hunger + SURVIVOR_BALANCE.EAT_WILD_STRAWBERRY_HUNGER_GAIN),
        }
      }),
    })),
  drinkWater: (survivorId) =>
    set((state) => ({
      survivors: state.survivors.map((s) => {
        if (s.id !== survivorId || s.inventory.water <= 0) return s
        return {
          ...s,
          inventory: { ...s.inventory, water: s.inventory.water - 1 },
          thirst: Math.min(100, s.thirst + SURVIVOR_BALANCE.DRINK_WATER_THIRST_GAIN),
        }
      }),
    })),
  startSearchFood: (survivorId, endAt) =>
    set((state) => ({
      pendingActivities: [
        ...state.pendingActivities,
        { id: genActivityId(), survivorId, type: 'searchFood', endAt },
      ],
    })),
  cancelPendingActivity: (id) =>
    set((state) => {
      const activity = state.pendingActivities.find((a) => a.id === id)
      const phaseClears: Record<string, string | null> = {}
      if (activity && (activity.type === 'restWithSleepingBag' || activity.type === 'restAtPlace')) {
        phaseClears[activity.survivorId] = null
      }
      return {
        pendingActivities: state.pendingActivities.filter((a) => a.id !== id),
        guidelineSatisfyingPhase: { ...state.guidelineSatisfyingPhase, ...phaseClears },
      }
    }),
  completeDueActivities: (now) => {
    const state = get()
    const nowM = toMinutes(now)
    const due = state.pendingActivities.filter((a) => toMinutes(a.endAt) <= nowM)
    if (due.length === 0) return
    const remaining = state.pendingActivities.filter((a) => !due.includes(a))
    const newActivities: PendingActivity[] = [...remaining]
    const phaseClears: Record<string, string | null> = {}

    for (const a of due) {
      if (a.type === 'searchFood') {
        newActivities.push({
          id: genActivityId(),
          survivorId: a.survivorId,
          type: 'searchFood',
          endAt: addMinutesToPoint(now, ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR),
        })
      }
    }

    const survivorUpdates = state.survivors.map((s) => {
      const completedFood = due.filter((a) => a.survivorId === s.id && a.type === 'searchFood')
      const completedRest = due.filter((a) => a.survivorId === s.id && (a.type === 'restWithSleepingBag' || a.type === 'restAtPlace'))
      if (completedFood.length === 0 && completedRest.length === 0) return s
      let updated = { ...s }
      if (completedFood.length > 0) {
        updated = {
          ...updated,
          inventory: {
            ...updated.inventory,
            wildStrawberry: updated.inventory.wildStrawberry + completedFood.length * ACTIVITY_BALANCE.FOOD_SEARCH.WILD_STRAWBERRY_GAIN,
          },
        }
      }
      for (const rest of completedRest) {
        if (rest.type === 'restWithSleepingBag') {
          updated = { ...updated, tiredness: 100 }
          phaseClears[s.id] = null
        }
        if (rest.type === 'restAtPlace') {
          updated = { ...updated, boredom: 100 }
          phaseClears[s.id] = null
        }
      }
      return updated
    })

    set({
      pendingActivities: newActivities,
      survivors: survivorUpdates,
      guidelineSatisfyingPhase: { ...state.guidelineSatisfyingPhase, ...phaseClears },
    })
  },
  decayByMinutes: (gameMinutes) =>
    set((state) => {
      let survivors = decaySurvivors(state.survivors, gameMinutes)
      const gainPerMinute = gameMinutes / 60
      const restSleep = state.pendingActivities.filter((a) => a.type === 'restWithSleepingBag')
      const restPlace = state.pendingActivities.filter((a) => a.type === 'restAtPlace')
      survivors = survivors.map((s) => {
        const sleep = restSleep.find((a) => a.survivorId === s.id)
        const rest = restPlace.find((a) => a.survivorId === s.id)
        let tiredness = s.tiredness
        let boredom = s.boredom
        if (sleep?.sleepingBag) {
          const gainPerHour = SURVIVOR_BALANCE.SLEEPING_BAG_TIREDNESS_GAIN_PER_HOUR[sleep.sleepingBag]
          tiredness = Math.min(100, tiredness + gainPerHour * gainPerMinute)
        }
        if (rest) {
          const gainPerHour = SURVIVOR_BALANCE.REST_PLACE_BOREDOM_GAIN_PER_HOUR
          boredom = Math.min(100, boredom + gainPerHour * gainPerMinute)
        }
        if (tiredness !== s.tiredness || boredom !== s.boredom) {
          return { ...s, tiredness, boredom, status: computeStatusFromStats({ ...s, tiredness, boredom }) }
        }
        return s
      })
      return { survivors }
    }),
  searchWater: (survivorId) =>
    set((state) => ({
      survivors: state.survivors.map((s) => {
        if (s.id !== survivorId) return s
        const gain = randomInRange(ACTIVITY_BALANCE.WATER_SEARCH.GAIN_MIN, ACTIVITY_BALANCE.WATER_SEARCH.GAIN_MAX)
        return {
          ...s,
          inventory: { ...s.inventory, water: s.inventory.water + gain },
        }
      }),
    })),
  searchSurvivor: () =>
    set((state) => ({
      discoveredSurvivorCount: state.discoveredSurvivorCount + 1,
    })),
  doResearch: () =>
    set((state) => ({
      researchProgress: state.researchProgress + ACTIVITY_BALANCE.RESEARCH.PROGRESS_GAIN,
    })),
  addReservedActivity: (survivorId, type) =>
    set((state) => ({
      reservedActivities: [
        ...state.reservedActivities,
        { id: genReservedId(), survivorId, type },
      ],
    })),
  removeReservedActivity: (id) =>
    set((state) => ({
      reservedActivities: state.reservedActivities.filter((a) => a.id !== id),
    })),
  executeReservedActivity: (id) => {
    const state = get()
    const reserved = state.reservedActivities.find((a) => a.id === id)
    if (!reserved) return false

    const { year, hour, minute, advanceByMinutes } = useGameTimeStore.getState()
    const now: GameTimePoint = { year, hour, minute }

    switch (reserved.type) {
      case 'eatWildStrawberry': {
        const survivor = state.survivors.find((s) => s.id === reserved.survivorId)
        if (!survivor || survivor.inventory.wildStrawberry <= 0) return false
        get().eatWildStrawberry(reserved.survivorId)
        break
      }
      case 'drinkWater': {
        const survivor = state.survivors.find((s) => s.id === reserved.survivorId)
        if (!survivor || survivor.inventory.water <= 0) return false
        get().drinkWater(reserved.survivorId)
        break
      }
      case 'searchFood': {
        const endAt = addMinutesToPoint(now, ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR)
        get().startSearchFood(reserved.survivorId, endAt)
        break
      }
      case 'searchWater': {
        advanceByMinutes(ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR)
        get().searchWater(reserved.survivorId)
        break
      }
      case 'searchSurvivor': {
        advanceByMinutes(ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR)
        get().searchSurvivor(reserved.survivorId)
        break
      }
      case 'doResearch':
        get().doResearch(reserved.survivorId)
        break
      case 'restWithSleepingBag': {
        const settings = getSettings()
        const sleepingBag = (settings.guidelinesValues.sleepingBag as SleepingBag) ?? 'sleepingBag1'
        const gainPerHour = SURVIVOR_BALANCE.SLEEPING_BAG_TIREDNESS_GAIN_PER_HOUR[sleepingBag]
        const survivor = state.survivors.find((s) => s.id === reserved.survivorId)
        if (!survivor) return false
        const need = Math.max(0, 100 - survivor.tiredness)
        const hoursNeeded = Math.ceil(need / gainPerHour) || 1
        const endAt = addMinutesToPoint(now, hoursNeeded * GAME_TIME_CONFIG.MINUTES_PER_HOUR)
        set((s) => ({
          pendingActivities: [
            ...s.pendingActivities,
            { id: genActivityId(), survivorId: reserved.survivorId, type: 'restWithSleepingBag', endAt, sleepingBag },
          ],
        }))
        break
      }
      case 'restAtPlace': {
        const settings = getSettings()
        const restPlace = (settings.guidelinesValues.restPlace as RestPlace) ?? 'bareGround'
        const restPlaceStore = useRestPlaceStore.getState()
        const stock = restPlaceStore.getStock(restPlace)
        if (stock <= 0) return false
        if (restPlace !== 'bareGround') {
          restPlaceStore.setStock(restPlace, stock - 1)
        }
        const gainPerHour = SURVIVOR_BALANCE.REST_PLACE_BOREDOM_GAIN_PER_HOUR
        const survivor = state.survivors.find((s) => s.id === reserved.survivorId)
        if (!survivor) return false
        const need = Math.max(0, 100 - survivor.boredom)
        const hoursNeeded = Math.ceil(need / gainPerHour) || 1
        const endAt = addMinutesToPoint(now, hoursNeeded * GAME_TIME_CONFIG.MINUTES_PER_HOUR)
        set((s) => ({
          pendingActivities: [
            ...s.pendingActivities,
            { id: genActivityId(), survivorId: reserved.survivorId, type: 'restAtPlace', endAt, restPlace },
          ],
        }))
        break
      }
    }

    set((s) => ({
      reservedActivities: s.reservedActivities.filter((a) => a.id !== id),
    }))
    return true
  },
  reorderReservedActivities: (survivorId, oldIndex, newIndex) =>
    set((state) => {
      const survivorItems = state.reservedActivities.filter((a) => a.survivorId === survivorId)
      if (survivorItems.length <= 1 || oldIndex < 0 || oldIndex >= survivorItems.length || newIndex < 0 || newIndex >= survivorItems.length) return state
      const reordered = arrayMove(survivorItems, oldIndex, newIndex)
      const globalIndices: number[] = []
      state.reservedActivities.forEach((a, i) => {
        if (a.survivorId === survivorId) globalIndices.push(i)
      })
      const newArray = [...state.reservedActivities]
      globalIndices.forEach((idx, i) => {
        newArray[idx] = reordered[i]
      })
      return { reservedActivities: newArray }
    }),
  insertGuidelineActivitiesIfNeeded: () => {
    const state = get()
    const settings = getSettings()
    const seenSurvivorIds = new Set<string>()
    const newReserved: ReservedActivity[] = []
    const phaseUpdates: Record<string, string | null> = {}

    const hasPendingRest = (survivorId: string, type: 'restWithSleepingBag' | 'restAtPlace') =>
      state.pendingActivities.some((a) => a.survivorId === survivorId && a.type === type)

    const processSurvivor = (survivor: Survivor, firstActivityType?: ReservedActivityType) => {
      const phase = state.guidelineSatisfyingPhase[survivor.id] ?? null
      const result = getGuidelineActivityForSurvivor(survivor, settings, phase)
      if (result.newPhase !== undefined) {
        phaseUpdates[survivor.id] = result.newPhase ?? null
      }
      if (result.activity && firstActivityType !== result.activity) {
        if (result.activity === 'restWithSleepingBag' && hasPendingRest(survivor.id, 'restWithSleepingBag')) return
        if (result.activity === 'restAtPlace' && hasPendingRest(survivor.id, 'restAtPlace')) return
        newReserved.push({ id: genReservedId(), survivorId: survivor.id, type: result.activity })
      }
      return result.activity
    }

    for (const a of state.reservedActivities) {
      if (!seenSurvivorIds.has(a.survivorId)) {
        seenSurvivorIds.add(a.survivorId)
        const survivor = state.survivors.find((s) => s.id === a.survivorId)
        if (survivor) {
          processSurvivor(survivor, a.type)
        }
      }
      newReserved.push(a)
    }

    for (const survivor of state.survivors) {
      if (seenSurvivorIds.has(survivor.id)) continue
      processSurvivor(survivor)
    }

    const hasChanges =
      newReserved.length !== state.reservedActivities.length ||
      Object.keys(phaseUpdates).some((id) => phaseUpdates[id] !== (state.guidelineSatisfyingPhase[id] ?? null))
    if (hasChanges) {
      set({
        reservedActivities: newReserved,
        guidelineSatisfyingPhase: { ...state.guidelineSatisfyingPhase, ...phaseUpdates },
      })
    }
  },
  processReservedActivities: () => {
    get().insertGuidelineActivitiesIfNeeded()
    const state = get()
    const busySurvivorIds = new Set(
      state.pendingActivities.map((a) => a.survivorId)
    )
    const { year, hour, minute } = useGameTimeStore.getState()
    const now: GameTimePoint = { year, hour, minute }
    const nowM = toMinutes(now)

    const survivorIds = [...new Set(state.reservedActivities.map((a) => a.survivorId))]
    const updates: Partial<SurvivorState> = { activityStartTimes: { ...state.activityStartTimes } }
    let startTimesChanged = false

    for (const survivorId of survivorIds) {
      if (busySurvivorIds.has(survivorId)) continue
      const first = state.reservedActivities.find((a) => a.survivorId === survivorId)
      if (!first) continue

      const waitMin = QUEUE_WAIT[first.type] ?? 10
      const record = state.activityStartTimes[survivorId]

      if (!record || record.activityId !== first.id) {
        updates.activityStartTimes![survivorId] = { activityId: first.id, startedAt: now }
        startTimesChanged = true
        continue
      }

      const startM = toMinutes(record.startedAt)
      if (nowM < startM + waitMin) continue

      delete updates.activityStartTimes![survivorId]
      startTimesChanged = true
      get().executeReservedActivity(first.id)
    }

    for (const survivorId of Object.keys(state.activityStartTimes)) {
      const hasReserved = state.reservedActivities.some((a) => a.survivorId === survivorId)
      if (!hasReserved) {
        delete updates.activityStartTimes![survivorId]
        startTimesChanged = true
      }
    }

    if (startTimesChanged) {
      set(updates)
    }
  },
}))
