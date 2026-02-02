/** 생존자 상태 (배고픔, 지루함 등) */
export type SurvivorStatus =
  | '굶주림'
  | '지루함'
  | '피로'
  | '스트레스'
  | '건강함'
  | '만족'

/** 현재 행동 */
export type SurvivorAction =
  | '당근 농사 진행중'
  | '광산에서 돌 캐는 중'
  | '나무 베는 중'
  | '휴식 중'
  | '요리 중'
  | '수면 중'
  | '연구 중'
  | '대기 중'

export interface Survivor {
  id: string
  name: string
  age: number
  status: SurvivorStatus
  currentAction: SurvivorAction
}
