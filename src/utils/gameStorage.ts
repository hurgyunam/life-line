import i18n from '@/i18n'
import { useSurvivorStore, syncNextActivityId, syncNextReservedId, type PendingActivity, type ReservedActivity } from '@/stores/survivorStore'
import { useRegionCampStore } from '@/stores/regionCampStore'
import { useGameTimeStore } from '@/stores/gameTimeStore'
import { useCampResourceStore, type CampResourceQuantities } from '@/stores/campResourceStore'
import type { Survivor } from '@/types/survivor'
import type { Facility } from '@/types/facility'
import { CAMP_RESOURCES_INITIAL } from '@/constants/gameConfig'

const STORAGE_KEY = 'life-line-saves'
const SETTINGS_KEY = 'life-line-settings'

/** 게임 설정 스키마 */
export interface GameSettings {
  /** 자동 저장 주기(분). 0 = 끄기 */
  autoSaveIntervalMinutes: number
  /** 행동 지침 값들 (숫자 또는 문자열) */
  guidelinesValues: Record<string, number | string>
  /** 행동 지침 순서 (지침 키 배열) */
  guidelinesOrder: string[]
}

const SETTINGS_DEFAULTS: GameSettings = {
  autoSaveIntervalMinutes: 0,
  guidelinesValues: {
    hungerThreshold: 30,
    foodResource: 'wildStrawberry' as string, // 기본값은 야생딸기
    tirednessThreshold: 30,
    sleepingBag: 'sleepingBag1' as string, // 기본값은 침낭1
    thirstThreshold: 30,
    boredomThreshold: 30,
    restPlace: 'bareGround' as string, // 기본값은 맨 땅
  },
  guidelinesOrder: ['hungerThreshold', 'tirednessThreshold', 'thirstThreshold', 'boredomThreshold'],
}

function getSettingsRaw(): unknown {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** 구버전 형식(autoSaveIntervalMinutes 단독) 마이그레이션 */
function migrateSettings(parsed: unknown): GameSettings {
  const result = { ...SETTINGS_DEFAULTS }
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    if (typeof obj.autoSaveIntervalMinutes === 'number') {
      result.autoSaveIntervalMinutes = Math.max(0, obj.autoSaveIntervalMinutes)
    }
    if (obj.guidelinesValues && typeof obj.guidelinesValues === 'object') {
      result.guidelinesValues = {
        ...SETTINGS_DEFAULTS.guidelinesValues,
        ...(obj.guidelinesValues as Record<string, number | string>),
      }
    }
    if (Array.isArray(obj.guidelinesOrder)) {
      result.guidelinesOrder = obj.guidelinesOrder as string[]
    }
  }
  return result
}

/** 설정 조회 (기본값 + 마이그레이션 적용) */
export function getSettings(): GameSettings {
  const parsed = getSettingsRaw()
  return migrateSettings(parsed)
}

/** 설정 일부 저장 (병합) */
export function setSettings(partial: Partial<GameSettings>): void {
  try {
    const current = getSettings()
    const next = { ...current, ...partial }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export interface SaveSlot {
  id: string
  name: string
  createdAt: number
  survivorData: {
    survivors: Survivor[]
    pendingActivities: PendingActivity[]
    reservedActivities: ReservedActivity[]
    discoveredSurvivorCount: number
    researchProgress: number
  }
  regionData: {
    regionsWithCamp: string[]
    facilitiesByRegion: Record<string, Facility[]>
  }
  /** 구버전 세이브 호환용 optional */
  gameTimeData?: {
    year: number
    hour: number
    minute: number
    isPaused: boolean
    speed: 1 | 2 | 3
  }
  /** 구버전 세이브 호환용 optional */
  campResourceData?: {
    quantities: CampResourceQuantities
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

function formatSaveDate(createdAt: number): string {
  const d = new Date(createdAt)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function formatManualSaveName(createdAt: number): string {
  return i18n.t('settings.saveNameManual', { date: formatSaveDate(createdAt) })
}

function formatAutoSaveName(createdAt: number): string {
  return i18n.t('settings.saveNameAuto', { date: formatSaveDate(createdAt) })
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
  const gameTimeState = useGameTimeStore.getState()
  const campResourceState = useCampResourceStore.getState()
  const createdAt = Date.now()
  const id = generateId()

  const slot: SaveSlot = {
    id,
    name: name ?? formatManualSaveName(createdAt),
    createdAt,
    survivorData: {
      survivors: survivorState.survivors,
      pendingActivities: survivorState.pendingActivities,
      reservedActivities: survivorState.reservedActivities,
      discoveredSurvivorCount: survivorState.discoveredSurvivorCount,
      researchProgress: survivorState.researchProgress,
    },
    regionData: {
      regionsWithCamp: regionState.regionsWithCamp,
      facilitiesByRegion: regionState.facilitiesByRegion,
    },
    gameTimeData: {
      year: gameTimeState.year,
      hour: gameTimeState.hour,
      minute: gameTimeState.minute,
      isPaused: gameTimeState.isPaused,
      speed: gameTimeState.speed,
    },
    campResourceData: {
      quantities: { ...campResourceState.quantities },
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

  const { survivorData, regionData, gameTimeData, campResourceData } = slot
  const survivors = Array.isArray(survivorData.survivors) ? survivorData.survivors : useSurvivorStore.getState().survivors
  const pendingActivities: PendingActivity[] = Array.isArray(survivorData.pendingActivities)
    ? survivorData.pendingActivities
    : []
  const reservedActivities: ReservedActivity[] = Array.isArray(survivorData.reservedActivities)
    ? survivorData.reservedActivities
    : []

  useSurvivorStore.setState({
    survivors,
    pendingActivities,
    reservedActivities,
    discoveredSurvivorCount: survivorData.discoveredSurvivorCount ?? 0,
    researchProgress: survivorData.researchProgress ?? 0,
  })
  if (pendingActivities.length > 0) {
    syncNextActivityId(pendingActivities)
  }
  if (reservedActivities.length > 0) {
    syncNextReservedId(reservedActivities)
  }

  const facilitiesByRegion =
    regionData.facilitiesByRegion && typeof regionData.facilitiesByRegion === 'object'
      ? (regionData.facilitiesByRegion as Record<string, Facility[]>)
      : {}

  useRegionCampStore.setState({
    regionsWithCamp: Array.isArray(regionData.regionsWithCamp) ? regionData.regionsWithCamp : [],
    facilitiesByRegion,
  })

  if (gameTimeData && typeof gameTimeData === 'object') {
    useGameTimeStore.setState({
      year: gameTimeData.year ?? 1,
      hour: gameTimeData.hour ?? 8,
      minute: gameTimeData.minute ?? 0,
      isPaused: gameTimeData.isPaused ?? true,
      speed: gameTimeData.speed ?? 1,
    })
  }

  if (campResourceData?.quantities && typeof campResourceData.quantities === 'object') {
    useCampResourceStore.setState({
      quantities: { ...CAMP_RESOURCES_INITIAL, ...campResourceData.quantities },
    })
  }

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

/** 마지막 로드된 세이브 ID (자동 저장용) */
export function getLastLoadedId(): string | null {
  return getStorageData().lastLoadedId
}

/** 기존 세이브 슬롯 덮어쓰기 (자동 저장용) */
export function overwriteSave(saveId: string): boolean {
  const data = getStorageData()
  const slot = data.saves.find((s) => s.id === saveId)
  if (!slot) return false

  const survivorState = useSurvivorStore.getState()
  const regionState = useRegionCampStore.getState()
  const gameTimeState = useGameTimeStore.getState()
  const campResourceState = useCampResourceStore.getState()
  const createdAt = Date.now()

  slot.createdAt = createdAt
  slot.name = formatAutoSaveName(createdAt)
  slot.survivorData = {
    survivors: survivorState.survivors,
    pendingActivities: survivorState.pendingActivities,
    reservedActivities: survivorState.reservedActivities,
    discoveredSurvivorCount: survivorState.discoveredSurvivorCount,
    researchProgress: survivorState.researchProgress,
  }
  slot.regionData = {
    regionsWithCamp: regionState.regionsWithCamp,
    facilitiesByRegion: regionState.facilitiesByRegion,
  }
  slot.gameTimeData = {
    year: gameTimeState.year,
    hour: gameTimeState.hour,
    minute: gameTimeState.minute,
    isPaused: gameTimeState.isPaused,
    speed: gameTimeState.speed,
  }
  slot.campResourceData = {
    quantities: { ...campResourceState.quantities },
  }

  setStorageData(data)
  return true
}

