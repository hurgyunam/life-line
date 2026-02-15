import { create } from 'zustand';
import { GAME_TIME_CONFIG } from '@/constants/gameConfig';
import { addMinutesToPoint } from '@/logic/survivorStoreUtils';

export type GameSpeed = 1 | 2 | 3;

interface GameTimeState {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    isPaused: boolean;
    speed: GameSpeed;
    setPaused: (paused: boolean) => void;
    setSpeed: (speed: GameSpeed) => void;
    tick: () => void;
    /** 게임 시간을 분 단위로 진행 (활동 소요 시간 등) */
    advanceByMinutes: (minutes: number) => void;
}

function toStatePoint(state: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
}) {
    return {
        year: state.year,
        month: state.month,
        day: state.day,
        hour: state.hour,
        minute: state.minute,
    };
}

export const useGameTimeStore = create<GameTimeState>((set) => ({
    year: 1,
    month: 1,
    day: 1,
    hour: 8,
    minute: 0,
    isPaused: true,
    speed: 1,

    setPaused: (paused) => set({ isPaused: paused }),

    setSpeed: (speed) => set({ speed, isPaused: false }),

    tick: () =>
        set((state) => {
            if (state.isPaused) return state;
            const add = state.speed * GAME_TIME_CONFIG.MINUTES_PER_TICK_BASE;
            const next = addMinutesToPoint(toStatePoint(state), add);
            return {
                year: next.year,
                month: next.month,
                day: next.day,
                hour: next.hour,
                minute: next.minute,
            };
        }),

    advanceByMinutes: (minutes) =>
        set((state) => {
            const next = addMinutesToPoint(toStatePoint(state), minutes);
            return {
                year: next.year,
                month: next.month,
                day: next.day,
                hour: next.hour,
                minute: next.minute,
            };
        }),
}));
