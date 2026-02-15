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
  parts: (
    | { type: 'text'; content: string }
    | { type: 'button'; content: string; style: 'number' | 'food' | 'sleepingBag' | 'restPlace' }
  )[]
}

interface TrelloListWithButtonsProps {
  initialCards?: Card[]
}

export function TrelloListWithButtons({ initialCards = [] }: TrelloListWithButtonsProps) {
  const [cards, setCards] = useState<Card[]>(
    initialCards.length > 0
      ? initialCards
      : [
          {
            id: '1',
            parts: [
              { type: 'text', content: '배고픔이 ' },
              { type: 'button', content: '30', style: 'number' },
              { type: 'text', content: ' 이하면 ' },
              { type: 'button', content: '야생딸기', style: 'food' },
              { type: 'text', content: '을(를) 섭취한다.' },
            ],
          },
          {
            id: '2',
            parts: [
              { type: 'text', content: '피곤함이 ' },
              { type: 'button', content: '30', style: 'number' },
              { type: 'text', content: ' 이하면 남는 ' },
              { type: 'button', content: '침낭 1', style: 'sleepingBag' },
              { type: 'text', content: '에서 취침한다.' },
            ],
          },
          {
            id: '3',
            parts: [
              { type: 'text', content: '목마름이 ' },
              { type: 'button', content: '30', style: 'number' },
              { type: 'text', content: ' 이하일 경우 식수를 섭취한다.' },
            ],
          },
          {
            id: '4',
            parts: [
              { type: 'text', content: '지루함이 ' },
              { type: 'button', content: '30', style: 'number' },
              { type: 'text', content: ' 이하일 경우 ' },
              { type: 'button', content: '맨 땅', style: 'restPlace' },
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
      <h2 className="text-xl font-bold mb-4">버튼 포함 버전 (중간 복잡도)</h2>
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

  // Guidelines 스타일 + 버튼 포함 (드래그 중 최적화)
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
          {card.parts.map((part, index) => {
            if (part.type === 'text') {
              return <span key={index}>{part.content}</span>
            }
            if (part.type === 'button') {
              // 드래그 중에는 transition 제거하여 성능 최적화
              const baseClass = 'px-2 py-0.5 rounded font-semibold'
              const colorClass =
                part.style === 'number'
                  ? 'bg-indigo-100 text-indigo-700'
                  : part.style === 'food'
                    ? 'bg-emerald-100 text-emerald-700'
                    : part.style === 'sleepingBag'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
              const buttonClass = isDragging
                ? `${baseClass} ${colorClass}`
                : `${baseClass} ${colorClass} hover:opacity-80 active:opacity-70`
              return (
                <button
                  key={index}
                  type="button"
                  className={buttonClass}
                  onClick={() => console.log('Button clicked:', part.content)}
                  disabled={isDragging}
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
