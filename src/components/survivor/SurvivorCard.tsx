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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSurvivorStore } from '@/stores/survivorStore'
import type { Survivor } from '@/types/survivor'
import type { ReservedActivity, ReservedActivityType } from '@/stores/survivorStore'
import { GaugeBar } from '@/components/ui/GaugeBar'
import { statusColors } from '@/components/survivor/SurvivorList'
import { ACTIVITY_BALANCE } from '@/constants/gameConfig'

interface SurvivorCardProps {
  survivor: Survivor
}

export function SurvivorCard({ survivor }: SurvivorCardProps) {
  const { t } = useTranslation()
  const pendingActivities = useSurvivorStore((state) => state.pendingActivities)
  const reservedActivities = useSurvivorStore((state) => state.reservedActivities)
  const addReservedActivity = useSurvivorStore((state) => state.addReservedActivity)
  const removeReservedActivity = useSurvivorStore((state) => state.removeReservedActivity)
  const reorderReservedActivities = useSurvivorStore((state) => state.reorderReservedActivities)
  const cancelPendingActivity = useSurvivorStore((state) => state.cancelPendingActivity)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const isSearchingFood = pendingActivities.some(
    (a) => a.survivorId === survivor.id && a.type === 'searchFood'
  )
  const displayAction = isSearchingFood ? t('action.searching_food') : t('action.waiting')

  const thisSurvivorReservations = reservedActivities.filter((a) => a.survivorId === survivor.id)
  const thisSurvivorPending = pendingActivities.find(
    (a) => a.survivorId === survivor.id && a.type === 'searchFood'
  )

  const handleAddReservation = (type: ReservedActivityType) => {
    addReservedActivity(survivor.id, type)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = thisSurvivorReservations.findIndex((a) => a.id === active.id)
      const newIndex = thisSurvivorReservations.findIndex((a) => a.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderReservedActivities(survivor.id, oldIndex, newIndex)
      }
    }
  }

  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
      {/* 카드 헤더 */}
      <div className="shrink-0 bg-gradient-to-br from-indigo-50 to-slate-50 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{survivor.name}</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {survivor.age}{t('survivorList.ageSuffix')} · {t(`status.${survivor.status}`)}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              statusColors[survivor.status] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {t(`status.${survivor.status}`)}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {t('survivorDetail.currentAction')}: {displayAction}
        </p>
      </div>

      {/* 카드 본문 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {/* 활동 예약 리스트 */}
        <section>
          <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('reservedActivity.title')}</h4>
          {thisSurvivorReservations.length === 0 && !thisSurvivorPending ? (
            <p className="text-sm text-gray-400 py-1">{t('reservedActivity.empty')}</p>
          ) : (
            <>
              {thisSurvivorPending && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-indigo-800 font-medium">{t('reservedActivity.searchFood')}</span>
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-indigo-200 text-indigo-800">
                      {t('survivorDetail.inProgress')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => cancelPendingActivity(thisSurvivorPending.id)}
                    className="rounded border border-indigo-300 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors shrink-0"
                  >
                    {t('reservedActivity.remove')}
                  </button>
                </div>
              )}
              {thisSurvivorReservations.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={thisSurvivorReservations.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-2">
                      {thisSurvivorReservations.map((res) => (
                        <SortableReservedItem
                          key={res.id}
                          res={res}
                          onRemove={() => removeReservedActivity(res.id)}
                          t={t}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              ) : null}
            </>
          )}
        </section>

        {/* 소지품 + 예약 추가 버튼 */}
        <section>
          <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('survivorDetail.inventory')}</h4>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-700">{t('survivorDetail.wildStrawberryCount', { count: survivor.inventory.wildStrawberry })}</span>
            <button
              type="button"
              onClick={() => handleAddReservation('eatWildStrawberry')}
              disabled={survivor.inventory.wildStrawberry <= 0}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              + {t('survivorDetail.eatWildStrawberry')}
            </button>
            <span className="text-sm text-gray-700">{t('survivorDetail.waterCount', { count: survivor.inventory.water })}</span>
            <button
              type="button"
              onClick={() => handleAddReservation('drinkWater')}
              disabled={survivor.inventory.water <= 0}
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              + {t('survivorDetail.drinkWater')}
            </button>
          </div>
        </section>

        {/* 활동 + 예약 추가 버튼 */}
        <section>
          <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('survivorDetail.activities')}</h4>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleAddReservation('searchFood')}
              disabled={isSearchingFood}
              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              title={isSearchingFood ? t('survivorDetail.inProgress') : t('survivorDetail.hoursRequired', { hours: ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS })}
            >
              + {t('survivorDetail.searchFood', { hours: ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS })}
            </button>
            <button
              type="button"
              onClick={() => handleAddReservation('searchWater')}
              className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800 hover:bg-sky-100 transition-colors"
              title={t('survivorDetail.hoursRequired', { hours: ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS })}
            >
              + {t('survivorDetail.searchWater', { hours: ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS })}
            </button>
            <button
              type="button"
              onClick={() => handleAddReservation('searchSurvivor')}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
              title={t('survivorDetail.hoursRequired', { hours: ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS })}
            >
              + {t('survivorDetail.searchSurvivor', { hours: ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS })}
            </button>
            <button
              type="button"
              onClick={() => handleAddReservation('doResearch')}
              className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-800 hover:bg-violet-100 transition-colors"
            >
              + {t('survivorDetail.doResearch')}
            </button>
          </div>
        </section>

        {/* 상태 지표 */}
        <section>
          <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('survivorDetail.statusIndicators')}</h4>
          <div className="space-y-2">
            <GaugeBar label={t('survivorDetail.hunger')} value={survivor.hunger} color="amber" />
            <GaugeBar label={t('survivorDetail.tiredness')} value={survivor.tiredness} color="blue" />
            <GaugeBar label={t('survivorDetail.thirst')} value={survivor.thirst} color="slate" />
            <GaugeBar label={t('survivorDetail.boredom')} value={survivor.boredom} color="green" />
          </div>
        </section>
      </div>
    </article>
  )
}

interface SortableReservedItemProps {
  res: ReservedActivity
  onRemove: () => void
  t: (key: string) => string
}

function SortableReservedItem({ res, onRemove, t }: SortableReservedItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: res.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0 touch-none"
        aria-label={t('reservedActivity.dragHandle')}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="flex-1 min-w-0 text-gray-700" style={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
        {t(`reservedActivity.${res.type}`)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
        disabled={isDragging}
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        {t('reservedActivity.remove')}
      </button>
    </li>
  )
}
