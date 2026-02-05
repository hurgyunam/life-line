import { create } from 'zustand'
import { CAMP_RESOURCES_INITIAL } from '@/constants/gameConfig'
import type { CampResource } from '@/types/resource'

export type CampResourceQuantities = Record<CampResource, number>

interface CampResourceState {
  quantities: CampResourceQuantities
  getQuantity: (key: CampResource) => number
  addQuantity: (key: CampResource, amount: number) => void
  setQuantity: (key: CampResource, amount: number) => void
}

const initialQuantities = { ...CAMP_RESOURCES_INITIAL }

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
