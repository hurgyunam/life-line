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
  text: string
}

interface TrelloListSimpleProps {
  initialCards?: Card[]
}

export function TrelloListSimple({ initialCards = [] }: TrelloListSimpleProps) {
  const [cards, setCards] = useState<Card[]>(
    initialCards.length > 0
      ? initialCards
      : [
          { id: '1', text: '배고픔이 30 이하면 야생딸기를 섭취한다.' },
          { id: '2', text: '피곤함이 30 이하면 남는 침낭 1에서 취침한다.' },
          { id: '3', text: '목마름이 30 이하일 경우 식수를 섭취한다.' },
          { id: '4', text: '지루함이 30 이하일 경우 맨 땅에서 휴식한다.' },
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
      <h2 className="text-xl font-bold mb-4">단순 텍스트 버전 (가장 단순)</h2>
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

  // 가장 단순한 버전: 텍스트만
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
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 leading-relaxed">{card.text}</p>
      </div>
    </div>
  )
}
