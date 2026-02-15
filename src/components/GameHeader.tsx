import { useEffect } from 'react'
import { useGameTimeStore, type GameSpeed } from '../stores/gameTimeStore'

const TICK_INTERVAL_MS = 100

export function GameHeader() {
  const { year, hour, minute, isPaused, speed, setPaused, setSpeed, tick } =
    useGameTimeStore()

  useEffect(() => {
    const id = setInterval(() => {
      useGameTimeStore.getState().tick()
    }, TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const timeLabel = `개척왕 ${year}년 ${hour}시 ${minute}분`

  const speedOptions: { value: GameSpeed; label: string }[] = [
    { value: 1, label: '1배속' },
    { value: 2, label: '2배속' },
    { value: 3, label: '3배속' },
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
            일시정지
          </button>
          {speedOptions.map(({ value, label }) => {
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
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
