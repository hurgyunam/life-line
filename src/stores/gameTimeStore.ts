import { create } from 'zustand'

export type GameSpeed = 1 | 2 | 3

interface GameTimeState {
  year: number
  hour: number
  minute: number
  isPaused: boolean
  speed: GameSpeed
  setPaused: (paused: boolean) => void
  setSpeed: (speed: GameSpeed) => void
  tick: () => void
  /** 게임 시간을 분 단위로 진행 (활동 소요 시간 등) */
  advanceByMinutes: (minutes: number) => void
}

/** 1x 기준: 실시간 1초 ≈ 게임 1분. tick은 100ms마다 호출되므로 1x일 때 한 틱에 6분 진행 */
const MINUTES_PER_TICK_BASE = 6

export const useGameTimeStore = create<GameTimeState>((set) => ({
  year: 1,
  hour: 8,
  minute: 0,
  isPaused: true,
  speed: 1,

  setPaused: (paused) => set({ isPaused: paused }),

  setSpeed: (speed) => set({ speed, isPaused: false }),

  tick: () =>
    set((state) => {
      if (state.isPaused) return state
      const add = state.speed * MINUTES_PER_TICK_BASE
      let minute = state.minute + add
      let hour = state.hour
      let year = state.year
      if (minute >= 60) {
        hour += Math.floor(minute / 60)
        minute = minute % 60
      }
      if (hour >= 24) {
        year += Math.floor(hour / 24)
        hour = hour % 24
      }
      return { minute, hour, year }
    }),

  advanceByMinutes: (minutes) =>
    set((state) => {
      let minute = state.minute + minutes
      let hour = state.hour
      let year = state.year
      if (minute >= 60) {
        hour += Math.floor(minute / 60)
        minute = minute % 60
      }
      if (hour >= 24) {
        year += Math.floor(hour / 24)
        hour = hour % 24
      }
      return { minute, hour, year }
    }),
}))
