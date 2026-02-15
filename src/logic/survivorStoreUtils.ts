/**
 * survivorStore에서 사용하는 유틸리티
 */

import { GAME_TIME_CONFIG } from '@/constants/gameConfig'

/** 게임 시각 (진행 중 활동 완료 시점 비교용) */
export interface GameTimePoint {
  year: number
  hour: number
  minute: number
}

export function toMinutes(t: GameTimePoint): number {
  return (
    t.year * GAME_TIME_CONFIG.HOURS_PER_DAY * GAME_TIME_CONFIG.MINUTES_PER_HOUR +
    t.hour * GAME_TIME_CONFIG.MINUTES_PER_HOUR +
    t.minute
  )
}

export function addMinutesToPoint(t: GameTimePoint, minutes: number): GameTimePoint {
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

export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── ID 생성기 (세이브 로드 시 sync 함수로 동기화) ──────────────────────────────

let nextActivityId = 1
let nextReservedId = 1

export function genActivityId(): string {
  return `activity-${nextActivityId++}`
}

export function genReservedId(): string {
  return `reserved-${nextReservedId++}`
}

export function syncNextActivityId(activities: { id: string }[]): void {
  const max = activities.reduce((acc, a) => {
    const n = parseInt(a.id.replace('activity-', ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  nextActivityId = max + 1
}

export function syncNextReservedId(activities: { id: string }[]): void {
  const max = activities.reduce((acc, a) => {
    const n = parseInt(a.id.replace('reserved-', ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  nextReservedId = max + 1
}
