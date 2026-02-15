/** 침낭 타입 */
export type SleepingBag = 'sleepingBag1' | 'sleepingBag2' | 'sleepingBag3'

/** 침낭 목록 */
export const SLEEPING_BAGS: SleepingBag[] = [
    'sleepingBag1',
    'sleepingBag2',
    'sleepingBag3',
] as const;

/** 침낭 정보 인터페이스 */
export interface SleepingBagInfo {
  id: SleepingBag
  name: string
  tirednessGain: number
  stock: number
}
