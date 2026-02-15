import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
  const campResources = useCampResourceStore((state) => state.quantities)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 설정이 변경될 때마다 상태 업데이트
  useEffect(() => {
    setSettingsState(getSettings())
  }, [editingKey, editingFood, editingSleepingBag, editingRestPlace])

  // 행동 지침 템플릿 정의 (메모이제이션)
  const allGuidelineTemplates: Record<string, GuidelineTemplate> = useMemo(
    () => ({
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
    }),
    [t]
  )

  // 순서에 따라 정렬된 템플릿 배열 (메모이제이션)
  const guidelineTemplates = useMemo(
    () =>
      (settings.guidelinesOrder || [
        'hungerThreshold',
        'tirednessThreshold',
        'thirstThreshold',
        'boredomThreshold',
      ])
        .filter((key) => key in allGuidelineTemplates)
        .map((key) => allGuidelineTemplates[key]),
    [settings.guidelinesOrder, allGuidelineTemplates]
  )

  const renderGuideline = useCallback(
    (template: GuidelineTemplate) => {
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
    },
    [settings.guidelinesValues]
  )

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const currentOrder = settings.guidelinesOrder || [
        'hungerThreshold',
        'tirednessThreshold',
        'thirstThreshold',
        'boredomThreshold',
      ]

      const oldIndex = currentOrder.findIndex((key) => key === active.id)
      const newIndex = currentOrder.findIndex((key) => key === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(currentOrder, oldIndex, newIndex)

        const newSettings = {
          guidelinesOrder: newOrder,
        }
        setSettings(newSettings)
        setSettingsState({ ...settings, ...newSettings })
      }
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={guidelineTemplates.map((t) => t.key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {guidelineTemplates.map((template) => (
              <SortableGuidelineItem
                key={template.key}
                template={template}
                onNumberClick={handleNumberClick}
                onFoodClick={handleFoodClick}
                onSleepingBagClick={handleSleepingBagClick}
                onRestPlaceClick={handleRestPlaceClick}
                renderGuideline={renderGuideline}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

interface SortableGuidelineItemProps {
  template: GuidelineTemplate
  onNumberClick: (key: string) => void
  onFoodClick: () => void
  onSleepingBagClick: () => void
  onRestPlaceClick: () => void
  renderGuideline: (template: GuidelineTemplate) => (
    | string
    | { type: 'numberButton'; key: string; value: number }
    | { type: 'foodButton'; key: string; value: FoodResource }
    | { type: 'sleepingBagButton'; key: string; value: SleepingBag }
    | { type: 'restPlaceButton'; key: string; value: RestPlace }
  )[]
}

const SortableGuidelineItem = memo(function SortableGuidelineItem({
  template,
  onNumberClick,
  onFoodClick,
  onSleepingBagClick,
  onRestPlaceClick,
  renderGuideline,
}: SortableGuidelineItemProps) {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // renderGuideline 결과를 메모이제이션하여 드래그 중 불필요한 재계산 방지
  const parts = useMemo(() => renderGuideline(template), [template, renderGuideline])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg bg-gray-50 p-4 border border-gray-200 flex items-start gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0 pt-1"
        aria-label="드래그 핸들"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0" style={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
        <p className="text-gray-800 leading-relaxed flex flex-wrap items-center gap-1">
          {parts.map((part, partIndex) => {
            if (typeof part === 'string') {
              return <span key={partIndex}>{part}</span>
            }
            if (part.type === 'numberButton') {
              // 드래그 중에는 transition 제거하여 성능 최적화
              const buttonClass = isDragging
                ? 'px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold'
                : 'px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold hover:opacity-80 active:opacity-70'
              return (
                <button
                  key={part.key}
                  type="button"
                  onClick={() => onNumberClick(template.numberVariableKey!)}
                  className={buttonClass}
                  disabled={isDragging}
                >
                  {part.value}
                </button>
              )
            }
            if (part.type === 'foodButton') {
              const buttonClass = isDragging
                ? 'px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold'
                : 'px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold hover:opacity-80 active:opacity-70'
              return (
                <button
                  key={part.key}
                  type="button"
                  onClick={onFoodClick}
                  className={buttonClass}
                  disabled={isDragging}
                >
                  {t(`campResources.${part.value}`)}
                </button>
              )
            }
            if (part.type === 'sleepingBagButton') {
              const buttonClass = isDragging
                ? 'px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold'
                : 'px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold hover:opacity-80 active:opacity-70'
              return (
                <button
                  key={part.key}
                  type="button"
                  onClick={onSleepingBagClick}
                  className={buttonClass}
                  disabled={isDragging}
                >
                  {t(`guidelines.sleepingBags.${part.value}`)}
                </button>
              )
            }
            if (part.type === 'restPlaceButton') {
              const buttonClass = isDragging
                ? 'px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold'
                : 'px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold hover:opacity-80 active:opacity-70'
              return (
                <button
                  key={part.key}
                  type="button"
                  onClick={onRestPlaceClick}
                  className={buttonClass}
                  disabled={isDragging}
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
  )
})
