import { useTranslation } from 'react-i18next'
import { CAMP_RESOURCES, type CampResource } from '@/types/resource'
import { useCampResourceStore } from '@/stores/campResourceStore'
import { RESOURCE_ICONS } from '@/constants/resourceIcons'

function ResourceChip({
  labelKey,
  count,
  iconKey,
}: {
  labelKey: string
  count: number
  iconKey?: string
}) {
  const { t } = useTranslation()
  const icon = iconKey ? RESOURCE_ICONS[iconKey as CampResource] : null
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm ring-1 ring-gray-200/60">
      <span className="flex items-center gap-2">
        {icon && <span className="flex shrink-0 text-amber-600">{icon}</span>}
        {t(labelKey)}
      </span>
      <span className="tabular-nums text-indigo-600">{count}</span>
    </div>
  )
}

export function CampResources() {
  const { t } = useTranslation()
  const quantities = useCampResourceStore((state) => state.quantities)

  const constructionKeys = CAMP_RESOURCES.CONSTRUCTION
  const foodKeys = CAMP_RESOURCES.CONSUMABLE.food

  const getCount = (key: CampResource) => quantities[key] ?? 0

  return (
    <div className="space-y-6">
      {/* 건축/조합 */}
      <section className="rounded-xl bg-gray-50 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {t('campResources.construction')}
        </h2>
        <ul className="grid grid-cols-2 gap-2">
          {constructionKeys.map((key) => (
            <li key={key} className="min-w-0">
              <ResourceChip iconKey={key} labelKey={`campResources.${key}`} count={getCount(key)} />
            </li>
          ))}
        </ul>
      </section>

      {/* 소비 */}
      <section className="rounded-xl bg-gray-50 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {t('campResources.consumable')}
        </h2>
        <div className="space-y-4">
          {/* 식수 */}
          <div>
            <h3 className="mb-2 text-xs font-medium text-gray-600">
              {t('campResources.water')}
            </h3>
            <ResourceChip iconKey="water" labelKey="campResources.water" count={getCount('water')} />
          </div>

          {/* 식량 */}
          <div>
            <h3 className="mb-2 text-xs font-medium text-gray-600">
              {t('campResources.food')}
            </h3>
            <ul className="grid grid-cols-2 gap-2">
              {foodKeys.map((key) => (
                <li key={key} className="min-w-0">
                  <ResourceChip iconKey={key} labelKey={`campResources.${key}`} count={getCount(key)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
