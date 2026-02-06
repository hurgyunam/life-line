import type { Survivor, SurvivorStatus } from '@/types/survivor'
import { SURVIVOR_BALANCE } from '@/constants/gameConfig'

const STATUS_LOW_THRESHOLD = 30
const STATUS_HIGH_THRESHOLD = 70

/**
 * 수치(배고픔·피곤함·목마름·지루함) 기반으로 생존자 상태를 계산합니다.
 */
export function computeStatusFromStats(s: Survivor): SurvivorStatus {
  const belowLow = [
    s.hunger < STATUS_LOW_THRESHOLD,
    s.tiredness < STATUS_LOW_THRESHOLD,
    s.thirst < STATUS_LOW_THRESHOLD,
    s.boredom < STATUS_LOW_THRESHOLD,
  ]
  const count = belowLow.filter(Boolean).length
  if (count >= 2) return 'stressed'
  if (s.hunger < STATUS_LOW_THRESHOLD) return 'hungry'
  if (s.boredom < STATUS_LOW_THRESHOLD) return 'bored'
  if (s.tiredness < STATUS_LOW_THRESHOLD) return 'tired'
  if (
    s.hunger >= STATUS_HIGH_THRESHOLD &&
    s.tiredness >= STATUS_HIGH_THRESHOLD &&
    s.thirst >= STATUS_HIGH_THRESHOLD &&
    s.boredom >= STATUS_HIGH_THRESHOLD
  )
    return 'satisfied'
  return 'healthy'
}

/**
 * 게임 분 경과에 따라 한 생존자의 수치를 감소시킵니다.
 * gameConfig의 DECAY_PER_GAME_MINUTE 비율을 사용합니다.
 */
export function applyDecayToSurvivor(survivor: Survivor, gameMinutes: number): Survivor {
  const d = SURVIVOR_BALANCE.DECAY_PER_GAME_MINUTE
  const hunger = Math.max(0, survivor.hunger - d.hunger * gameMinutes)
  const tiredness = Math.max(0, survivor.tiredness - d.tiredness * gameMinutes)
  const thirst = Math.max(0, survivor.thirst - d.thirst * gameMinutes)
  const boredom = Math.max(0, survivor.boredom - d.boredom * gameMinutes)
  const updated = { ...survivor, hunger, tiredness, thirst, boredom }
  return { ...updated, status: computeStatusFromStats(updated) }
}

/**
 * 게임 분 경과에 따라 모든 생존자의 수치를 감소시킵니다.
 */
export function decaySurvivors(survivors: Survivor[], gameMinutes: number): Survivor[] {
  return survivors.map((s) => applyDecayToSurvivor(s, gameMinutes))
}
