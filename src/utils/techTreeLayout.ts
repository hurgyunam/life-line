import { TECH_TREE_LAYOUT } from '@/constants/gameConfig';
import type { TechNodeBase } from '@/constants/tech';

export interface NodePosition {
  x: number;
  y: number;
  centerX: number;
  centerY: number;
}

export interface TechTreeLayoutResult {
  positions: Map<string, NodePosition>;
  width: number;
  height: number;
  tiers: number;
}

const { NODE_WIDTH, NODE_HEIGHT, TIER_GAP, NODE_GAP } = TECH_TREE_LAYOUT;

/** tier별 노드 그룹화 */
function groupByTier(nodes: TechNodeBase[]): Map<number, TechNodeBase[]> {
  const map = new Map<number, TechNodeBase[]>();
  for (const node of nodes) {
    const list = map.get(node.tier) ?? [];
    list.push(node);
    map.set(node.tier, list);
  }
  return map;
}

/** 컨테이너 너비 기준 tier 기반 자동 레이아웃 계산 */
export function computeTechTreeLayout(
  nodes: TechNodeBase[],
  containerWidth: number
): TechTreeLayoutResult {
  const tierMap = groupByTier(nodes);
  const tiers = tierMap.size > 0 ? Math.max(...tierMap.keys()) : 0;
  const positions = new Map<string, NodePosition>();

  const paddingX = NODE_GAP;
  const paddingY = TIER_GAP;

  const sortedTiers = [...tierMap.keys()].sort((a, b) => a - b);

  for (const tierNum of sortedTiers) {
    const tierNodes = tierMap.get(tierNum)!;
    const tierIndex = tierNum - 1;
    const y = paddingY + tierIndex * (NODE_HEIGHT + TIER_GAP);
    const rowWidth = tierNodes.length * NODE_WIDTH + (tierNodes.length - 1) * NODE_GAP;
    const startX = Math.max(paddingX, (containerWidth - rowWidth) / 2);

    tierNodes.forEach((node, idx) => {
      const x = startX + idx * (NODE_WIDTH + NODE_GAP);
      positions.set(node.id, {
        x,
        y,
        centerX: x + NODE_WIDTH / 2,
        centerY: y + NODE_HEIGHT / 2,
      });
    });
  }

  const width = containerWidth;
  const height =
    tiers > 0
      ? paddingY * 2 + tiers * NODE_HEIGHT + (tiers - 1) * TIER_GAP
      : 0;

  return { positions, width, height, tiers };
}

export function getConnectionLines(
  nodes: TechNodeBase[],
  positions: Map<string, NodePosition>
): Array<{ from: { x: number; y: number }; to: { x: number; y: number } }> {
  const lines: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }> = [];
  for (const node of nodes) {
    const toPos = positions.get(node.id);
    if (!toPos) continue;
    for (const preId of node.prerequisites) {
      const fromPos = positions.get(preId);
      if (fromPos) {
        lines.push({
          from: { x: fromPos.centerX, y: fromPos.centerY },
          to: { x: toPos.centerX, y: toPos.centerY },
        });
      }
    }
  }
  return lines;
}
