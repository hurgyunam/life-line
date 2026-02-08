/**
 * 게임 밸런스 관련 상수 모음
 */

import type { CampResource } from '@/types/resource';

export const GAME_TIME_CONFIG = {
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    MINUTES_PER_TICK_BASE: 6, // 1x 배속 기준 한 틱(100ms)당 지나는 게임 분
} as const;

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

    /** 예약 활동 → 실행까지 대기 시간 (게임 분). 활동 예약 목록에 보여지는 시간 */
    QUEUE_WAIT_MINUTES: {
        eatWildStrawberry: 10,
        drinkWater: 5,
        searchFood: 15,
        searchWater: 15,
        searchSurvivor: 30,
        doResearch: 30,
        restWithSleepingBag: 30,
        restAtPlace: 15,
    },
} as const;

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

    /** 생존자 1명당 초기 재고 (캠프 재고 합산용) */
    INITIAL_STOCK_PER_SURVIVOR: {
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
  
    /** 침낭별 시간당 피곤함 회복량 (1시간에 N 회복) */
    SLEEPING_BAG_TIREDNESS_GAIN_PER_HOUR: {
        sleepingBag1: 20,
        sleepingBag2: 30,
        sleepingBag3: 40,
    },

    /** 휴식 장소 시간당 지루함 회복량 (1시간에 N 회복) */
    REST_PLACE_BOREDOM_GAIN_PER_HOUR: 20,
} as const;

/** 테크 트리 레이아웃 (절대 좌표 없이 계산용) */
export const TECH_TREE_LAYOUT = {
    NODE_WIDTH: 64,
    NODE_HEIGHT: 64,
    TIER_GAP: 48,
    NODE_GAP: 24,
} as const;

/** 자동 저장 주기 옵션 (분 단위, 0 = 끄기) */
export const AUTO_SAVE_INTERVAL_OPTIONS = [0, 1, 3, 5, 10] as const;
export type AutoSaveIntervalMinutes = (typeof AUTO_SAVE_INTERVAL_OPTIONS)[number]

/** 새 게임 시작 시 캠프 자원 초기 수량 (생존자들은 재고에서 바로 사용) */
const INITIAL_SURVIVOR_COUNT = 8;
export const CAMP_RESOURCES_INITIAL: Record<CampResource, number> = {
    wood: 0,
    stone: 0,
    ironOre: 0,
    cotton: 0,
    leather: 0,
    water: INITIAL_SURVIVOR_COUNT * SURVIVOR_BALANCE.INITIAL_STOCK_PER_SURVIVOR.WATER,
    wildStrawberry: INITIAL_SURVIVOR_COUNT * SURVIVOR_BALANCE.INITIAL_STOCK_PER_SURVIVOR.WILD_STRAWBERRY,
    potato: 0,
    corn: 0,
    wheat: 0,
};
