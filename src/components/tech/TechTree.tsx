import { useRef, useEffect, useState, useMemo } from 'react';
import { techTreeData } from '@/constants/tech';
import { useTechStore } from '@/stores/techStore';
import {
  computeTechTreeLayout,
  getConnectionLines,
} from '@/utils/techTreeLayout';
import { TechNodeCard } from './TechNodeCard';

export function TechTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

  const completedTechIds = useTechStore((s) => s.completedTechIds);
  const getStatus = useTechStore((s) => s.getStatus);
  const unlockTech = useTechStore((s) => s.unlockTech);
  const researchProgressByTech = useTechStore((s) => s.researchProgressByTech);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect.width) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(
    () => computeTechTreeLayout(techTreeData, containerWidth),
    [containerWidth]
  );

  const connectionLines = useMemo(
    () => getConnectionLines(techTreeData, layout.positions),
    [layout.positions]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-auto min-h-[400px]"
      style={{ minHeight: layout.height + 32 }}
      data-completed-count={completedTechIds.length}
    >
      <svg
        className="absolute left-0 top-0 pointer-events-none"
        width={layout.width}
        height={layout.height}
        style={{ zIndex: 0 }}
      >
        {connectionLines.map((line, i) => (
          <line
            key={`${line.from.x}-${line.from.y}-${line.to.x}-${line.to.y}`}
            x1={line.from.x}
            y1={line.from.y}
            x2={line.to.x}
            y2={line.to.y}
            stroke="#64748b"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
      </svg>

      <div className="relative" style={{ zIndex: 1 }}>
        {techTreeData.map((node) => {
          const pos = layout.positions.get(node.id);
          if (!pos) return null;

          const status = getStatus(node.id);
          const progress = researchProgressByTech[node.id] ?? 0;

          return (
            <TechNodeCard
              key={node.id}
              node={node}
              status={status}
              x={pos.x}
              y={pos.y}
              researchProgress={progress}
              onUnlock={unlockTech}
            />
          );
        })}
      </div>
    </div>
  );
}
