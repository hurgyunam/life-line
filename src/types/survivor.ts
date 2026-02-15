/** 생존자 상태 (번역 키) */
export type SurvivorStatus =
  | 'hungry'
  | 'bored'
  | 'tired'
  | 'stressed'
  | 'healthy'
  | 'satisfied'

/** 현재 행동 (번역 키) */
export type SurvivorAction =
  | 'farming_wildStrawberries'
  | 'mining_stones'
  | 'chopping_wood'
  | 'resting'
  | 'cooking'
  | 'sleeping'
  | 'researching'
  | 'waiting'

export interface Survivor {
  id: string
  name: string
  age: number
  status: SurvivorStatus
  currentAction: SurvivorAction
  /** 배고픔 (0=매우 배고픔, 100=포만) */
  hunger: number
  /** 피곤함 (0=매우 피곤, 100=잘 쉼) */
  tiredness: number
  /** 목마름 (0=매우 목마름, 100=해소됨) */
  thirst: number
  /** 지루함 (0=매우 지루함, 100=만족/재미있음) */
  boredom: number
}
