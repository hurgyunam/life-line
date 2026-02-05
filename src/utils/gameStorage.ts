import { useSurvivorStore, syncNextActivityId, type PendingActivity } from '@/stores/survivorStore'
import { useRegionCampStore } from '@/stores/regionCampStore'
import type { Survivor } from '@/types/survivor'
import type { Facility } from '@/types/facility'

const STORAGE_KEY = 'life-line-saves'

export interface SaveSlot {
  id: string
  name: string
  createdAt: number
  survivorData: {
    survivors: Survivor[]
    pendingActivities: PendingActivity[]
    discoveredSurvivorCount: number
    researchProgress: number
  }
  regionData: {
    regionsWithCamp: string[]
    facilitiesByRegion: Record<string, Facility[]>
  }
}

interface StorageData {
  saves: SaveSlot[]
  lastLoadedId: string | null
}

function getStorageData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { saves: [], lastLoadedId: null }
    const parsed = JSON.parse(raw)
    return {
      saves: Array.isArray(parsed?.saves) ? parsed.saves : [],
      lastLoadedId: parsed?.lastLoadedId ?? null,
    }
  } catch {
    return { saves: [], lastLoadedId: null }
  }
}

function setStorageData(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function generateId(): string {
  return `save-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatSaveName(createdAt: number): string {
  const d = new Date(createdAt)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

/** 세이브 슬롯 목록 조회 (최신순) */
export function getSaveList(): SaveSlot[] {
  const { saves } = getStorageData()
  return [...saves].sort((a, b) => b.createdAt - a.createdAt)
}

/** 현재 상태를 새 세이브 슬롯에 저장 */
export function createSave(name?: string): SaveSlot {
  const survivorState = useSurvivorStore.getState()
  const regionState = useRegionCampStore.getState()
  const createdAt = Date.now()
  const id = generateId()

  const slot: SaveSlot = {
    id,
    name: name ?? formatSaveName(createdAt),
    createdAt,
    survivorData: {
      survivors: survivorState.survivors,
      pendingActivities: survivorState.pendingActivities,
      discoveredSurvivorCount: survivorState.discoveredSurvivorCount,
      researchProgress: survivorState.researchProgress,
    },
    regionData: {
      regionsWithCamp: regionState.regionsWithCamp,
      facilitiesByRegion: regionState.facilitiesByRegion,
    },
  }

  const data = getStorageData()
  data.saves.push(slot)
  setStorageData(data)
  return slot
}

/** 지정한 세이브 슬롯 로드 */
export function loadSave(saveId: string): boolean {
  const data = getStorageData()
  const slot = data.saves.find((s) => s.id === saveId)
  if (!slot) return false

  const { survivorData, regionData } = slot
  const survivors = Array.isArray(survivorData.survivors) ? survivorData.survivors : useSurvivorStore.getState().survivors
  const pendingActivities: PendingActivity[] = Array.isArray(survivorData.pendingActivities)
    ? survivorData.pendingActivities
    : []

  useSurvivorStore.setState({
    survivors,
    pendingActivities,
    discoveredSurvivorCount: survivorData.discoveredSurvivorCount ?? 0,
    researchProgress: survivorData.researchProgress ?? 0,
  })
  if (pendingActivities.length > 0) {
    syncNextActivityId(pendingActivities)
  }

  const facilitiesByRegion =
    regionData.facilitiesByRegion && typeof regionData.facilitiesByRegion === 'object'
      ? (regionData.facilitiesByRegion as Record<string, Facility[]>)
      : {}

  useRegionCampStore.setState({
    regionsWithCamp: Array.isArray(regionData.regionsWithCamp) ? regionData.regionsWithCamp : [],
    facilitiesByRegion,
  })

  data.lastLoadedId = saveId
  setStorageData(data)
  return true
}

/** 세이브 슬롯 삭제 */
export function deleteSave(saveId: string): void {
  const data = getStorageData()
  data.saves = data.saves.filter((s) => s.id !== saveId)
  if (data.lastLoadedId === saveId) {
    data.lastLoadedId = null
  }
  setStorageData(data)
}

/** 앱 초기화 시 마지막 로드된 세이브 복원 */
export function loadLastSave(): boolean {
  const data = getStorageData()
  if (data.lastLoadedId) {
    return loadSave(data.lastLoadedId)
  }
  return false
}
