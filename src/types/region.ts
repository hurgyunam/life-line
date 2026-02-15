import type { CampResource } from '@/types/resource'

/** 지역 - 자연 자원 분포 (양이 많을수록 해당 자원이 풍부함) */
export interface Region {
  id: string
  /** 지역 내 자연 자원별 풍부도 (0이면 해당 자원 없음) */
  resources: Partial<Record<CampResource, number>>
}
