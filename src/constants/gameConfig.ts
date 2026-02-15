/**
 * 게임 밸런스 관련 상수 모음
 */

export const GAME_TIME_CONFIG = {
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  MINUTES_PER_TICK_BASE: 6, // 1x 배속 기준 한 틱(100ms)당 지나는 게임 분
} as const

export const ACTIVITY_BALANCE = {
  // 음식 찾아보기
  FOOD_SEARCH: {
    DURATION_HOURS: 1,
    CARROT_GAIN: 1,
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
  EAT_CARROT_HUNGER_GAIN: 15,
  DRINK_WATER_THIRST_GAIN: 15,
  
  // 초기 인벤토리
  INITIAL_INVENTORY: {
    CARROT: 10,
    WATER: 10,
  },
} as const

/** 캠프 자원 분류 및 종류 */
export const CAMP_RESOURCES = {
  /** 건축/조합용 자원 */
  CONSTRUCTION: ['wood', 'stone', 'ironOre', 'cotton', 'leather'] as const,
  /** 소비용 자원 */
  CONSUMABLE: {
    water: 'water',
    food: ['wildStrawberry', 'potato', 'corn', 'wheat'] as const,
  },
} as const

/** 캠프 자원 초기 수량 */
export const CAMP_RESOURCES_INITIAL: Record<string, number> = {
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
