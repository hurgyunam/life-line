import { useTranslation } from 'react-i18next';
import { useGameTimeStore } from '@/stores/gameTimeStore';
import { useSurvivorStore } from '@/stores/survivorStore';
import { useActivityStore } from '@/stores/activityStore';
import { useCampResourceStore } from '@/stores/campResourceStore';
import type { Survivor } from '@/types/survivor';
import { GaugeBar } from '@/components/ui/GaugeBar';
import { statusColors } from '@/components/survivor/SurvivorList';
import { GAME_TIME_CONFIG, ACTIVITY_BALANCE } from '@/constants/gameConfig';

function addMinutesToTime(
    year: number,
    hour: number,
    minute: number,
    add: number
): { year: number; hour: number; minute: number } {
    let m = minute + add;
    let h = hour;
    let y = year;
    if (m >= GAME_TIME_CONFIG.MINUTES_PER_HOUR) {
        h += Math.floor(m / GAME_TIME_CONFIG.MINUTES_PER_HOUR);
        m = m % GAME_TIME_CONFIG.MINUTES_PER_HOUR;
    }
    if (h >= GAME_TIME_CONFIG.HOURS_PER_DAY) {
        y += Math.floor(h / GAME_TIME_CONFIG.HOURS_PER_DAY);
        h = h % GAME_TIME_CONFIG.HOURS_PER_DAY;
    }
    return { year: y, hour: h, minute: m };
}

interface SurvivorDetailRowProps {
  survivor: Survivor
  isExpanded: boolean
}

export function SurvivorDetailRow({ survivor, isExpanded }: SurvivorDetailRowProps) {
    const { t } = useTranslation();
    const year = useGameTimeStore((state) => state.year);
    const hour = useGameTimeStore((state) => state.hour);
    const minute = useGameTimeStore((state) => state.minute);
    const advanceByMinutes = useGameTimeStore((state) => state.advanceByMinutes);

    const wildStrawberry = useCampResourceStore((s) => s.getQuantity('wildStrawberry'));
    const water = useCampResourceStore((s) => s.getQuantity('water'));
    const eatWildStrawberry = useSurvivorStore((state) => state.eatWildStrawberry);
    const drinkWater = useSurvivorStore((state) => state.drinkWater);
    const pendingActivities = useActivityStore((state) => state.pendingActivities);
    const startSearchFood = useActivityStore((state) => state.startSearchFood);
    const searchWater = useActivityStore((state) => state.searchWater);
    const searchSurvivor = useActivityStore((state) => state.searchSurvivor);
    const doResearch = useActivityStore((state) => state.doResearch);

    if (!isExpanded) return null;

    const isSearchingFood = pendingActivities.some(
        (a) => a.survivorId === survivor.id && a.type === 'searchFood'
    );
    const displayAction = isSearchingFood ? t('action.searching_food') : t(`action.${survivor.currentAction}`);

    return (
        <tr className="bg-gray-50">
            <td colSpan={5} className="px-2 py-3">
                <div className="text-gray-600 space-y-3 text-sm">
                    <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                        <div>
                            <span className="font-medium text-gray-700">{t('survivorDetail.name')}:</span> {survivor.name}
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">{t('survivorDetail.age')}:</span> {survivor.age}{t('survivorList.ageSuffix')}
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">{t('survivorDetail.status')}:</span>{' '}
                            <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    statusColors[survivor.status] ?? 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {t(`status.${survivor.status}`)}
                            </span>
                        </div>
                        <div className="sm:col-span-2">
                            <span className="font-medium text-gray-700">{t('survivorDetail.currentAction')}:</span> {displayAction}
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                        <p className="mb-2 text-xs font-medium text-gray-500">{t('survivorDetail.stock')}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-gray-700">{t('survivorDetail.wildStrawberryCount', { count: wildStrawberry })}</span>
                            <button
                                type="button"
                                onClick={() => eatWildStrawberry(survivor.id)}
                                disabled={wildStrawberry <= 0}
                                className="rounded bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {t('survivorDetail.eatWildStrawberry')}
                            </button>
                            <span className="text-gray-700">{t('survivorDetail.waterCount', { count: water })}</span>
                            <button
                                type="button"
                                onClick={() => drinkWater(survivor.id)}
                                disabled={water <= 0}
                                className="rounded bg-sky-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {t('survivorDetail.drinkWater')}
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                        <p className="mb-2 text-xs font-medium text-gray-500">{t('survivorDetail.activities')}</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const endAt = addMinutesToTime(
                                        year,
                                        hour,
                                        minute,
                                        ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR
                                    );
                                    startSearchFood(survivor.id, endAt);
                                }}
                                disabled={isSearchingFood}
                                className="rounded border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title={isSearchingFood ? t('survivorDetail.inProgress') : t('survivorDetail.hoursRequired', { hours: ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS })}
                            >
                                {t('survivorDetail.searchFood', { hours: ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS })}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    advanceByMinutes(ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR);
                                    searchWater();
                                }}
                                className="rounded border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100"
                                title={t('survivorDetail.hoursRequired', { hours: ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS })}
                            >
                                {t('survivorDetail.searchWater', { hours: ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS })}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    advanceByMinutes(ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR);
                                    searchSurvivor();
                                }}
                                className="rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                                title={t('survivorDetail.hoursRequired', { hours: ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS })}
                            >
                                {t('survivorDetail.searchSurvivor', { hours: ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS })}
                            </button>
                            <button
                                type="button"
                                onClick={() => doResearch()}
                                className="rounded border border-violet-300 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 hover:bg-violet-100"
                            >
                                {t('survivorDetail.doResearch')}
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                        <p className="mb-2 text-xs font-medium text-gray-500">{t('survivorDetail.statusIndicators')}</p>
                        <div className="space-y-2">
                            <GaugeBar label={t('survivorDetail.hunger')} value={survivor.hunger} color="amber" />
                            <GaugeBar label={t('survivorDetail.tiredness')} value={survivor.tiredness} color="blue" />
                            <GaugeBar label={t('survivorDetail.thirst')} value={survivor.thirst} color="slate" />
                            <GaugeBar label={t('survivorDetail.boredom')} value={survivor.boredom} color="green" />
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}
