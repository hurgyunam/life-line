import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useActivityStore } from '@/stores/activityStore';
import { useSurvivorStore } from '@/stores/survivorStore';
import type { ActivityLogEntry } from '@/stores/activityStore';
import type { ReservedActivityType } from '@/stores/survivorStore.types';
import { toMinutes } from '@/logic/survivorStoreUtils';
import { ACTIVITY_LOG } from '@/constants/gameConfig';

function LogLine({
    entry,
    survivorName,
}: {
    entry: ActivityLogEntry;
    survivorName: string;
}) {
    const { t } = useTranslation();
    const { at, type, reasonKey, reasonParams } = entry;
    const actionKey = `activityLog.started.${type}`;
    const action = t(actionKey);
    const reason =
        reasonKey && reasonParams
            ? t(`activityLog.reason.${reasonKey}`, reasonParams)
            : null;
    return (
        <p className="text-sm text-gray-700 py-0.5">
            {t('activityLog.line', {
                year: at.year,
                month: at.month,
                day: at.day,
                hour: at.hour,
                minute: at.minute,
                name: survivorName,
                action,
            })}
            {reason != null && (
                <span className="text-gray-500"> ({reason})</span>
            )}
        </p>
    );
}

export function ActivityLog() {
    const { t } = useTranslation();
    const survivors = useSurvivorStore((state) => state.survivors);
    const activityLogEntries = useActivityStore(
        (state) => state.activityLogEntries,
    );

    const [filterSurvivorId, setFilterSurvivorId] = useState('');
    const [filterType, setFilterType] = useState<ReservedActivityType | ''>('');
    const [page, setPage] = useState(1);

    const getSurvivorName = useCallback(
        (survivorId: string) =>
            survivors.find((s) => s.id === survivorId)?.name ?? survivorId,
        [survivors],
    );

    const sortedEntries = useMemo(() => {
        return [...activityLogEntries].sort(
            (a, b) => toMinutes(b.at) - toMinutes(a.at),
        );
    }, [activityLogEntries]);

    const filteredEntries = useMemo(() => {
        return sortedEntries.filter((entry) => {
            if (filterSurvivorId && entry.survivorId !== filterSurvivorId)
                return false;
            if (filterType && entry.type !== filterType) return false;
            return true;
        });
    }, [sortedEntries, filterSurvivorId, filterType]);

    const pageSize = ACTIVITY_LOG.PAGE_SIZE;
    const totalPages = Math.max(
        1,
        Math.ceil(filteredEntries.length / pageSize),
    );
    const safePage = Math.min(page, totalPages);
    const pageEntries = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredEntries.slice(start, start + pageSize);
    }, [filteredEntries, safePage, pageSize]);

    const goPrev = useCallback(() => {
        setPage((p) => Math.max(1, p - 1));
    }, []);
    const goNext = useCallback(() => {
        setPage((p) => Math.min(totalPages, p + 1));
    }, [totalPages]);

    const handleSurvivorChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setFilterSurvivorId(e.target.value);
            setPage(1);
        },
        [],
    );
    const handleTypeChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setFilterType(
                e.target.value === ''
                    ? ''
                    : (e.target.value as ReservedActivityType),
            );
            setPage(1);
        },
        [],
    );

    if (sortedEntries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-gray-500 text-sm">
                    {t('activityLog.empty')}
                </p>
            </div>
        );
    }

    return (
        <section className="px-1 space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{t('activityLog.filterSurvivor')}</span>
                    <select
                        value={filterSurvivorId}
                        onChange={handleSurvivorChange}
                        className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 min-w-[8rem]"
                    >
                        <option value="">{t('activityLog.filterAll')}</option>
                        {survivors.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{t('activityLog.filterType')}</span>
                    <select
                        value={filterType}
                        onChange={handleTypeChange}
                        className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 min-w-[10rem]"
                    >
                        <option value="">{t('activityLog.filterAll')}</option>
                        {ACTIVITY_LOG.FILTER_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {t(`reservedActivity.${type}`)}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {filteredEntries.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                    {t('activityLog.noMatches')}
                </p>
            ) : (
                <ul className="space-y-0">
                    {pageEntries.map((entry, index) => (
                        <li
                            key={`${entry.at.year}-${entry.at.month}-${entry.at.day}-${entry.at.hour}-${entry.at.minute}-${entry.survivorId}-${index}`}
                        >
                            <LogLine
                                entry={entry}
                                survivorName={getSurvivorName(entry.survivorId)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            {totalPages > 1 && filteredEntries.length > 0 && (
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={safePage <= 1}
                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        {t('activityLog.prevPage')}
                    </button>
                    <span className="text-sm text-gray-600">
                        {t('activityLog.pageInfo', {
                            current: safePage,
                            total: totalPages,
                        })}
                    </span>
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={safePage >= totalPages}
                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        {t('activityLog.nextPage')}
                    </button>
                </div>
            )}
        </section>
    );
}
