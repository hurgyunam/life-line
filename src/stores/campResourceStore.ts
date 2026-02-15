import { create } from 'zustand'
import { CAMP_RESOURCES_INITIAL } from '@/constants/gameConfig'

export type CampResourceKey =
  | 'wood'
  | 'stone'
  | 'ironOre'
  | 'cotton'
  | 'leather'
  | 'water'
  | 'wildStrawberry'
  | 'potato'
  | 'corn'
  | 'wheat'

export type CampResourceQuantities = Record<CampResourceKey, number>

interface CampResourceState {
  quantities: CampResourceQuantities
  getQuantity: (key: CampResourceKey) => number
  addQuantity: (key: CampResourceKey, amount: number) => void
  setQuantity: (key: CampResourceKey, amount: number) => void
}

const initialQuantities = { ...CAMP_RESOURCES_INITIAL } as CampResourceQuantities

export const useCampResourceStore = create<CampResourceState>((set, get) => ({
  quantities: initialQuantities,
  getQuantity: (key) => get().quantities[key] ?? 0,
  addQuantity: (key, amount) =>
    set((state) => ({
      quantities: {
        ...state.quantities,
        [key]: Math.max(0, (state.quantities[key] ?? 0) + amount),
      },
    })),
  setQuantity: (key, amount) =>
    set((state) => ({
      quantities: {
        ...state.quantities,
        [key]: Math.max(0, amount),
      },
    })),
}))
