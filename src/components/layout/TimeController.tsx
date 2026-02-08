import { useTranslation } from 'react-i18next';
import { useGameTimeStore, type GameSpeed } from '@/stores/gameTimeStore';

export function TimeController() {
    const { t } = useTranslation();
    const { year, hour, minute, isPaused, speed, setPaused, setSpeed } =
    useGameTimeStore();

    const timeLabel = t('gameHeader.timeFormat', {
        year,
        hour: String(hour).padStart(2, '0'),
        minute: String(minute).padStart(2, '0'),
    });

    const speedOptions: { value: GameSpeed; key: string }[] = [
        { value: 1, key: 'gameHeader.speed' },
        { value: 2, key: 'gameHeader.speed' },
        { value: 3, key: 'gameHeader.speed' },
    ];

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700 tabular-nums">
                {timeLabel}
            </span>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => setPaused(true)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        isPaused
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    aria-pressed={isPaused}
                >
                    {t('gameHeader.pause')}
                </button>
                {speedOptions.map(({ value, key }) => {
                    const active = !isPaused && speed === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setSpeed(value)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                                active
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            aria-pressed={active}
                        >
                            {t(key, { multiplier: value })}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
