import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface Card {
  id: string
  title: string
  description?: string
}

interface TrelloListProps {
  initialCards?: Card[]
}

export function TrelloList({ initialCards = [] }: TrelloListProps) {
    const [cards, setCards] = useState<Card[]>(
        initialCards.length > 0
            ? initialCards
            : [
                { id: '1', title: '할 일 1', description: '첫 번째 작업' },
                { id: '2', title: '할 일 2', description: '두 번째 작업' },
                { id: '3', title: '할 일 3', description: '세 번째 작업' },
                { id: '4', title: '할 일 4', description: '네 번째 작업' },
            ]
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setCards((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Trello 스타일 리스트</h2>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={cards} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {cards.map((card) => (
                            <SortableCard key={card.id} card={card} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
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
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
                aria-label="드래그 핸들"
            >
                <GripVertical size={20} />
            </button>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
                {card.description && (
                    <p className="text-sm text-gray-600">{card.description}</p>
                )}
            </div>
        </div>
    );
}
