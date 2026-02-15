import * as LucideIcons from 'lucide-react';
import type { TechNodeBase, TechStatus } from '@/constants/tech';
import { TECH_TREE_LAYOUT } from '@/constants/gameConfig';

const { NODE_WIDTH, NODE_HEIGHT } = TECH_TREE_LAYOUT;

interface TechNodeCardProps {
  node: TechNodeBase;
  status: TechStatus;
  x: number;
  y: number;
  researchProgress?: number;
  onUnlock?: (id: string) => void;
}

const statusStyles: Record<TechStatus, string> = {
  locked: 'bg-gray-100 border-gray-300 text-gray-400',
  available: 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100',
  completed: 'bg-emerald-50 border-emerald-400 text-emerald-800',
};

export function TechNodeCard({
  node,
  status,
  x,
  y,
  researchProgress = 0,
  onUnlock,
}: TechNodeCardProps) {
  const IconComponent = LucideIcons[node.iconName] as React.ComponentType<{ className?: string }>;
  const icon = IconComponent ? <IconComponent className="h-6 w-6 shrink-0" /> : null;

  const canUnlock = status === 'available' && onUnlock;
  const isCompleted = status === 'completed';

  return (
    <div
      className={`absolute flex flex-col items-center justify-center rounded-xl border-2 transition-colors ${statusStyles[status]}`}
      style={{
        left: x,
        top: y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }}
      role={canUnlock ? 'button' : undefined}
      onClick={canUnlock ? () => onUnlock(node.id) : undefined}
      onKeyDown={
        canUnlock
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onUnlock(node.id);
              }
            }
          : undefined
      }
      tabIndex={canUnlock ? 0 : undefined}
      aria-label={`${node.title} (${status})`}
    >
      <span className="flex shrink-0">{icon}</span>
      <span className="mt-1 text-[10px] font-medium truncate w-full text-center px-1">
        {node.title}
      </span>
      {!isCompleted && researchProgress > 0 && researchProgress < 100 && (
        <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${researchProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
