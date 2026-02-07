/**
 * 행동 지침 조건 확인 및 해당 활동 타입 반환
 * guidelinesOrder 순서대로 조건을 확인하여, 첫 번째 부합하는 지침의 활동을 반환합니다.
 */

import type { Survivor } from '@/types/survivor'
import type { GameSettings } from '@/utils/gameStorage'
import type { ReservedActivityType } from '@/stores/survivorStore'
import type { FoodResource } from '@/types/resource'
import type { RestPlace } from '@/types/restPlace'
import { useRestPlaceStore } from '@/stores/restPlaceStore'

/** 행동 지침에서 파생되는 활동 타입 (일부는 기존 타입과 동일) */
export type GuidelineActivityType =
  | 'eatWildStrawberry'
  | 'eatFood' // potato, corn, wheat 등 (캠프 자원)
  | 'drinkWater'
  | 'restWithSleepingBag'
  | 'restAtPlace'

/** 욕구 충족 수치 (꽉 참 = 100). 이 값에 도달하면 충족 완료 */
const NEED_SATISFACTION_TARGET = 100

/** canExecuteGuideline 결과 */
interface GuidelineCheckResult {
  canExecute: boolean
  activityType: GuidelineActivityType
  /** 욕구가 100이 되어 이 지침 완료 → phase 초기화 필요 */
  shouldClearPhase: boolean
}

/**
 * 생존자가 해당 지침 조건에 부합하는지 확인.
 * - threshold 이하: 대기하다가 threshold 이하가 되면 행동 시작
 * - 행동 중: 해당 욕구가 100이 될 때까지 계속 반복
 * - 100 도달: 충족 완료, 다시 threshold 이하가 될 때까지 대기
 */
function canExecuteGuideline(
  survivor: Survivor,
  guidelineKey: string,
  settings: GameSettings,
  satisfyingPhase: string | null
): GuidelineCheckResult {
  const values = settings.guidelinesValues
  const noMatch = (at: GuidelineActivityType): GuidelineCheckResult => ({
    canExecute: false,
    activityType: at,
    shouldClearPhase: false,
  })
  const clearAndNo = (at: GuidelineActivityType): GuidelineCheckResult => ({
    canExecute: false,
    activityType: at,
    shouldClearPhase: true,
  })

  switch (guidelineKey) {
    case 'hungerThreshold': {
      const threshold = (values.hungerThreshold as number) ?? 30
      const foodResource = (values.foodResource as FoodResource) ?? 'wildStrawberry'
      if (survivor.hunger >= NEED_SATISFACTION_TARGET) return clearAndNo('eatWildStrawberry')
      const inPhase = satisfyingPhase === 'hungerThreshold'
      const atOrBelowThreshold = survivor.hunger <= threshold
      if (!inPhase && !atOrBelowThreshold) return noMatch('eatWildStrawberry')
      if (foodResource === 'wildStrawberry') {
        return {
          canExecute: survivor.inventory.wildStrawberry > 0,
          activityType: 'eatWildStrawberry',
          shouldClearPhase: false,
        }
      }
      return noMatch('eatFood')
    }
    case 'thirstThreshold': {
      const threshold = (values.thirstThreshold as number) ?? 30
      if (survivor.thirst >= NEED_SATISFACTION_TARGET) return clearAndNo('drinkWater')
      const inPhase = satisfyingPhase === 'thirstThreshold'
      const atOrBelowThreshold = survivor.thirst <= threshold
      if (!inPhase && !atOrBelowThreshold) return noMatch('drinkWater')
      return {
        canExecute: survivor.inventory.water > 0,
        activityType: 'drinkWater',
        shouldClearPhase: false,
      }
    }
    case 'tirednessThreshold': {
      const threshold = (values.tirednessThreshold as number) ?? 30
      if (survivor.tiredness >= NEED_SATISFACTION_TARGET) return clearAndNo('restWithSleepingBag')
      const inPhase = satisfyingPhase === 'tirednessThreshold'
      const atOrBelowThreshold = survivor.tiredness <= threshold
      if (!inPhase && !atOrBelowThreshold) return noMatch('restWithSleepingBag')
      return { canExecute: true, activityType: 'restWithSleepingBag', shouldClearPhase: false }
    }
    case 'boredomThreshold': {
      const threshold = (values.boredomThreshold as number) ?? 30
      const restPlace = (values.restPlace as RestPlace) ?? 'bareGround'
      if (survivor.boredom >= NEED_SATISFACTION_TARGET) return clearAndNo('restAtPlace')
      const inPhase = satisfyingPhase === 'boredomThreshold'
      const atOrBelowThreshold = survivor.boredom <= threshold
      if (!inPhase && !atOrBelowThreshold) return noMatch('restAtPlace')
      const stock = useRestPlaceStore.getState().getStock(restPlace)
      return {
        canExecute: stock > 0,
        activityType: 'restAtPlace',
        shouldClearPhase: false,
      }
    }
    default:
      return { canExecute: false, activityType: 'eatWildStrawberry', shouldClearPhase: false }
  }
}

/** GuidelineActivityType → ReservedActivityType 매핑 (실제 store에 있는 타입) */
export function toReservedActivityType(
  activity: GuidelineActivityType,
  _settings: GameSettings
): ReservedActivityType | null {
  switch (activity) {
    case 'eatWildStrawberry':
      return 'eatWildStrawberry'
    case 'eatFood':
      return null // 아직 미구현
    case 'drinkWater':
      return 'drinkWater'
    case 'restWithSleepingBag':
      return 'restWithSleepingBag'
    case 'restAtPlace':
      return 'restAtPlace'
  }
}

export interface GuidelineResult {
  activity: ReservedActivityType | null
  /** 추가했을 때: guidelineKey. 완료(100 도달)했을 때: null. 대기 중: 기존값 유지 */
  newPhase: string | null | undefined
}

/**
 * 행동 지침 순서대로 조건을 확인하여, 첫 번째 부합하는 지침의 예약 활동 타입을 반환합니다.
 * - threshold 이하가 되면 행동 시작
 * - 행동 중(phase 설정됨)이면 욕구 100이 될 때까지 계속
 * - 100 도달 시 phase 초기화, 다시 threshold 이하 대기
 */
export function getGuidelineActivityForSurvivor(
  survivor: Survivor,
  settings: GameSettings,
  satisfyingPhase: string | null
): GuidelineResult {
  const order = settings.guidelinesOrder ?? [
    'hungerThreshold',
    'tirednessThreshold',
    'thirstThreshold',
    'boredomThreshold',
  ]

  for (const key of order) {
    const result = canExecuteGuideline(survivor, key, settings, satisfyingPhase)
    if (result.shouldClearPhase && satisfyingPhase === key) {
      return { activity: null, newPhase: null }
    }
    if (result.canExecute) {
      const reserved = toReservedActivityType(result.activityType, settings)
      return { activity: reserved, newPhase: key }
    }
  }
  return { activity: null, newPhase: undefined }
}
