import { useState } from 'react'
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
import { GripVertical } from 'lucide-react'

interface Card {
  id: string
  template: string // GuidelinesList의 템플릿 텍스트
  parts: (
    | { type: 'text'; content: string }
    | { type: 'numberButton'; content: number; key: string }
    | { type: 'foodButton'; content: string; key: string }
    | { type: 'sleepingBagButton'; content: string; key: string }
    | { type: 'restPlaceButton'; content: string; key: string }
  )[]
}

interface TrelloListGuidelinesStyleProps {
  initialCards?: Card[]
}

export function TrelloListGuidelinesStyle({ initialCards = [] }: TrelloListGuidelinesStyleProps) {
  const [cards, setCards] = useState<Card[]>(
    initialCards.length > 0
      ? initialCards
      : [
          {
            id: '1',
            template: '배고픔이 {{hungerThreshold}} 이하면 {{foodResource}}을(를) 섭취한다.',
            parts: [
              { type: 'text', content: '배고픔이 ' },
              { type: 'numberButton', content: 30, key: 'hungerThreshold' },
              { type: 'text', content: ' 이하면 ' },
              { type: 'foodButton', content: '야생딸기', key: 'foodResource' },
              { type: 'text', content: '을(를) 섭취한다.' },
            ],
          },
          {
            id: '2',
            template: '피곤함이 {{tirednessThreshold}} 이하면 남는 {{sleepingBag}}에서 취침한다.',
            parts: [
              { type: 'text', content: '피곤함이 ' },
              { type: 'numberButton', content: 30, key: 'tirednessThreshold' },
              { type: 'text', content: ' 이하면 남는 ' },
              { type: 'sleepingBagButton', content: '침낭 1', key: 'sleepingBag' },
              { type: 'text', content: '에서 취침한다.' },
            ],
          },
          {
            id: '3',
            template: '목마름이 {{thirstThreshold}} 이하일 경우 식수를 섭취한다.',
            parts: [
              { type: 'text', content: '목마름이 ' },
              { type: 'numberButton', content: 30, key: 'thirstThreshold' },
              { type: 'text', content: ' 이하일 경우 식수를 섭취한다.' },
            ],
          },
          {
            id: '4',
            template: '지루함이 {{boredomThreshold}} 이하일 경우 {{restPlace}}에서 휴식한다.',
            parts: [
              { type: 'text', content: '지루함이 ' },
              { type: 'numberButton', content: 30, key: 'boredomThreshold' },
              { type: 'text', content: ' 이하일 경우 ' },
              { type: 'restPlaceButton', content: '맨 땅', key: 'restPlace' },
              { type: 'text', content: '에서 휴식한다.' },
            ],
          },
        ]
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Guidelines 스타일 적용 테스트</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface SortableCardProps {
  card: Card
}

function SortableCard({ card }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // GuidelinesList와 동일한 HTML 구조와 스타일 적용
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg bg-gray-50 p-4 border border-gray-200 flex items-start gap-3 transition-all hover:shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0 pt-1"
        aria-label="드래그 핸들"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 leading-relaxed flex flex-wrap items-center gap-1">
          {/* GuidelinesList와 동일한 구조로 복잡한 렌더링 */}
          {card.parts.map((part, index) => {
            if (part.type === 'text') {
              return <span key={index}>{part.content}</span>
            }
            if (part.type === 'numberButton') {
              return (
                <button
                  key={part.key}
                  type="button"
                  className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 active:bg-indigo-300 transition-colors"
                  onClick={() => console.log('Number clicked:', part.content)}
                >
                  {part.content}
                </button>
              )
            }
            if (part.type === 'foodButton') {
              return (
                <button
                  key={part.key}
                  type="button"
                  className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold hover:bg-emerald-200 active:bg-emerald-300 transition-colors"
                  onClick={() => console.log('Food clicked:', part.content)}
                >
                  {part.content}
                </button>
              )
            }
            if (part.type === 'sleepingBagButton') {
              return (
                <button
                  key={part.key}
                  type="button"
                  className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 active:bg-blue-300 transition-colors"
                  onClick={() => console.log('SleepingBag clicked:', part.content)}
                >
                  {part.content}
                </button>
              )
            }
            if (part.type === 'restPlaceButton') {
              return (
                <button
                  key={part.key}
                  type="button"
                  className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 active:bg-purple-300 transition-colors"
                  onClick={() => console.log('RestPlace clicked:', part.content)}
                >
                  {part.content}
                </button>
              )
            }
            return null
          })}
        </p>
      </div>
    </div>
  )
}
