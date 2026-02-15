/**
 * survivorStore / activityStore 타입 정의
 */

import type { Survivor } from '@/types/survivor'
import type { SleepingBag } from '@/types/sleepingBag'
import type { RestPlace } from '@/types/restPlace'
import type { GameTimePoint } from '@/logic/survivorStoreUtils'

export type { GameTimePoint }

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

/** 예약 활동 */
export interface ReservedActivity {
  id: string
  survivorId: string
  type: ReservedActivityType
}

/** 생존자별 첫 번째 예약 활동의 시작 시각 */
export interface ActivityStartRecord {
  activityId: string
  startedAt: GameTimePoint
}

// ─── survivorStore (욕구만) ────────────────────────────────────────────────────

export interface SurvivorState {
  survivors: Survivor[]
  eatWildStrawberry: (survivorId: string) => void
  drinkWater: (survivorId: string) => void
  decayByMinutes: (gameMinutes: number, pendingActivities: PendingActivity[]) => void
  updateSurvivorStat: (survivorId: string, stat: 'tiredness' | 'boredom', value: number) => void
}

// ─── activityStore (활동 관리) ──────────────────────────────────────────────────

export interface ActivityState {
  pendingActivities: PendingActivity[]
  reservedActivities: ReservedActivity[]
  activityStartTimes: Record<string, ActivityStartRecord>
  guidelineSatisfyingPhase: Record<string, string | null>
  discoveredSurvivorCount: number
  researchProgress: number
  startSearchFood: (survivorId: string, endAt: GameTimePoint) => void
  cancelPendingActivity: (id: string) => void
  completeDueActivities: (now: GameTimePoint) => void
  searchWater: () => void
  searchSurvivor: () => void
  doResearch: () => void
  addReservedActivity: (survivorId: string, type: ReservedActivityType) => void
  removeReservedActivity: (id: string) => void
  executeReservedActivity: (id: string) => boolean
  reorderReservedActivities: (survivorId: string, oldIndex: number, newIndex: number) => void
  insertGuidelineActivitiesIfNeeded: () => void
  processReservedActivities: () => void
  addPendingActivity: (activity: PendingActivity) => void
}
