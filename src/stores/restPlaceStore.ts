import { create } from 'zustand'
import type { RestPlace } from '@/types/restPlace'

interface RestPlaceState {
  stocks: Record<RestPlace, number>
  getStock: (place: RestPlace) => number
  setStock: (place: RestPlace, amount: number) => void
  addStock: (place: RestPlace, amount: number) => void
}

const initialStocks: Record<RestPlace, number> = {
  bareGround: 999, // 맨 땅은 항상 사용 가능
  hammock: 0, // 흔들의자 - 연구를 통해 제작 필요
  wrestlingMat: 0, // 씨름대 - 연구를 통해 제작 필요
  soccerField: 0, // 축구장 - 연구를 통해 제작 필요
}

export const useRestPlaceStore = create<RestPlaceState>((set, get) => ({
  stocks: initialStocks,
  getStock: (place) => get().stocks[place] ?? 0,
  setStock: (place, amount) =>
    set((state) => ({
      stocks: {
        ...state.stocks,
        [place]: Math.max(0, amount),
      },
    })),
  addStock: (place, amount) =>
    set((state) => ({
      stocks: {
        ...state.stocks,
        [place]: Math.max(0, (state.stocks[place] ?? 0) + amount),
      },
    })),
}))
