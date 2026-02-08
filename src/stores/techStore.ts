import { create } from 'zustand';
import { techTreeData } from '@/constants/tech';
import type { TechStatus } from '@/constants/tech';

export interface TechStoreState {
  /** 완료(해금)된 테크 ID 목록 */
  completedTechIds: string[];
  /** 특정 테크 연구 진행률 (0~100, 또는 cost 대비) - 옵션 */
  researchProgressByTech: Record<string, number>;
  /** 테크 ID별 상태 파생 */
  getStatus: (id: string) => TechStatus;
  /** 테크 해금 (연구 완료) */
  unlockTech: (id: string) => void;
  /** 연구 진행 추가 */
  addResearchProgress: (techId: string, amount: number) => void;
  /** 초기화 (로드 시) */
  setCompletedTechIds: (ids: string[]) => void;
}

function deriveStatus(
  id: string,
  completedIds: Set<string>,
  techMap: Map<string, { prerequisites: string[] }>
): TechStatus {
  if (completedIds.has(id)) return 'completed';
  const tech = techMap.get(id);
  if (!tech) return 'locked';
  const allPreReqsMet = tech.prerequisites.every((p) => completedIds.has(p));
  return allPreReqsMet ? 'available' : 'locked';
}

const techMap = new Map(techTreeData.map((t) => [t.id, { prerequisites: t.prerequisites }]));

export const useTechStore = create<TechStoreState>((set, get) => ({
  completedTechIds: [],
  researchProgressByTech: {},

  getStatus: (id: string) => {
    const completed = new Set(get().completedTechIds);
    return deriveStatus(id, completed, techMap);
  },

  unlockTech: (id: string) => {
    const tech = techTreeData.find((t) => t.id === id);
    if (!tech) return;
    const status = get().getStatus(id);
    if (status !== 'available' && status !== 'completed') return; // 선행 조건 미충족
    if (status === 'completed') return; // 이미 해금됨
    set((s) => ({
      completedTechIds: [...s.completedTechIds, id],
      researchProgressByTech: { ...s.researchProgressByTech, [id]: 100 },
    }));
  },

  addResearchProgress: (techId: string, amount: number) => {
    const tech = techTreeData.find((t) => t.id === techId);
    if (!tech || get().getStatus(techId) !== 'available') return;
    set((s) => {
      const current = s.researchProgressByTech[techId] ?? 0;
      const next = Math.min(100, current + amount);
      if (next >= 100) {
        return {
          completedTechIds: [...s.completedTechIds, techId],
          researchProgressByTech: { ...s.researchProgressByTech, [techId]: 100 },
        };
      }
      return {
        researchProgressByTech: { ...s.researchProgressByTech, [techId]: next },
      };
    });
  },

  setCompletedTechIds: (ids: string[]) => {
    set({ completedTechIds: ids });
  },
}));
