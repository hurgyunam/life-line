import { create } from 'zustand'
import { GAME_TIME_CONFIG } from '@/constants/gameConfig'

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
      const add = state.speed * GAME_TIME_CONFIG.MINUTES_PER_TICK_BASE
      let minute = state.minute + add
      let hour = state.hour
      let year = state.year
      if (minute >= GAME_TIME_CONFIG.MINUTES_PER_HOUR) {
        hour += Math.floor(minute / GAME_TIME_CONFIG.MINUTES_PER_HOUR)
        minute = minute % GAME_TIME_CONFIG.MINUTES_PER_HOUR
      }
      if (hour >= GAME_TIME_CONFIG.HOURS_PER_DAY) {
        year += Math.floor(hour / GAME_TIME_CONFIG.HOURS_PER_DAY)
        hour = hour % GAME_TIME_CONFIG.HOURS_PER_DAY
      }
      return { minute, hour, year }
    }),

  advanceByMinutes: (minutes) =>
    set((state) => {
      let minute = state.minute + minutes
      let hour = state.hour
      let year = state.year
      if (minute >= GAME_TIME_CONFIG.MINUTES_PER_HOUR) {
        hour += Math.floor(minute / GAME_TIME_CONFIG.MINUTES_PER_HOUR)
        minute = minute % GAME_TIME_CONFIG.MINUTES_PER_HOUR
      }
      if (hour >= GAME_TIME_CONFIG.HOURS_PER_DAY) {
        year += Math.floor(hour / GAME_TIME_CONFIG.HOURS_PER_DAY)
        hour = hour % GAME_TIME_CONFIG.HOURS_PER_DAY
      }
      return { minute, hour, year }
    }),
}))
