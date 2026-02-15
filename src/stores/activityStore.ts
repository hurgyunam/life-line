/**
 * 활동 관리 스토어 (예약/진행 중 활동, 지침, 연구 등)
 *
 * survivorStore를 직접 import하지 않습니다.
 * 욕구 관련 부수 효과는 activityEffectRegistry.runActivityEffect()로 실행합니다.
 */

import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'
import type { Survivor } from '@/types/survivor'
import { GAME_TIME_CONFIG, ACTIVITY_BALANCE } from '@/constants/gameConfig'
import { getGuidelineActivityForSurvivor } from '@/logic/guidelineActivities'
import { getSettings } from '@/utils/gameStorage'
import { useGameTimeStore } from '@/stores/gameTimeStore'
import { runActivityEffect, runUpdateSurvivorStat } from '@/effects/activityEffectRegistry'
import {
  toMinutes,
  addMinutesToPoint,
  randomInRange,
  genActivityId,
  genReservedId,
  syncNextActivityId,
  syncNextReservedId,
} from '@/logic/survivorStoreUtils'
import { useCampResourceStore } from '@/stores/campResourceStore'
import { useSurvivorStore } from '@/stores/survivorStore'
import type {
  ActivityState,
  PendingActivity,
  ReservedActivity,
  ReservedActivityType,
  GameTimePoint,
} from '@/stores/survivorStore.types'

// Re-export for consumers
export type { GameTimePoint, PendingActivity, ReservedActivity, ReservedActivityType }
export { syncNextActivityId, syncNextReservedId }

const QUEUE_WAIT = ACTIVITY_BALANCE.QUEUE_WAIT_MINUTES

export const useActivityStore = create<ActivityState>((set, get) => ({
  pendingActivities: [],
  reservedActivities: [],
  activityStartTimes: {},
  guidelineSatisfyingPhase: {},
  discoveredSurvivorCount: 0,
  researchProgress: 0,

  addPendingActivity: (activity) => {
    set((s) => ({ pendingActivities: [...s.pendingActivities, activity] }))
  },

  startSearchFood: (survivorId, endAt) => {
    set((s) => ({
      pendingActivities: [...s.pendingActivities, { id: genActivityId(), survivorId, type: 'searchFood', endAt }],
    }))
  },

  cancelPendingActivity: (id) => {
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
    })
  },

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

    for (const a of due) {
      if (a.type === 'searchFood') {
        useCampResourceStore
          .getState()
          .addQuantity('wildStrawberry', ACTIVITY_BALANCE.FOOD_SEARCH.WILD_STRAWBERRY_GAIN)
      }
      if (a.type === 'restWithSleepingBag' || a.type === 'restAtPlace') {
        runUpdateSurvivorStat({
          survivorId: a.survivorId,
          stat: a.type === 'restWithSleepingBag' ? 'tiredness' : 'boredom',
          value: 100,
        })
        phaseClears[a.survivorId] = null
      }
    }

    set({
      pendingActivities: newActivities,
      guidelineSatisfyingPhase: { ...state.guidelineSatisfyingPhase, ...phaseClears },
    })
  },

  searchWater: () => {
    const gain = randomInRange(ACTIVITY_BALANCE.WATER_SEARCH.GAIN_MIN, ACTIVITY_BALANCE.WATER_SEARCH.GAIN_MAX)
    useCampResourceStore.getState().addQuantity('water', gain)
  },

  searchSurvivor: () => {
    set((s) => ({ discoveredSurvivorCount: s.discoveredSurvivorCount + 1 }))
  },

  doResearch: () => {
    set((s) => ({ researchProgress: s.researchProgress + ACTIVITY_BALANCE.RESEARCH.PROGRESS_GAIN }))
  },

  addReservedActivity: (survivorId, type) => {
    set((s) => ({ reservedActivities: [...s.reservedActivities, { id: genReservedId(), survivorId, type }] }))
  },

  removeReservedActivity: (id) => {
    set((s) => ({ reservedActivities: s.reservedActivities.filter((a) => a.id !== id) }))
  },

  executeReservedActivity: (id) => {
    const state = get()
    const reserved = state.reservedActivities.find((a) => a.id === id)
    if (!reserved) return false

    const { year, hour, minute } = useGameTimeStore.getState()
    const now = { year, hour, minute }

    const success = runActivityEffect({
      type: reserved.type,
      survivorId: reserved.survivorId,
      now,
    })

    if (success) {
      set((s) => ({ reservedActivities: s.reservedActivities.filter((a) => a.id !== id) }))
    }
    return success
  },

  reorderReservedActivities: (survivorId, oldIndex, newIndex) => {
    set((state) => {
      const survivorItems = state.reservedActivities.filter((a) => a.survivorId === survivorId)
      const validRange =
        survivorItems.length > 1 &&
        oldIndex >= 0 &&
        oldIndex < survivorItems.length &&
        newIndex >= 0 &&
        newIndex < survivorItems.length
      if (!validRange) return state
      const reordered = arrayMove(survivorItems, oldIndex, newIndex)
      const globalIndices = state.reservedActivities
        .map((a, i) => (a.survivorId === survivorId ? i : -1))
        .filter((i) => i >= 0)
      const newArray = [...state.reservedActivities]
      globalIndices.forEach((idx, i) => {
        newArray[idx] = reordered[i]
      })
      return { reservedActivities: newArray }
    })
  },

  insertGuidelineActivitiesIfNeeded: () => {
    const state = get()
    const settings = getSettings()
    const survivors = useSurvivorStore.getState().survivors
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
        const survivor = survivors.find((s) => s.id === a.survivorId)
        if (survivor) processSurvivor(survivor, a.type)
      }
      newReserved.push(a)
    }
    for (const survivor of survivors) {
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
    const busySurvivorIds = new Set(state.pendingActivities.map((a) => a.survivorId))
    const { year, hour, minute } = useGameTimeStore.getState()
    const now: GameTimePoint = { year, hour, minute }
    const nowM = toMinutes(now)
    const survivorIds = [...new Set(state.reservedActivities.map((a) => a.survivorId))]
    const updates: Partial<ActivityState> = { activityStartTimes: { ...state.activityStartTimes } }
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
      if (nowM < toMinutes(record.startedAt) + waitMin) continue

      delete updates.activityStartTimes![survivorId]
      startTimesChanged = true
      get().executeReservedActivity(first.id)
    }

    for (const survivorId of Object.keys(state.activityStartTimes)) {
      if (!state.reservedActivities.some((a) => a.survivorId === survivorId)) {
        delete updates.activityStartTimes![survivorId]
        startTimesChanged = true
      }
    }

    if (startTimesChanged) {
      set(updates)
    }
  },
}))
