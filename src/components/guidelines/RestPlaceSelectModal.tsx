import { useTranslation } from 'react-i18next'
import type { RestPlace } from '@/types/restPlace'
import { REST_PLACES } from '@/types/restPlace'
import { useRestPlaceStore } from '@/stores/restPlaceStore'

interface RestPlaceSelectModalProps {
  currentRestPlace: RestPlace
  onSave: (restPlace: RestPlace) => void
  onClose: () => void
}

export function RestPlaceSelectModal({
  currentRestPlace,
  onSave,
  onClose,
}: RestPlaceSelectModalProps) {
  const { t } = useTranslation()
  const stocks = useRestPlaceStore((state) => state.stocks)

  const handleSelect = (restPlace: RestPlace) => {
    const stock = stocks[restPlace] ?? 0
    if (stock > 0 || restPlace === 'bareGround') {
      onSave(restPlace)
    }
  }

  const isAvailable = (restPlace: RestPlace): boolean => {
    if (restPlace === 'bareGround') return true
    return (stocks[restPlace] ?? 0) > 0
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
          {t('guidelines.selectRestPlace')}
        </h3>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {REST_PLACES.map((restPlace) => {
            const isSelected = restPlace === currentRestPlace
            const available = isAvailable(restPlace)
            const stock = stocks[restPlace] ?? 0

            return (
              <button
                key={restPlace}
                type="button"
                onClick={() => handleSelect(restPlace)}
                disabled={!available}
                className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : available
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">
                      {t(`guidelines.restPlaces.${restPlace}`)}
                    </div>
                    {!available && restPlace !== 'bareGround' && (
                      <div className={`text-xs mt-1 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                        {t('guidelines.researchRequired')}
                      </div>
                    )}
                    {available && restPlace !== 'bareGround' && (
                      <div className={`text-xs mt-1 ${isSelected ? 'text-indigo-100' : 'text-gray-500'}`}>
                        {t('guidelines.stock')}: {stock}
                      </div>
                    )}
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
