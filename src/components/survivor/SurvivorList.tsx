import type { Survivor, SurvivorStatus } from '@/types/survivor';
import { SurvivorSwipeList } from '@/components/survivor/SurvivorSwipeList';

interface SurvivorListProps {
  survivors: Survivor[]
}

export const statusColors: Record<SurvivorStatus, string> = {
    hungry: 'bg-amber-100 text-amber-800',
    bored: 'bg-slate-100 text-slate-700',
    tired: 'bg-blue-100 text-blue-800',
    stressed: 'bg-red-100 text-red-800',
    healthy: 'bg-emerald-100 text-emerald-800',
    satisfied: 'bg-green-100 text-green-800',
};

export function SurvivorList({ survivors }: SurvivorListProps) {
    return <SurvivorSwipeList survivors={survivors} />;
}
