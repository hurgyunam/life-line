import { useTranslation } from 'react-i18next';
import { useActivityStore } from '@/stores/activityStore';
import { useSurvivorStore } from '@/stores/survivorStore';
import { useGameTimeStore } from '@/stores/gameTimeStore';
import type {
    PendingActivity,
    ReservedActivity,
} from '@/stores/survivorStore.types';
import { GAME_TIME_CONFIG } from '@/constants/gameConfig';

function formatRemainingMinutes(
    nowYear: number,
    nowHour: number,
    nowMinute: number,
    endYear: number,
    endHour: number,
    endMinute: number,
): string {
    const nowM =
        nowYear *
            GAME_TIME_CONFIG.HOURS_PER_DAY *
            GAME_TIME_CONFIG.MINUTES_PER_HOUR +
        nowHour * GAME_TIME_CONFIG.MINUTES_PER_HOUR +
        nowMinute;
    const endM =
        endYear *
            GAME_TIME_CONFIG.HOURS_PER_DAY *
            GAME_TIME_CONFIG.MINUTES_PER_HOUR +
        endHour * GAME_TIME_CONFIG.MINUTES_PER_HOUR +
        endMinute;
    const remaining = endM - nowM;
    if (remaining <= 0) return '0분';
    const hours = Math.floor(remaining / GAME_TIME_CONFIG.MINUTES_PER_HOUR);
    const mins = remaining % GAME_TIME_CONFIG.MINUTES_PER_HOUR;
    if (hours > 0) return `${hours}시간 ${mins}분`;
    return `${mins}분`;
}

function PendingActivityRow({
    activity,
    survivorName,
    onCancel,
    remaining,
}: {
    activity: PendingActivity;
    survivorName: string;
    onCancel: (id: string) => void;
    remaining: string;
}) {
    const { t } = useTranslation();
    const labelKey =
        activity.type === 'searchFood'
            ? 'reservedActivity.searchFood'
            : activity.type === 'restWithSleepingBag'
                ? 'reservedActivity.restWithSleepingBag'
                : 'reservedActivity.restAtPlace';

    return (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm">
            <div className="min-w-0 flex-1">
                <p className="font-medium text-indigo-900 truncate">
                    {survivorName}
                </p>
                <p className="text-indigo-700 text-xs mt-0.5">
                    {t(labelKey)} · {remaining}
                </p>
            </div>
            <span className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-indigo-200 text-indigo-800">
                {t('survivorDetail.inProgress')}
            </span>
            <button
                type="button"
                onClick={() => onCancel(activity.id)}
                className="rounded border border-indigo-300 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors shrink-0"
            >
                {t('reservedActivity.remove')}
            </button>
        </div>
    );
}

function ReservedActivityRow({
    activity,
    survivorName,
    onRemove,
}: {
    activity: ReservedActivity;
    survivorName: string;
    onRemove: (id: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                    {survivorName}
                </p>
                <p className="text-gray-600 text-xs mt-0.5">
                    {t(`reservedActivity.${activity.type}`)}
                </p>
            </div>
            <button
                type="button"
                onClick={() => onRemove(activity.id)}
                className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
            >
                {t('reservedActivity.remove')}
            </button>
        </div>
    );
}

export function ActivityLog() {
    const { t } = useTranslation();
    const survivors = useSurvivorStore((state) => state.survivors);
    const pendingActivities = useActivityStore(
        (state) => state.pendingActivities,
    );
    const reservedActivities = useActivityStore(
        (state) => state.reservedActivities,
    );
    const cancelPendingActivity = useActivityStore(
        (state) => state.cancelPendingActivity,
    );
    const removeReservedActivity = useActivityStore(
        (state) => state.removeReservedActivity,
    );
    const year = useGameTimeStore((state) => state.year);
    const hour = useGameTimeStore((state) => state.hour);
    const minute = useGameTimeStore((state) => state.minute);

    const getSurvivorName = (survivorId: string) =>
        survivors.find((s) => s.id === survivorId)?.name ?? survivorId;

    const hasAnyActivity =
        pendingActivities.length > 0 || reservedActivities.length > 0;

    if (!hasAnyActivity) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-gray-500 text-sm">
                    {t('activityLog.empty')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 진행 중 활동 */}
            <section>
                <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('activityLog.inProgress')}
                </h2>
                {pendingActivities.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">
                        {t('activityLog.noInProgress')}
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {pendingActivities.map((activity) => (
                            <li key={activity.id}>
                                <PendingActivityRow
                                    activity={activity}
                                    survivorName={getSurvivorName(
                                        activity.survivorId,
                                    )}
                                    onCancel={cancelPendingActivity}
                                    remaining={formatRemainingMinutes(
                                        year,
                                        hour,
                                        minute,
                                        activity.endAt.year,
                                        activity.endAt.hour,
                                        activity.endAt.minute,
                                    )}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* 예약된 활동 */}
            <section>
                <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('activityLog.reserved')}
                </h2>
                {reservedActivities.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">
                        {t('reservedActivity.empty')}
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {reservedActivities.map((activity) => (
                            <li key={activity.id}>
                                <ReservedActivityRow
                                    activity={activity}
                                    survivorName={getSurvivorName(
                                        activity.survivorId,
                                    )}
                                    onRemove={removeReservedActivity}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
