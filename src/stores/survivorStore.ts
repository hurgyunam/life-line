import { create } from 'zustand'
import type { Survivor } from '@/types/survivor'
import { GAME_TIME_CONFIG, ACTIVITY_BALANCE, SURVIVOR_BALANCE } from '@/constants/gameConfig'

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
  type: 'searchFood'
  endAt: GameTimePoint
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
  { id: '1', name: '김민수', age: 32, status: 'healthy', currentAction: 'farming_wildStrawberries', hunger: 85, tiredness: 70, thirst: 90, boredom: 75, inventory: { ...defaultInventory } },
  { id: '2', name: '이서연', age: 28, status: 'bored', currentAction: 'mining_stones', hunger: 60, tiredness: 55, thirst: 45, boredom: 30, inventory: { ...defaultInventory } },
  { id: '3', name: '박준호', age: 45, status: 'hungry', currentAction: 'cooking', hunger: 20, tiredness: 65, thirst: 50, boredom: 65, inventory: { ...defaultInventory } },
  { id: '4', name: '최지은', age: 24, status: 'tired', currentAction: 'resting', hunger: 75, tiredness: 25, thirst: 80, boredom: 55, inventory: { ...defaultInventory } },
  { id: '5', name: '정현우', age: 38, status: 'satisfied', currentAction: 'chopping_wood', hunger: 90, tiredness: 80, thirst: 85, boredom: 90, inventory: { ...defaultInventory } },
  { id: '6', name: '한소희', age: 29, status: 'stressed', currentAction: 'sleeping', hunger: 50, tiredness: 15, thirst: 70, boredom: 50, inventory: { ...defaultInventory } },
  { id: '7', name: '강민준', age: 41, status: 'healthy', currentAction: 'researching', hunger: 70, tiredness: 60, thirst: 65, boredom: 80, inventory: { ...defaultInventory } },
  { id: '8', name: '윤수아', age: 26, status: 'bored', currentAction: 'waiting', hunger: 55, tiredness: 50, thirst: 40, boredom: 25, inventory: { ...defaultInventory } },
]

interface SurvivorState {
  survivors: Survivor[]
  /** 진행 중 활동 (1시간 지나면 완료) */
  pendingActivities: PendingActivity[]
  /** 발견한 생존자 수 (또 다른 생존자 찾아보기) */
  discoveredSurvivorCount: number
  /** 연구 진행도 */
  researchProgress: number
  eatWildStrawberry: (survivorId: string) => void
  drinkWater: (survivorId: string) => void
  /** 음식 찾기 시작 — 1시간 후 완료 시 야생 딸기 1개 추가 */
  startSearchFood: (survivorId: string, endAt: GameTimePoint) => void
  /** 현재 시각 기준으로 만료된 진행 중 활동 완료 처리 */
  completeDueActivities: (now: GameTimePoint) => void
  searchWater: (survivorId: string) => void
  searchSurvivor: (survivorId: string) => void
  doResearch: (survivorId: string) => void
}

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let nextActivityId = 1
function genActivityId() {
  return `activity-${nextActivityId++}`
}

export const useSurvivorStore = create<SurvivorState>((set, get) => ({
  survivors: initialSurvivors,
  pendingActivities: [],
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
  completeDueActivities: (now) => {
    const state = get()
    const nowM = toMinutes(now)
    const due = state.pendingActivities.filter((a) => toMinutes(a.endAt) <= nowM)
    if (due.length === 0) return
    const remaining = state.pendingActivities.filter((a) => !due.includes(a))
    const newActivities: PendingActivity[] = [...remaining]
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
    set({
      pendingActivities: newActivities,
      survivors: state.survivors.map((s) => {
        const completed = due.filter((a) => a.survivorId === s.id && a.type === 'searchFood')
        if (completed.length === 0) return s
        return {
          ...s,
          inventory: {
            ...s.inventory,
            wildStrawberry: s.inventory.wildStrawberry + completed.length * ACTIVITY_BALANCE.FOOD_SEARCH.WILD_STRAWBERRY_GAIN,
          },
        }
      }),
    })
  },
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
}))
