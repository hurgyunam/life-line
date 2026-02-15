interface GaugeBarProps {
  label: string
  value: number
  max?: number
  color?: 'amber' | 'slate' | 'blue' | 'red' | 'emerald' | 'green' | 'gray'
}

const colorClasses: Record<NonNullable<GaugeBarProps['color']>, string> = {
    amber: 'bg-amber-500',
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    emerald: 'bg-emerald-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
};

export function GaugeBar({
    label,
    value,
    max = 100,
    color = 'gray',
}: GaugeBarProps) {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500 tabular-nums">{Math.round(percent)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${colorClasses[color]}`}
                    style={{ width: `${percent}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                    aria-label={label}
                />
            </div>
        </div>
    );
}
