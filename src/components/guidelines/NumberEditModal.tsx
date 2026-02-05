import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface NumberEditModalProps {
  variableKey: string
  currentValue: number
  onSave: (value: number) => void
  onClose: () => void
}

export function NumberEditModal({
  variableKey,
  currentValue,
  onSave,
  onClose,
}: NumberEditModalProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState(currentValue.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 모달이 열릴 때 입력 필드에 포커스
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      onSave(numValue)
    }
  }

  const handleCancel = () => {
    setValue(currentValue.toString())
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          {t('guidelines.editValue')}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t('guidelines.value')}
            </label>
            <input
              ref={inputRef}
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="0"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-xl bg-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              {t('settings.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
