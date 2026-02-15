import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameTimeStore, type GameSpeed } from '@/stores/gameTimeStore'
import { useSurvivorStore } from '@/stores/survivorStore'
import { useActivityStore } from '@/stores/activityStore'
import { GAME_TIME_CONFIG } from '@/constants/gameConfig'

const TICK_INTERVAL_MS = 100

export function GameHeader() {
  const { t } = useTranslation()
  const { year, hour, minute, isPaused, speed, setPaused, setSpeed } =
    useGameTimeStore()

  useEffect(() => {
    const id = setInterval(() => {
      const gameState = useGameTimeStore.getState()
      useGameTimeStore.getState().tick()
      if (!gameState.isPaused) {
        const gameMinutes = gameState.speed * GAME_TIME_CONFIG.MINUTES_PER_TICK_BASE
        const pendingActivities = useActivityStore.getState().pendingActivities
        useSurvivorStore.getState().decayByMinutes(gameMinutes, pendingActivities)
      }
    }, TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const timeLabel = t('gameHeader.timeFormat', {
    year,
    hour: String(hour).padStart(2, '0'),
    minute: String(minute).padStart(2, '0'),
  })

  const speedOptions: { value: GameSpeed; key: string }[] = [
    { value: 1, key: 'gameHeader.speed' },
    { value: 2, key: 'gameHeader.speed' },
    { value: 3, key: 'gameHeader.speed' },
  ]

  return (
    <header className="shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-semibold text-gray-800 tabular-nums">
            {timeLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPaused(true)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isPaused
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            aria-pressed={isPaused}
          >
            {t('gameHeader.pause')}
          </button>
          {speedOptions.map(({ value, key }) => {
            const active = !isPaused && speed === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSpeed(value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                aria-pressed={active}
              >
                {t(key, { multiplier: value })}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
