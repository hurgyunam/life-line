/**
 * 게임 밸런스 관련 상수 모음
 */

import type { CampResource } from '@/types/resource'

export const GAME_TIME_CONFIG = {
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  MINUTES_PER_TICK_BASE: 6, // 1x 배속 기준 한 틱(100ms)당 지나는 게임 분
} as const

export const ACTIVITY_BALANCE = {
  // 음식 찾아보기
  FOOD_SEARCH: {
    DURATION_HOURS: 1,
    WILD_STRAWBERRY_GAIN: 1,
  },
  // 식수 찾아보기
  WATER_SEARCH: {
    DURATION_HOURS: 1,
    GAIN_MIN: 1,
    GAIN_MAX: 3,
  },
  // 생존자 찾아보기
  SURVIVOR_SEARCH: {
    DURATION_HOURS: 6,
  },
  // 연구하기
  RESEARCH: {
    PROGRESS_GAIN: 1,
  },
} as const

export const SURVIVOR_BALANCE = {
  // 아이템 사용 효과
  EAT_WILD_STRAWBERRY_HUNGER_GAIN: 15,
  DRINK_WATER_THIRST_GAIN: 15,

  /** 게임 분당 수치 감소량 (배속에 따라 비례 적용) */
  DECAY_PER_GAME_MINUTE: {
    hunger: 0.1,
    tiredness: 0.08,
    thirst: 0.12,
    boredom: 0.06,
  },

  // 초기 인벤토리
  INITIAL_INVENTORY: {
    WILD_STRAWBERRY: 10,
    WATER: 10,
  },
  
  // 식량별 배고픔 회복량
  FOOD_HUNGER_GAIN: {
    wildStrawberry: 15,
    potato: 20,
    corn: 25,
    wheat: 30,
  },
  
  // 침낭별 피곤함 회복량
  SLEEPING_BAG_TIREDNESS_GAIN: {
    sleepingBag1: 20,
    sleepingBag2: 30,
    sleepingBag3: 40,
  },
} as const

/** 자동 저장 주기 옵션 (분 단위, 0 = 끄기) */
export const AUTO_SAVE_INTERVAL_OPTIONS = [0, 1, 3, 5, 10] as const
export type AutoSaveIntervalMinutes = (typeof AUTO_SAVE_INTERVAL_OPTIONS)[number]

/** 캠프 자원 초기 수량 */
export const CAMP_RESOURCES_INITIAL: Record<CampResource, number> = {
  wood: 0,
  stone: 0,
  ironOre: 0,
  cotton: 0,
  leather: 0,
  water: 0,
  wildStrawberry: 0,
  potato: 0,
  corn: 0,
  wheat: 0,
}
