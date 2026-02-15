/**
 * 진행 중 활동의 0~100% 진행률 계산
 */

import { toMinutes } from '@/logic/survivorStoreUtils';
import {
    GAME_TIME_CONFIG,
    ACTIVITY_BALANCE,
    CONSUMABLE_ACTIVITIES,
} from '@/constants/gameConfig';
import type {
    PendingActivity,
    GameTimePoint,
} from '@/stores/survivorStore.types';

export function getPendingActivityProgress(
    activity: PendingActivity,
    now: GameTimePoint,
): number {
    const nowM = toMinutes(now);
    const endM = toMinutes(activity.endAt);

    switch (activity.type) {
        case 'consumeResource': {
            const key = activity.consumableKey;
            const duration = key
                ? (CONSUMABLE_ACTIVITIES[key]?.durationMinutes ?? 10)
                : 10;
            const startM = endM - duration;
            const elapsed = nowM - startM;
            if (elapsed <= 0) return 0;
            if (elapsed >= duration) return 100;
            return Math.min(100, Math.round((elapsed / duration) * 100));
        }
        case 'searchFood': {
            const duration =
                ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS *
                GAME_TIME_CONFIG.MINUTES_PER_HOUR;
            const startM = endM - duration;
            const elapsed = nowM - startM;
            if (elapsed <= 0) return 0;
            if (elapsed >= duration) return 100;
            return Math.min(100, Math.round((elapsed / duration) * 100));
        }
        case 'restWithSleepingBag':
        case 'restAtPlace':
            return 50;
        default:
            return 0;
    }
}
