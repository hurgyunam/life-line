import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GripVertical } from 'lucide-react'
import { getSettings, setSettings } from '@/utils/gameStorage'
import { useCampResourceStore } from '@/stores/campResourceStore'
import { NumberEditModal } from './NumberEditModal'
import { FoodSelectModal } from './FoodSelectModal'
import { SleepingBagSelectModal } from './SleepingBagSelectModal'
import { RestPlaceSelectModal } from './RestPlaceSelectModal'
import type { FoodResource } from '@/types/resource'
import type { SleepingBag } from '@/types/sleepingBag'
import type { RestPlace } from '@/types/restPlace'

interface GuidelineTemplate {
  key: string
  template: string
  numberVariableKey?: string
  foodVariableKey?: string
  sleepingBagVariableKey?: string
  restPlaceVariableKey?: string
}

export function GuidelinesList() {
  const { t } = useTranslation()
  const [settings, setSettingsState] = useState(getSettings())
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingFood, setEditingFood] = useState<boolean>(false)
  const [editingSleepingBag, setEditingSleepingBag] = useState<boolean>(false)
  const [editingRestPlace, setEditingRestPlace] = useState<boolean>(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null)
  const campResources = useCampResourceStore((state) => state.quantities)

  // 설정이 변경될 때마다 상태 업데이트
  useEffect(() => {
    setSettingsState(getSettings())
  }, [editingKey, editingFood, editingSleepingBag, editingRestPlace])

  // 행동 지침 템플릿 정의
  const allGuidelineTemplates: Record<string, GuidelineTemplate> = {
    hungerThreshold: {
      key: 'hungerThreshold',
      template: t('guidelines.templates.hungerThreshold'),
      numberVariableKey: 'hungerThreshold',
      foodVariableKey: 'foodResource',
    },
    tirednessThreshold: {
      key: 'tirednessThreshold',
      template: t('guidelines.templates.tirednessThreshold'),
      numberVariableKey: 'tirednessThreshold',
      sleepingBagVariableKey: 'sleepingBag',
    },
    thirstThreshold: {
      key: 'thirstThreshold',
      template: t('guidelines.templates.thirstThreshold'),
      numberVariableKey: 'thirstThreshold',
    },
    boredomThreshold: {
      key: 'boredomThreshold',
      template: t('guidelines.templates.boredomThreshold'),
      numberVariableKey: 'boredomThreshold',
      restPlaceVariableKey: 'restPlace',
    },
  }

  // 순서에 따라 정렬된 템플릿 배열
  const guidelineTemplates = (settings.guidelinesOrder || [
    'hungerThreshold',
    'tirednessThreshold',
    'thirstThreshold',
    'boredomThreshold',
  ])
    .filter((key) => key in allGuidelineTemplates)
    .map((key) => allGuidelineTemplates[key])

  const renderGuideline = (template: GuidelineTemplate) => {
    const numberValue = template.numberVariableKey
      ? (typeof settings.guidelinesValues[template.numberVariableKey] === 'number'
          ? settings.guidelinesValues[template.numberVariableKey]
          : null) as number | null
      : null
    const foodValue = template.foodVariableKey
      ? (settings.guidelinesValues[template.foodVariableKey] as FoodResource) ?? 'wildStrawberry'
      : null
    const sleepingBagValue = template.sleepingBagVariableKey
      ? (settings.guidelinesValues[template.sleepingBagVariableKey] as SleepingBag) ?? 'sleepingBag1'
      : null
    const restPlaceValue = template.restPlaceVariableKey
      ? (settings.guidelinesValues[template.restPlaceVariableKey] as RestPlace) ?? 'bareGround'
      : null

    const templateText = template.template
    const parts: (
      | string
      | { type: 'numberButton'; key: string; value: number }
      | { type: 'foodButton'; key: string; value: FoodResource }
      | { type: 'sleepingBagButton'; key: string; value: SleepingBag }
      | { type: 'restPlaceButton'; key: string; value: RestPlace }
    )[] = []
    let lastIndex = 0

    // {{variableKey}} 패턴 찾기
    const regex = /\{\{(\w+)\}\}/g
    let match

    while ((match = regex.exec(templateText)) !== null) {
      // 이전 텍스트 추가
      if (match.index > lastIndex) {
        parts.push(templateText.slice(lastIndex, match.index))
      }

      // 변수 타입에 따라 버튼 추가
      const varKey = match[1]
      if (varKey === template.numberVariableKey && numberValue !== null) {
        parts.push({
          type: 'numberButton',
          key: `${template.numberVariableKey}-${match.index}`,
          value: numberValue,
        })
      } else if (varKey === template.foodVariableKey && foodValue !== null) {
        parts.push({
          type: 'foodButton',
          key: `${template.foodVariableKey}-${match.index}`,
          value: foodValue,
        })
      } else if (varKey === template.sleepingBagVariableKey && sleepingBagValue !== null) {
        parts.push({
          type: 'sleepingBagButton',
          key: `${template.sleepingBagVariableKey}-${match.index}`,
          value: sleepingBagValue,
        })
      } else if (varKey === template.restPlaceVariableKey && restPlaceValue !== null) {
        parts.push({
          type: 'restPlaceButton',
          key: `${template.restPlaceVariableKey}-${match.index}`,
          value: restPlaceValue,
        })
      } else {
        // 다른 변수는 텍스트로 표시
        parts.push(templateText.slice(match.index, match.index + match[0].length))
      }

      lastIndex = match.index + match[0].length
    }

    // 남은 텍스트 추가
    if (lastIndex < templateText.length) {
      parts.push(templateText.slice(lastIndex))
    }

    // 템플릿에 변수가 없으면 전체를 텍스트로
    if (parts.length === 0) {
      parts.push(templateText)
    }

    return parts
  }

  const handleNumberClick = (key: string) => {
    setEditingKey(key)
  }

  const handleFoodClick = () => {
    setEditingFood(true)
  }

  const handleSleepingBagClick = () => {
    setEditingSleepingBag(true)
  }

  const handleRestPlaceClick = () => {
    setEditingRestPlace(true)
  }

  const handleNumberSave = (key: string, value: number) => {
    const newSettings = {
      guidelinesValues: {
        ...settings.guidelinesValues,
        [key]: value,
      },
    }
    setSettings(newSettings)
    setSettingsState({ ...settings, ...newSettings })
    setEditingKey(null)
  }

  const handleFoodSave = (foodResource: FoodResource) => {
    const newSettings = {
      guidelinesValues: {
        ...settings.guidelinesValues,
        foodResource,
      },
    }
    setSettings(newSettings)
    setSettingsState({ ...settings, ...newSettings })
    setEditingFood(false)
  }

  const handleSleepingBagSave = (sleepingBag: SleepingBag) => {
    const newSettings = {
      guidelinesValues: {
        ...settings.guidelinesValues,
        sleepingBag,
      },
    }
    setSettings(newSettings)
    setSettingsState({ ...settings, ...newSettings })
    setEditingSleepingBag(false)
  }

  const handleRestPlaceSave = (restPlace: RestPlace) => {
    const newSettings = {
      guidelinesValues: {
        ...settings.guidelinesValues,
        restPlace,
      },
    }
    setSettings(newSettings)
    setSettingsState({ ...settings, ...newSettings })
    setEditingRestPlace(false)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedIndex === null || draggedIndex === index) return
    
    setDragOverIndex(index)
    
    // 마우스 위치에 따라 위/아래 결정
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseY = e.clientY
    const elementCenterY = rect.top + rect.height / 2
    
    if (mouseY < elementCenterY) {
      setDropPosition('above')
    } else {
      setDropPosition('below')
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
    setDropPosition(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedIndex === null) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      setDropPosition(null)
      return
    }

    const currentOrder = settings.guidelinesOrder || [
      'hungerThreshold',
      'tirednessThreshold',
      'thirstThreshold',
      'boredomThreshold',
    ]
    
    // 드롭 위치에 따라 최종 인덱스 결정
    let finalDropIndex = dropIndex
    if (dropPosition === 'below') {
      finalDropIndex = dropIndex + 1
    }
    
    // 같은 위치면 변경 없음
    if (draggedIndex === finalDropIndex || (draggedIndex === dropIndex && dropPosition === 'above')) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      setDropPosition(null)
      return
    }

    const newOrder = [...currentOrder]
    const [removed] = newOrder.splice(draggedIndex, 1)
    
    // 최종 드롭 인덱스 조정 (제거 후 인덱스 변화 고려)
    let adjustedDropIndex = finalDropIndex
    if (draggedIndex < finalDropIndex) {
      adjustedDropIndex = finalDropIndex - 1
    }
    newOrder.splice(adjustedDropIndex, 0, removed)

    const newSettings = {
      guidelinesOrder: newOrder,
    }
    setSettings(newSettings)
    setSettingsState({ ...settings, ...newSettings })
    
    setDraggedIndex(null)
    setDragOverIndex(null)
    setDropPosition(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    setDropPosition(null)
  }

  return (
    <>
      <div className="space-y-4">
        {guidelineTemplates.map((template, index) => {
          const parts = renderGuideline(template)
          const isDragging = draggedIndex === index
          const isDragOver = dragOverIndex === index
          const showDropPlaceholderAbove =
            isDragOver && dropPosition === 'above' && draggedIndex !== index
          const showDropPlaceholderBelow =
            isDragOver && dropPosition === 'below' && draggedIndex !== index

          return (
            <div key={template.key}>
              {/* 드롭 위치 표시 (위쪽) */}
              {showDropPlaceholderAbove && (
                <div className="mb-4 h-2 rounded-lg bg-indigo-200 border-2 border-dashed border-indigo-400" />
              )}

              {/* 드래그 중인 아이템의 원래 위치에 빈 공간 표시 */}
              {isDragging ? (
                <div className="rounded-lg bg-gray-100 p-4 border-2 border-dashed border-gray-300">
                  <div className="h-6" />
                </div>
              ) : (
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`rounded-lg bg-gray-50 p-4 border border-gray-200 flex items-start gap-3 cursor-move transition-all ${
                    isDragOver ? 'border-indigo-400 bg-indigo-50' : ''
                  }`}
                >
                  <div className="shrink-0 pt-1 text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 leading-relaxed flex flex-wrap items-center gap-1">
                      {parts.map((part, partIndex) => {
                        if (typeof part === 'string') {
                          return <span key={partIndex}>{part}</span>
                        }
                        if (part.type === 'numberButton') {
                          return (
                            <button
                              key={part.key}
                              type="button"
                              onClick={() => handleNumberClick(template.numberVariableKey!)}
                              className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 active:bg-indigo-300 transition-colors"
                            >
                              {part.value}
                            </button>
                          )
                        }
                        if (part.type === 'foodButton') {
                          return (
                            <button
                              key={part.key}
                              type="button"
                              onClick={handleFoodClick}
                              className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold hover:bg-emerald-200 active:bg-emerald-300 transition-colors"
                            >
                              {t(`campResources.${part.value}`)}
                            </button>
                          )
                        }
                        if (part.type === 'sleepingBagButton') {
                          return (
                            <button
                              key={part.key}
                              type="button"
                              onClick={handleSleepingBagClick}
                              className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 active:bg-blue-300 transition-colors"
                            >
                              {t(`guidelines.sleepingBags.${part.value}`)}
                            </button>
                          )
                        }
                        if (part.type === 'restPlaceButton') {
                          return (
                            <button
                              key={part.key}
                              type="button"
                              onClick={handleRestPlaceClick}
                              className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 active:bg-purple-300 transition-colors"
                            >
                              {t(`guidelines.restPlaces.${part.value}`)}
                            </button>
                          )
                        }
                        return null
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* 드롭 위치 표시 (아래쪽) */}
              {showDropPlaceholderBelow && (
                <div className="mt-4 h-2 rounded-lg bg-indigo-200 border-2 border-dashed border-indigo-400" />
              )}
            </div>
          )
        })}
      </div>

      {editingKey && (
        <NumberEditModal
          key={editingKey}
          variableKey={editingKey}
          currentValue={
            typeof settings.guidelinesValues[editingKey] === 'number'
              ? (settings.guidelinesValues[editingKey] as number)
              : 30
          }
          onSave={(value) => handleNumberSave(editingKey, value)}
          onClose={() => setEditingKey(null)}
        />
      )}

      {editingFood && (
        <FoodSelectModal
          currentFood={
            (settings.guidelinesValues.foodResource as FoodResource) ?? 'wildStrawberry'
          }
          campResources={campResources}
          onSave={handleFoodSave}
          onClose={() => setEditingFood(false)}
        />
      )}

      {editingSleepingBag && (
        <SleepingBagSelectModal
          currentSleepingBag={
            (settings.guidelinesValues.sleepingBag as SleepingBag) ?? 'sleepingBag1'
          }
          onSave={handleSleepingBagSave}
          onClose={() => setEditingSleepingBag(false)}
        />
      )}

      {editingRestPlace && (
        <RestPlaceSelectModal
          currentRestPlace={
            (settings.guidelinesValues.restPlace as RestPlace) ?? 'bareGround'
          }
          onSave={handleRestPlaceSave}
          onClose={() => setEditingRestPlace(false)}
        />
      )}
    </>
  )
}
