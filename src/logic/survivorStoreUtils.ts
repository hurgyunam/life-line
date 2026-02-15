/**
 * survivorStore에서 사용하는 유틸리티
 */

import { GAME_TIME_CONFIG } from '@/constants/gameConfig';

const MINUTES_PER_DAY =
    GAME_TIME_CONFIG.HOURS_PER_DAY * GAME_TIME_CONFIG.MINUTES_PER_HOUR;
const DAYS_PER_YEAR =
    GAME_TIME_CONFIG.MONTHS_PER_YEAR * GAME_TIME_CONFIG.DAYS_PER_MONTH;

/** 게임 시각 (년/월/일/시/분). 월·일은 1부터 시작 */
export interface GameTimePoint {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
}

/** 기준 시각(1년 1월 1일 0시 0분)부터의 경과 분 */
export function toMinutes(t: GameTimePoint): number {
    const days =
        (t.year - 1) * DAYS_PER_YEAR +
        (t.month - 1) * GAME_TIME_CONFIG.DAYS_PER_MONTH +
        (t.day - 1);
    return (
        days * MINUTES_PER_DAY +
        t.hour * GAME_TIME_CONFIG.MINUTES_PER_HOUR +
        t.minute
    );
}

/** 경과 분을 GameTimePoint로 변환 */
export function minutesToPoint(totalMinutes: number): GameTimePoint {
    let rest = Math.max(0, Math.floor(totalMinutes));
    const minute = rest % GAME_TIME_CONFIG.MINUTES_PER_HOUR;
    rest = Math.floor(rest / GAME_TIME_CONFIG.MINUTES_PER_HOUR);
    const hour = rest % GAME_TIME_CONFIG.HOURS_PER_DAY;
    rest = Math.floor(rest / GAME_TIME_CONFIG.HOURS_PER_DAY);
    const day0 = rest % GAME_TIME_CONFIG.DAYS_PER_MONTH;
    rest = Math.floor(rest / GAME_TIME_CONFIG.DAYS_PER_MONTH);
    const month0 = rest % GAME_TIME_CONFIG.MONTHS_PER_YEAR;
    rest = Math.floor(rest / GAME_TIME_CONFIG.MONTHS_PER_YEAR);
    return {
        year: rest + 1,
        month: month0 + 1,
        day: day0 + 1,
        hour,
        minute,
    };
}

export function addMinutesToPoint(
    t: GameTimePoint,
    minutes: number,
): GameTimePoint {
    return minutesToPoint(toMinutes(t) + minutes);
}

export function randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── ID 생성기 (세이브 로드 시 sync 함수로 동기화) ──────────────────────────────

let nextActivityId = 1;
let nextReservedId = 1;

export function genActivityId(): string {
    return `activity-${nextActivityId++}`;
}

export function genReservedId(): string {
    return `reserved-${nextReservedId++}`;
}

export function syncNextActivityId(activities: { id: string }[]): void {
    const max = activities.reduce((acc, a) => {
        const n = parseInt(a.id.replace('activity-', ''), 10);
        return isNaN(n) ? acc : Math.max(acc, n);
    }, 0);
    nextActivityId = max + 1;
}

export function syncNextReservedId(activities: { id: string }[]): void {
    const max = activities.reduce((acc, a) => {
        const n = parseInt(a.id.replace('reserved-', ''), 10);
        return isNaN(n) ? acc : Math.max(acc, n);
    }, 0);
    nextReservedId = max + 1;
}
