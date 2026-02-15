import type { CampResource } from '@/types/resource'
import type { Region } from '@/types/region'

/** 지역별 표시 정보 (최다 자원 기반, 중복 시 접미사) */
export interface RegionDisplayInfo {
  regionId: string
  /** 최다 자원 키 (campResources.xxx 번역용) */
  resourceKey: CampResource
  /** 중복 시 접미사: 1, 2, 3... (없으면 undefined) */
  suffix?: number
}

/**
 * 지역 목록에서 각 지역의 표시명 정보를 계산한다.
 * - 지역명 = 해당 지역에서 가장 풍부한 자원명
 * - 동일 자원이 최다인 지역이 여러 개면 1, 2, 3 접미사 부여
 */
export function getRegionDisplayInfos(regions: Region[]): RegionDisplayInfo[] {
  const dominantResourceMap = new Map<string, CampResource>()

  for (const region of regions) {
    const entries = Object.entries(region.resources) as [CampResource, number][]
    if (entries.length === 0) continue

    const [dominant] = entries.reduce((best, curr) =>
      (curr[1] ?? 0) > (best[1] ?? 0) ? curr : best
    )
    dominantResourceMap.set(region.id, dominant)
  }

  const resourceToRegions = new Map<CampResource, string[]>()
  for (const [regionId, resource] of dominantResourceMap) {
    const list = resourceToRegions.get(resource) ?? []
    list.push(regionId)
    resourceToRegions.set(resource, list)
  }

  const result: RegionDisplayInfo[] = []
  for (const region of regions) {
    const resource = dominantResourceMap.get(region.id)
    if (!resource) continue

    const sameResourceRegions = resourceToRegions.get(resource) ?? []
    const index = sameResourceRegions.indexOf(region.id)
    const suffix = sameResourceRegions.length > 1 ? index + 1 : undefined

    result.push({
      regionId: region.id,
      resourceKey: resource,
      suffix,
    })
  }

  return result
}
