/**
 * 활동 이펙트 레지스트리
 *
 * 활동 실행 시 발생하는 부수 효과(survivor 욕구 업데이트, 캠프 재고 변경 등)를
 * activityStore에서 직접 참조하지 않고 실행할 수 있게 합니다.
 *
 * - activityStore는 이펙트 타입과 payload만 전달
 * - 실제 구현은 activityEffectHandlers에서 등록 (survivorStore, campResourceStore 등 주입)
 * - 결합도를 낮추고 테스트 시 mock 주입 가능
 */

import type { ReservedActivityType } from '@/stores/survivorStore.types'

/** 활동 실행 이펙트 payload */
export type ActivityEffectPayload = {
  type: ReservedActivityType
  survivorId: string
  /** restWithSleepingBag, restAtPlace에서 필요 */
  now?: { year: number; hour: number; minute: number }
}

/** 생존자 스탯 업데이트 이펙트 (completeDueActivities 등에서 사용) */
export type UpdateSurvivorStatPayload = {
  survivorId: string
  stat: 'tiredness' | 'boredom'
  value: number
}

export type ActivityEffectHandler = (payload: ActivityEffectPayload) => boolean
export type UpdateSurvivorStatHandler = (payload: UpdateSurvivorStatPayload) => void

const activityHandlers = new Map<ReservedActivityType, ActivityEffectHandler>()
let updateSurvivorStatHandler: UpdateSurvivorStatHandler | null = null

/** 활동 타입별 이펙트 핸들러 등록 */
export function registerActivityEffect(
  type: ReservedActivityType,
  handler: ActivityEffectHandler
): void {
  activityHandlers.set(type, handler)
}

/** 생존자 스탯 업데이트 핸들러 등록 (completeDueActivities용) */
export function registerUpdateSurvivorStat(handler: UpdateSurvivorStatHandler): void {
  updateSurvivorStatHandler = handler
}

/** 활동 이펙트 실행 */
export function runActivityEffect(payload: ActivityEffectPayload): boolean {
  const handler = activityHandlers.get(payload.type)
  if (!handler) return false
  return handler(payload)
}

/** 생존자 스탯 업데이트 실행 */
export function runUpdateSurvivorStat(payload: UpdateSurvivorStatPayload): void {
  updateSurvivorStatHandler?.(payload)
}
