/**
 * 활동 관리 스토어 (예약/진행 중 활동, 지침, 연구 등)
 *
 * survivorStore를 직접 import하지 않습니다.
 * 욕구 관련 부수 효과는 activityEffectRegistry.runActivityEffect()로 실행합니다.
 */

import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { Survivor } from '@/types/survivor';
import {
    GAME_TIME_CONFIG,
    ACTIVITY_BALANCE,
    CONSUMABLE_ACTIVITIES,
    GUIDELINES_DEFAULT,
} from '@/constants/gameConfig';
import { getGuidelineActivityForSurvivor } from '@/logic/guidelineActivities';
import { getSurvivalInstinctActivity } from '@/logic/survivalInstinct';
import { getSettings } from '@/utils/gameStorage';
import { useGameTimeStore } from '@/stores/gameTimeStore';
import {
    runActivityEffect,
    runUpdateSurvivorStat,
} from '@/effects/activityEffectRegistry';
import {
    toMinutes,
    addMinutesToPoint,
    randomInRange,
    genActivityId,
    genReservedId,
    syncNextActivityId,
    syncNextReservedId,
} from '@/logic/survivorStoreUtils';
import { useCampResourceStore } from '@/stores/campResourceStore';
import { useSurvivorStore } from '@/stores/survivorStore';
import type {
    ActivityState,
    ActivityLogEntry,
    PendingActivity,
    ReservedActivity,
    ReservedActivityType,
    GameTimePoint,
} from '@/stores/survivorStore.types';

// Re-export for consumers
export type {
    GameTimePoint,
    PendingActivity,
    ReservedActivity,
    ReservedActivityType,
    ActivityLogEntry,
};
export { syncNextActivityId, syncNextReservedId };

const QUEUE_WAIT = ACTIVITY_BALANCE.QUEUE_WAIT_MINUTES;

const MAX_LOG_ENTRIES = 300;

/** 지침 키와 설정으로 로그 이유용 params 생성 (예약 시점 값 보존용) */
function buildReasonParams(
    guidelineKey: string | undefined,
    v: Record<string, number | string>,
): Record<string, string | number> | undefined {
    if (!guidelineKey) return undefined;
    switch (guidelineKey) {
        case 'hungerThreshold':
            return {
                hungerThreshold: (v.hungerThreshold as number) ?? 30,
                foodResource: (v.foodResource as string) ?? 'wildStrawberry',
            };
        case 'thirstThreshold':
            return { thirstThreshold: (v.thirstThreshold as number) ?? 30 };
        case 'tirednessThreshold':
            return {
                tirednessThreshold: (v.tirednessThreshold as number) ?? 30,
                sleepingBag: (v.sleepingBag as string) ?? 'sleepingBag1',
            };
        case 'boredomThreshold':
            return {
                boredomThreshold: (v.boredomThreshold as number) ?? 30,
                restPlace: (v.restPlace as string) ?? 'bareGround',
            };
        case 'wildStrawberryStockThreshold':
            return {
                wildStrawberryStockThreshold:
                    (v.wildStrawberryStockThreshold as number) ??
                    GUIDELINES_DEFAULT.WILD_STRAWBERRY_STOCK_THRESHOLD,
            };
        case 'waterStockThreshold':
            return {
                waterStockThreshold:
                    (v.waterStockThreshold as number) ??
                    GUIDELINES_DEFAULT.WATER_STOCK_THRESHOLD,
            };
        case 'survivalInstinct':
            return {};
        default:
            return undefined;
    }
}

/** 생존 본능: 상태 5% 미만인 생존자의 해당 채우기 활동을 예약 목록 맨 위로 올림 */
function promoteSurvivalInstinctActivities(
    reserved: ReservedActivity[],
    survivors: Survivor[],
): ReservedActivity[] {
    const survivorIds = [
        ...new Set(reserved.map((a) => a.survivorId)),
    ] as string[];
    const result: ReservedActivity[] = [];
    for (const survivorId of survivorIds) {
        const segment = reserved.filter((a) => a.survivorId === survivorId);
        const survivor = survivors.find((s) => s.id === survivorId);
        const instinct = survivor
            ? getSurvivalInstinctActivity(survivor)
            : null;
        if (!instinct) {
            result.push(...segment);
            continue;
        }
        const idx = segment.findIndex((a) => a.type === instinct.type);
        if (idx >= 0) {
            const moved = segment[idx];
            const rest = segment.filter((_, i) => i !== idx);
            result.push(moved, ...rest);
        } else {
            result.push(
                {
                    id: genReservedId(),
                    survivorId,
                    type: instinct.type,
                    guidelineKey: 'survivalInstinct',
                    reasonParams: {},
                },
                ...segment,
            );
        }
    }
    return result;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
    pendingActivities: [],
    reservedActivities: [],
    activityLogEntries: [],
    activityStartTimes: {},
    guidelineSatisfyingPhase: {},
    discoveredSurvivorCount: 0,
    researchProgress: 0,

    addPendingActivity: (activity) => {
        set((s) => ({ pendingActivities: [...s.pendingActivities, activity] }));
    },

    addActivityLogEntry: (entry) => {
        set((s) => {
            const next = [...s.activityLogEntries, entry];
            if (next.length > MAX_LOG_ENTRIES)
                return {
                    activityLogEntries: next.slice(-MAX_LOG_ENTRIES),
                };
            return { activityLogEntries: next };
        });
    },

    startSearchFood: (survivorId, endAt) => {
        set((s) => ({
            pendingActivities: [
                ...s.pendingActivities,
                { id: genActivityId(), survivorId, type: 'searchFood', endAt },
            ],
        }));
    },

    cancelPendingActivity: (id) => {
        set((state) => {
            const activity = state.pendingActivities.find((a) => a.id === id);
            const phaseClears: Record<string, string | null> = {};
            if (
                activity &&
                (activity.type === 'restWithSleepingBag' ||
                    activity.type === 'restAtPlace')
            ) {
                phaseClears[activity.survivorId] = null;
            }
            if (
                activity?.type === 'consumeResource' &&
                activity.consumableKey
            ) {
                useCampResourceStore
                    .getState()
                    .addQuantity(activity.consumableKey, 1);
            }
            return {
                pendingActivities: state.pendingActivities.filter(
                    (a) => a.id !== id,
                ),
                guidelineSatisfyingPhase: {
                    ...state.guidelineSatisfyingPhase,
                    ...phaseClears,
                },
            };
        });
    },

    completeDueActivities: (now) => {
        const state = get();
        const nowM = toMinutes(now);
        const due = state.pendingActivities.filter(
            (a) => toMinutes(a.endAt) <= nowM,
        );
        if (due.length === 0) return;

        const remaining = state.pendingActivities.filter(
            (a) => !due.includes(a),
        );
        const newActivities: PendingActivity[] = [...remaining];
        const phaseClears: Record<string, string | null> = {};

        for (const a of due) {
            if (a.type === 'searchFood') {
                newActivities.push({
                    id: genActivityId(),
                    survivorId: a.survivorId,
                    type: 'searchFood',
                    endAt: addMinutesToPoint(
                        now,
                        ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS *
                            GAME_TIME_CONFIG.MINUTES_PER_HOUR,
                    ),
                });
            }
        }

        for (const a of due) {
            if (a.type === 'searchFood') {
                useCampResourceStore
                    .getState()
                    .addQuantity(
                        'wildStrawberry',
                        ACTIVITY_BALANCE.FOOD_SEARCH.WILD_STRAWBERRY_GAIN,
                    );
            }
            if (a.type === 'consumeResource' && a.consumableKey) {
                const config = CONSUMABLE_ACTIVITIES[a.consumableKey];
                if (!config) continue;
                useSurvivorStore
                    .getState()
                    .applyConsumableBenefit(a.survivorId, a.consumableKey);
                const survivor = useSurvivorStore
                    .getState()
                    .survivors.find((s) => s.id === a.survivorId);
                const resourceQty = useCampResourceStore
                    .getState()
                    .getQuantity(a.consumableKey);
                const statValue =
                    config.stat === 'hunger'
                        ? (survivor?.hunger ?? 0)
                        : (survivor?.thirst ?? 0);
                if (survivor && statValue < 100 && resourceQty > 0) {
                    newActivities.push({
                        id: genActivityId(),
                        survivorId: a.survivorId,
                        type: 'consumeResource',
                        endAt: addMinutesToPoint(now, config.durationMinutes),
                        consumableKey: a.consumableKey,
                    });
                    useCampResourceStore
                        .getState()
                        .addQuantity(a.consumableKey, -1);
                }
            }
            if (a.type === 'restWithSleepingBag' || a.type === 'restAtPlace') {
                runUpdateSurvivorStat({
                    survivorId: a.survivorId,
                    stat:
                        a.type === 'restWithSleepingBag'
                            ? 'tiredness'
                            : 'boredom',
                    value: 100,
                });
                phaseClears[a.survivorId] = null;
            }
        }

        set({
            pendingActivities: newActivities,
            guidelineSatisfyingPhase: {
                ...state.guidelineSatisfyingPhase,
                ...phaseClears,
            },
        });
    },

    searchWater: () => {
        const gain = randomInRange(
            ACTIVITY_BALANCE.WATER_SEARCH.GAIN_MIN,
            ACTIVITY_BALANCE.WATER_SEARCH.GAIN_MAX,
        );
        useCampResourceStore.getState().addQuantity('water', gain);
    },

    searchSurvivor: () => {
        set((s) => ({
            discoveredSurvivorCount: s.discoveredSurvivorCount + 1,
        }));
    },

    doResearch: () => {
        set((s) => ({
            researchProgress:
                s.researchProgress + ACTIVITY_BALANCE.RESEARCH.PROGRESS_GAIN,
        }));
    },

    addReservedActivity: (survivorId, type) => {
        set((s) => ({
            reservedActivities: [
                ...s.reservedActivities,
                { id: genReservedId(), survivorId, type },
            ],
        }));
    },

    removeReservedActivity: (id) => {
        set((s) => ({
            reservedActivities: s.reservedActivities.filter((a) => a.id !== id),
        }));
    },

    executeReservedActivity: (id) => {
        const state = get();
        const reserved = state.reservedActivities.find((a) => a.id === id);
        if (!reserved) return false;

        const { year, month, day, hour, minute } = useGameTimeStore.getState();
        const now = { year, month, day, hour, minute };

        const success = runActivityEffect({
            type: reserved.type,
            survivorId: reserved.survivorId,
            now,
        });

        if (success) {
            const entry: Parameters<ActivityState['addActivityLogEntry']>[0] = {
                at: now,
                survivorId: reserved.survivorId,
                type: reserved.type,
            };
            if (reserved.guidelineKey) {
                entry.reasonKey = reserved.guidelineKey;
                entry.reasonParams =
                    reserved.reasonParams ??
                    buildReasonParams(
                        reserved.guidelineKey,
                        getSettings().guidelinesValues,
                    );
            }
            get().addActivityLogEntry(entry);
            set((s) => ({
                reservedActivities: s.reservedActivities.filter(
                    (a) => a.id !== id,
                ),
            }));
        }
        return success;
    },

    reorderReservedActivities: (survivorId, oldIndex, newIndex) => {
        set((state) => {
            const survivorItems = state.reservedActivities.filter(
                (a) => a.survivorId === survivorId,
            );
            const validRange =
                survivorItems.length > 1 &&
                oldIndex >= 0 &&
                oldIndex < survivorItems.length &&
                newIndex >= 0 &&
                newIndex < survivorItems.length;
            if (!validRange) return state;
            const reordered = arrayMove(survivorItems, oldIndex, newIndex);
            const globalIndices = state.reservedActivities
                .map((a, i) => (a.survivorId === survivorId ? i : -1))
                .filter((i) => i >= 0);
            const newArray = [...state.reservedActivities];
            globalIndices.forEach((idx, i) => {
                newArray[idx] = reordered[i];
            });
            return { reservedActivities: newArray };
        });
    },

    insertGuidelineActivitiesIfNeeded: () => {
        const state = get();
        const settings = getSettings();
        const survivors = useSurvivorStore.getState().survivors;
        const seenSurvivorIds = new Set<string>();
        const newReserved: ReservedActivity[] = [];
        const phaseUpdates: Record<string, string | null> = {};

        const hasPendingRest = (
            survivorId: string,
            type: 'restWithSleepingBag' | 'restAtPlace',
        ) =>
            state.pendingActivities.some(
                (a) => a.survivorId === survivorId && a.type === type,
            );

        const hasPendingSearchFood = (survivorId: string) =>
            state.pendingActivities.some(
                (a) => a.survivorId === survivorId && a.type === 'searchFood',
            );

        const processSurvivor = (
            survivor: Survivor,
            firstActivityType?: ReservedActivityType,
        ) => {
            const phase = state.guidelineSatisfyingPhase[survivor.id] ?? null;
            const result = getGuidelineActivityForSurvivor(
                survivor,
                settings,
                phase,
            );
            if (result.newPhase !== undefined) {
                phaseUpdates[survivor.id] = result.newPhase ?? null;
            }
            if (result.activity && firstActivityType !== result.activity) {
                if (
                    result.activity === 'restWithSleepingBag' &&
                    hasPendingRest(survivor.id, 'restWithSleepingBag')
                )
                    return;
                if (
                    result.activity === 'restAtPlace' &&
                    hasPendingRest(survivor.id, 'restAtPlace')
                )
                    return;
                if (
                    result.activity === 'searchFood' &&
                    hasPendingSearchFood(survivor.id)
                )
                    return;
                const v = settings.guidelinesValues;
                newReserved.push({
                    id: genReservedId(),
                    survivorId: survivor.id,
                    type: result.activity,
                    guidelineKey: result.guidelineKey,
                    reasonParams: buildReasonParams(result.guidelineKey, v),
                });
            }
            return result.activity;
        };

        for (const a of state.reservedActivities) {
            if (!seenSurvivorIds.has(a.survivorId)) {
                seenSurvivorIds.add(a.survivorId);
                const survivor = survivors.find((s) => s.id === a.survivorId);
                if (survivor) processSurvivor(survivor, a.type);
            }
            newReserved.push(a);
        }
        for (const survivor of survivors) {
            if (seenSurvivorIds.has(survivor.id)) continue;
            processSurvivor(survivor);
        }

        const afterInstinct = promoteSurvivalInstinctActivities(
            newReserved,
            survivors,
        );
        const idsBefore = state.reservedActivities.map((a) => a.id).join(',');
        const idsAfter = afterInstinct.map((a) => a.id).join(',');
        const hasChanges =
            afterInstinct.length !== state.reservedActivities.length ||
            idsBefore !== idsAfter ||
            Object.keys(phaseUpdates).some(
                (id) =>
                    phaseUpdates[id] !==
                    (state.guidelineSatisfyingPhase[id] ?? null),
            );
        if (hasChanges) {
            set({
                reservedActivities: afterInstinct,
                guidelineSatisfyingPhase: {
                    ...state.guidelineSatisfyingPhase,
                    ...phaseUpdates,
                },
            });
        }
    },

    processReservedActivities: () => {
        get().insertGuidelineActivitiesIfNeeded();
        const state = get();
        const busySurvivorIds = new Set(
            state.pendingActivities.map((a) => a.survivorId),
        );
        const { year, month, day, hour, minute } = useGameTimeStore.getState();
        const now: GameTimePoint = { year, month, day, hour, minute };
        const nowM = toMinutes(now);
        const survivorIds = [
            ...new Set(state.reservedActivities.map((a) => a.survivorId)),
        ];
        const updates: Partial<ActivityState> = {
            activityStartTimes: { ...state.activityStartTimes },
        };
        let startTimesChanged = false;

        for (const survivorId of survivorIds) {
            if (busySurvivorIds.has(survivorId)) continue;
            const first = state.reservedActivities.find(
                (a) => a.survivorId === survivorId,
            );
            if (!first) continue;

            const waitMin = QUEUE_WAIT[first.type] ?? 10;
            const record = state.activityStartTimes[survivorId];

            if (!record || record.activityId !== first.id) {
                updates.activityStartTimes![survivorId] = {
                    activityId: first.id,
                    startedAt: now,
                };
                startTimesChanged = true;
                continue;
            }
            if (nowM < toMinutes(record.startedAt) + waitMin) continue;

            delete updates.activityStartTimes![survivorId];
            startTimesChanged = true;
            get().executeReservedActivity(first.id);
        }

        for (const survivorId of Object.keys(state.activityStartTimes)) {
            if (
                !state.reservedActivities.some(
                    (a) => a.survivorId === survivorId,
                )
            ) {
                delete updates.activityStartTimes![survivorId];
                startTimesChanged = true;
            }
        }

        if (startTimesChanged) {
            set(updates);
        }
    },
}));
