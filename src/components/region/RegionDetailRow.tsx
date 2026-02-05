import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Region } from '@/types/region'
import type { CampResource } from '@/types/resource'
import type { Facility } from '@/types/facility'
import { RESOURCE_ICONS } from '@/constants/resourceIcons'
import { FACILITY_ICONS } from '@/constants/facilityIcons'
import { useRegionCampStore } from '@/stores/regionCampStore'
import { FacilityBuildPopup } from '@/components/region/FacilityBuildPopup'

interface RegionDetailRowProps {
  region: Region
  isExpanded: boolean
}

export function RegionDetailRow({ region, isExpanded }: RegionDetailRowProps) {
  const { t } = useTranslation()
  const [showFacilityPopup, setShowFacilityPopup] = useState(false)
  const hasCamp = useRegionCampStore((s) => s.hasCamp(region.id))
  const buildCamp = useRegionCampStore((s) => s.buildCamp)
  const getFacilities = useRegionCampStore((s) => s.getFacilities)
  const installFacility = useRegionCampStore((s) => s.installFacility)

  const installedFacilities = getFacilities(region.id)

  if (!isExpanded) return null

  const entries = Object.entries(region.resources) as [CampResource, number][]
  const sortedEntries = [...entries].sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))

  const handleInstallFacility = (facility: Facility) => {
    installFacility(region.id, facility)
    setShowFacilityPopup(false)
  }

  return (
    <tr className="bg-gray-50">
      <td colSpan={2} className="px-2 py-3">
        <div className="text-gray-600 space-y-3 text-sm">
          <p className="text-xs font-medium text-gray-500">{t('regionList.resourceDistribution')}</p>
          <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {sortedEntries.map(([resourceKey, amount]) => (
              <div key={resourceKey} className="flex justify-between items-center gap-2">
                <span className="flex items-center gap-2 text-gray-700 min-w-0">
                  <span className="flex shrink-0 text-amber-600">
                    {RESOURCE_ICONS[resourceKey]}
                  </span>
                  {t(`campResources.${resourceKey}`)}
                </span>
                <span className="font-medium text-gray-900 tabular-nums shrink-0">{amount}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-3">
            {hasCamp && installedFacilities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  {t('regionList.installedFacilities')}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {installedFacilities.map((facility) => (
                    <li
                      key={facility}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                    >
                      <span className="flex shrink-0 text-indigo-600">
                        {FACILITY_ICONS[facility]}
                      </span>
                      {t(`facility.${facility}`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {!hasCamp ? (
                <button
                  type="button"
                  onClick={() => buildCamp(region.id)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  {t('regionList.buildCamp')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFacilityPopup(true)}
                  className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  {t('regionList.buildFacility')}
                </button>
              )}
            </div>
          </div>
        </div>

        {showFacilityPopup && (
          <FacilityBuildPopup
            regionId={region.id}
            installedFacilities={installedFacilities}
            onSelect={handleInstallFacility}
            onClose={() => setShowFacilityPopup(false)}
          />
        )}
      </td>
    </tr>
  )
}
