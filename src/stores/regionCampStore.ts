import { create } from 'zustand'
import type { Facility } from '@/types/facility'

interface RegionCampState {
  /** 캠프가 건설된 지역 ID 목록 */
  regionsWithCamp: Set<string>
  /** 지역별 설치된 시설 목록 */
  facilitiesByRegion: Record<string, Facility[]>
  hasCamp: (regionId: string) => boolean
  buildCamp: (regionId: string) => void
  getFacilities: (regionId: string) => Facility[]
  installFacility: (regionId: string, facility: Facility) => void
}

export const useRegionCampStore = create<RegionCampState>((set, get) => ({
  regionsWithCamp: new Set(),
  facilitiesByRegion: {},

  hasCamp: (regionId) => get().regionsWithCamp.has(regionId),

  buildCamp: (regionId) =>
    set((state) => ({
      regionsWithCamp: new Set([...state.regionsWithCamp, regionId]),
    })),

  getFacilities: (regionId) => get().facilitiesByRegion[regionId] ?? [],

  installFacility: (regionId, facility) =>
    set((state) => {
      const current = state.facilitiesByRegion[regionId] ?? []
      if (current.includes(facility)) return state
      return {
        facilitiesByRegion: {
          ...state.facilitiesByRegion,
          [regionId]: [...current, facility],
        },
      }
    }),
}))
