/**
 * 지역 데이터 - 각 지역의 자연 자원 분포
 * gameConfig와 연계하여 밸런스 조정 가능
 */

import type { Region } from '@/types/region'

/** 지역 목록 - 자연 자원 풍부도(숫자가 클수록 해당 자원이 많음) */
export const REGIONS: Region[] = [
  {
    id: 'region-1',
    resources: {
      wood: 100,
      stone: 50,
      ironOre: 20,
      water: 30,
    },
  },
  {
    id: 'region-2',
    resources: {
      wood: 60,
      stone: 95,
      ironOre: 40,
      cotton: 25,
    },
  },
  {
    id: 'region-3',
    resources: {
      stone: 70,
      ironOre: 100,
      leather: 35,
    },
  },
  {
    id: 'region-4',
    resources: {
      wood: 85,
      cotton: 80,
      leather: 45,
      wildStrawberry: 20,
    },
  },
  {
    id: 'region-5',
    resources: {
      wood: 90,
      stone: 30,
      water: 50,
    },
  },
  {
    id: 'region-6',
    resources: {
      potato: 95,
      corn: 70,
      wheat: 60,
      water: 40,
    },
  },
]
