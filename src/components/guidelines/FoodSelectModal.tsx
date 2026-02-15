import { useTranslation } from 'react-i18next'
import type { FoodResource } from '@/types/resource'
import type { CampResourceQuantities } from '@/stores/campResourceStore'
import { FOOD_RESOURCES } from '@/types/resource'
import { SURVIVOR_BALANCE } from '@/constants/gameConfig'

interface FoodSelectModalProps {
  currentFood: FoodResource
  campResources: CampResourceQuantities
  onSave: (food: FoodResource) => void
  onClose: () => void
}

export function FoodSelectModal({
  currentFood,
  campResources,
  onSave,
  onClose,
}: FoodSelectModalProps) {
  const { t } = useTranslation()

  const handleSelect = (food: FoodResource) => {
    onSave(food)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          {t('guidelines.selectFood')}
        </h3>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {FOOD_RESOURCES.map((food) => {
            const stock = campResources[food] ?? 0
            const hungerGain = SURVIVOR_BALANCE.FOOD_HUNGER_GAIN[food]
            const isSelected = food === currentFood

            return (
              <button
                key={food}
                type="button"
                onClick={() => handleSelect(food)}
                className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{t(`campResources.${food}`)}</div>
                    <div className={`text-xs mt-1 ${isSelected ? 'text-indigo-100' : 'text-gray-500'}`}>
                      {t('guidelines.stock')}: {stock} | {t('guidelines.hungerGain')}: +{hungerGain}
                    </div>
                  </div>
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
