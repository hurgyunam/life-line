import { useTranslation } from 'react-i18next'
import type { SleepingBag } from '@/types/sleepingBag'
import { SLEEPING_BAGS } from '@/types/sleepingBag'
import { SURVIVOR_BALANCE } from '@/constants/gameConfig'

interface SleepingBagSelectModalProps {
  currentSleepingBag: SleepingBag
  onSave: (sleepingBag: SleepingBag) => void
  onClose: () => void
}

export function SleepingBagSelectModal({
  currentSleepingBag,
  onSave,
  onClose,
}: SleepingBagSelectModalProps) {
  const { t } = useTranslation()

  const handleSelect = (sleepingBag: SleepingBag) => {
    onSave(sleepingBag)
  }

  // 침낭별 재고량 (임시로 하드코딩, 나중에 store에서 가져올 수 있음)
  const sleepingBagStocks: Record<SleepingBag, number> = {
    sleepingBag1: 2,
    sleepingBag2: 1,
    sleepingBag3: 1,
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
          {t('guidelines.selectSleepingBag')}
        </h3>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {SLEEPING_BAGS.map((sleepingBag) => {
            const stock = sleepingBagStocks[sleepingBag]
            const tirednessGain = SURVIVOR_BALANCE.SLEEPING_BAG_TIREDNESS_GAIN_PER_HOUR[sleepingBag]
            const isSelected = sleepingBag === currentSleepingBag

            return (
              <button
                key={sleepingBag}
                type="button"
                onClick={() => handleSelect(sleepingBag)}
                className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">
                      {t(`guidelines.sleepingBags.${sleepingBag}`)}
                    </div>
                    <div className={`text-xs mt-1 ${isSelected ? 'text-indigo-100' : 'text-gray-500'}`}>
                      {t('guidelines.stock')}: {stock} | {t('guidelines.tirednessGain')}: +{tirednessGain}
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
