/**
 * 생존자 욕구 스토어 (hunger, tiredness, thirst, boredom)
 *
 * 활동 관리는 activityStore에서 처리하며, 이펙트 실행 시 이 스토어가 호출됩니다.
 */

import { create } from 'zustand';
import type { Survivor } from '@/types/survivor';
import { SURVIVOR_BALANCE } from '@/constants/gameConfig';
import { decaySurvivors, computeStatusFromStats } from '@/logic/survivorDecay';
import { useCampResourceStore } from '@/stores/campResourceStore';
import type { PendingActivity, SurvivorState } from '@/stores/survivorStore.types';

// Re-export
export type { SurvivorState };

const initialSurvivors: Survivor[] = [
    { id: '1', name: '김민수', age: 32, status: 'healthy', currentAction: 'waiting', hunger: 85, tiredness: 70, thirst: 90, boredom: 75 },
    { id: '2', name: '이서연', age: 28, status: 'bored', currentAction: 'waiting', hunger: 60, tiredness: 55, thirst: 45, boredom: 30 },
    { id: '3', name: '박준호', age: 45, status: 'hungry', currentAction: 'waiting', hunger: 20, tiredness: 65, thirst: 50, boredom: 65 },
    { id: '4', name: '최지은', age: 24, status: 'tired', currentAction: 'waiting', hunger: 75, tiredness: 25, thirst: 80, boredom: 55 },
    { id: '5', name: '정현우', age: 38, status: 'satisfied', currentAction: 'waiting', hunger: 90, tiredness: 80, thirst: 85, boredom: 90 },
    { id: '6', name: '한소희', age: 29, status: 'stressed', currentAction: 'waiting', hunger: 50, tiredness: 15, thirst: 70, boredom: 50 },
    { id: '7', name: '강민준', age: 41, status: 'healthy', currentAction: 'waiting', hunger: 70, tiredness: 60, thirst: 65, boredom: 80 },
    { id: '8', name: '윤수아', age: 26, status: 'bored', currentAction: 'waiting', hunger: 55, tiredness: 50, thirst: 40, boredom: 25 },
];

export const useSurvivorStore = create<SurvivorState>((set) => ({
    survivors: initialSurvivors,

    eatWildStrawberry: (survivorId) => {
        const campStore = useCampResourceStore.getState();
        if (campStore.getQuantity('wildStrawberry') <= 0) return;
        campStore.addQuantity('wildStrawberry', -1);
        set((state) => ({
            survivors: state.survivors.map((s) =>
                s.id !== survivorId
                    ? s
                    : { ...s, hunger: Math.min(100, s.hunger + SURVIVOR_BALANCE.EAT_WILD_STRAWBERRY_HUNGER_GAIN) }
            ),
        }));
    },

    drinkWater: (survivorId) => {
        const campStore = useCampResourceStore.getState();
        if (campStore.getQuantity('water') <= 0) return;
        campStore.addQuantity('water', -1);
        set((state) => ({
            survivors: state.survivors.map((s) =>
                s.id !== survivorId ? s : { ...s, thirst: Math.min(100, s.thirst + SURVIVOR_BALANCE.DRINK_WATER_THIRST_GAIN) }
            ),
        }));
    },

    decayByMinutes: (gameMinutes, pendingActivities) => {
        set((state) => {
            let survivors = decaySurvivors(state.survivors, gameMinutes);
            const gainPerMinute = gameMinutes / 60;
            const restSleep = pendingActivities.filter((a) => a.type === 'restWithSleepingBag');
            const restPlace = pendingActivities.filter((a) => a.type === 'restAtPlace');

            survivors = survivors.map((s) => {
                const sleep = restSleep.find((a) => a.survivorId === s.id);
                const rest = restPlace.find((a) => a.survivorId === s.id);
                let tiredness = s.tiredness;
                let boredom = s.boredom;
                if (sleep?.sleepingBag) {
                    tiredness = Math.min(100, tiredness + SURVIVOR_BALANCE.SLEEPING_BAG_TIREDNESS_GAIN_PER_HOUR[sleep.sleepingBag] * gainPerMinute);
                }
                if (rest) {
                    boredom = Math.min(100, boredom + SURVIVOR_BALANCE.REST_PLACE_BOREDOM_GAIN_PER_HOUR * gainPerMinute);
                }
                if (tiredness !== s.tiredness || boredom !== s.boredom) {
                    return { ...s, tiredness, boredom, status: computeStatusFromStats({ ...s, tiredness, boredom }) };
                }
                return s;
            });
            return { survivors };
        });
    },

    updateSurvivorStat: (survivorId, stat, value) => {
        set((state) => ({
            survivors: state.survivors.map((s) => {
                if (s.id !== survivorId) return s;
                const updated = { ...s, [stat]: value } as Survivor;
                return { ...updated, status: computeStatusFromStats(updated) };
            }),
        }));
    },
}));
