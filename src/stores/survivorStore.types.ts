/**
 * survivorStore / activityStore 타입 정의
 */

import type { Survivor } from '@/types/survivor';
import type { SleepingBag } from '@/types/sleepingBag';
import type { RestPlace } from '@/types/restPlace';
import type { GameTimePoint } from '@/logic/survivorStoreUtils';

export type { GameTimePoint };

import type { ConsumableResource } from '@/types/resource';

/** 진행 중 활동 (시간이 지나면 완료 처리) */
export interface PendingActivity {
    id: string;
    survivorId: string;
    type:
        | 'searchFood'
        | 'restWithSleepingBag'
        | 'restAtPlace'
        | 'consumeResource';
    endAt: GameTimePoint;
    sleepingBag?: SleepingBag;
    restPlace?: RestPlace;
    /** consumeResource일 때: 어떤 자원을 소비 중인지 */
    consumableKey?: ConsumableResource;
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
    | 'restAtPlace';

/** 예약 활동 */
export interface ReservedActivity {
    id: string;
    survivorId: string;
    type: ReservedActivityType;
    /** 지침에 의해 자동 추가된 경우 해당 지침 키 (활동 로그에 이유 표시용) */
    guidelineKey?: string;
    /** 예약한 순간의 지침 값 (로그에 바꾸기 전 정보로 남기기 위함) */
    reasonParams?: Record<string, string | number>;
}

/** 생존자별 첫 번째 예약 활동의 시작 시각 */
export interface ActivityStartRecord {
    activityId: string;
    startedAt: GameTimePoint;
}

/** 활동 로그 한 줄 (개척왕 N년 HH시 MM분 이름이 OOO을 시작함) */
export interface ActivityLogEntry {
    at: GameTimePoint;
    survivorId: string;
    type: ReservedActivityType;
    /** 행동을 한 이유 (지침 키). 표시 시 activityLog.reason[reasonKey] 사용 */
    reasonKey?: string;
    /** 이유 문구에 넣을 값 (threshold, foodResource, restPlace 등) */
    reasonParams?: Record<string, string | number>;
}

// ─── survivorStore (욕구만) ────────────────────────────────────────────────────

export interface SurvivorState {
    survivors: Survivor[];
    eatWildStrawberry: (survivorId: string) => void;
    drinkWater: (survivorId: string) => void;
    applyConsumableBenefit: (
        survivorId: string,
        consumableKey: ConsumableResource,
    ) => void;
    decayByMinutes: (
        gameMinutes: number,
        pendingActivities: PendingActivity[],
    ) => void;
    updateSurvivorStat: (
        survivorId: string,
        stat: 'tiredness' | 'boredom',
        value: number,
    ) => void;
}

// ─── activityStore (활동 관리) ──────────────────────────────────────────────────

export interface ActivityState {
    pendingActivities: PendingActivity[];
    reservedActivities: ReservedActivity[];
    activityLogEntries: ActivityLogEntry[];
    activityStartTimes: Record<string, ActivityStartRecord>;
    guidelineSatisfyingPhase: Record<string, string | null>;
    discoveredSurvivorCount: number;
    researchProgress: number;
    startSearchFood: (survivorId: string, endAt: GameTimePoint) => void;
    cancelPendingActivity: (id: string) => void;
    completeDueActivities: (now: GameTimePoint) => void;
    searchWater: () => void;
    searchSurvivor: () => void;
    doResearch: () => void;
    addReservedActivity: (
        survivorId: string,
        type: ReservedActivityType,
    ) => void;
    removeReservedActivity: (id: string) => void;
    executeReservedActivity: (id: string) => boolean;
    reorderReservedActivities: (
        survivorId: string,
        oldIndex: number,
        newIndex: number,
    ) => void;
    insertGuidelineActivitiesIfNeeded: () => void;
    processReservedActivities: () => void;
    addPendingActivity: (activity: PendingActivity) => void;
    addActivityLogEntry: (entry: ActivityLogEntry) => void;
}
