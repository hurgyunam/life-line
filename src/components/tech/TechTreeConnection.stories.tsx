import type { Meta, StoryObj } from '@storybook/react';
import { TECH_TREE_LAYOUT } from '@/constants/gameConfig';
import { TechNodeCard } from './TechNodeCard';
import { techTreeData } from '@/constants/tech';
import {
    computeTechTreeLayout,
    getConnectionLines,
} from '@/utils/techTreeLayout';
import { useTechStore } from '@/stores/techStore';

const meta = {
    title: '테크 트리/TechTreeConnection',
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-[400px] p-4 bg-gray-100">
                <Story />
            </div>
        ),
    ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const { NODE_WIDTH, NODE_HEIGHT, TIER_GAP, NODE_GAP } = TECH_TREE_LAYOUT;

/** 최소 사례: t1-1과 t2-1 두 노드만, 위-아래 연결선 */
function TwoNodesWithLine() {
    const node1 = techTreeData.find((n) => n.id === 't1-1')!;
    const node2 = techTreeData.find((n) => n.id === 't2-1')!;

    // Tier 1: y = TIER_GAP
    // Tier 2: y = TIER_GAP + (NODE_HEIGHT + TIER_GAP)
    const y1 = NODE_GAP;
    const y2 = NODE_GAP + (NODE_HEIGHT + TIER_GAP);

    // 중앙 정렬 (노드 1개짜리 행)
    const centerX = (400 - NODE_WIDTH) / 2;
    const x1 = centerX;
    const x2 = centerX;

    const center1 = { x: x1 + NODE_WIDTH / 2, y: y1 + NODE_HEIGHT / 2 };
    const center2 = { x: x2 + NODE_WIDTH / 2, y: y2 + NODE_HEIGHT / 2 };

    const containerWidth = 400;
    const containerHeight = y2 + NODE_HEIGHT + NODE_GAP;

    return (
        <div className="relative bg-white rounded-xl border border-gray-300 overflow-visible">
            <p className="text-xs text-gray-500 p-2 border-b">
                최소 테스트: t1-1 → t2-1 연결선
            </p>
            <div
                className="relative"
                style={{ width: containerWidth, height: containerHeight }}
            >
                {/* SVG: 연결선 (노드 뒤에 렌더) */}
                <svg
                    className="absolute left-0 top-0"
                    width={containerWidth}
                    height={containerHeight}
                    style={{ zIndex: 0 }}
                >
                    <line
                        x1={center1.x}
                        y1={center1.y}
                        x2={center2.x}
                        y2={center2.y}
                        stroke="#64748b"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </svg>

                {/* 노드 (선 위에 렌더) */}
                <div className="relative" style={{ zIndex: 1 }}>
                    <TechNodeCard
                        node={node1}
                        status="available"
                        x={x1}
                        y={y1}
                    />
                    <TechNodeCard node={node2} status="locked" x={x2} y={y2} />
                </div>
            </div>
        </div>
    );
}

export const TwoNodesVertical: Story = {
    render: () => <TwoNodesWithLine />,
};

/** Tier 1 + Tier 2 각 3개, t1-1 → t2-1, t2-2 연결 */
function SameTierMultipleNodesStory() {
    const tier1Nodes = [
        techTreeData.find((n) => n.id === 't1-1')!,
        techTreeData.find((n) => n.id === 't1-2')!,
        techTreeData.find((n) => n.id === 't1-3')!,
    ];
    const tier2Nodes = [
        techTreeData.find((n) => n.id === 't2-1')!,
        techTreeData.find((n) => n.id === 't2-2')!,
        techTreeData.find((n) => n.id === 't2-3')!,
    ];

    const containerWidth = 400;
    const y1 = NODE_GAP;
    const y2 = NODE_GAP + (NODE_HEIGHT + TIER_GAP);

    const rowWidth = 3 * NODE_WIDTH + 2 * NODE_GAP;
    const startX = Math.max(NODE_GAP, (containerWidth - rowWidth) / 2);

    const getCenter = (x: number, y: number) => ({
        x: x + NODE_WIDTH / 2,
        y: y + NODE_HEIGHT / 2,
    });

    const pos: Record<string, { x: number; y: number }> = {
        't1-1': { x: startX, y: y1 },
        't1-2': { x: startX + (NODE_WIDTH + NODE_GAP), y: y1 },
        't1-3': { x: startX + 2 * (NODE_WIDTH + NODE_GAP), y: y1 },
        't2-1': { x: startX, y: y2 },
        't2-2': { x: startX + (NODE_WIDTH + NODE_GAP), y: y2 },
        't2-3': { x: startX + 2 * (NODE_WIDTH + NODE_GAP), y: y2 },
    };

    const center1 = getCenter(pos['t1-1'].x, pos['t1-1'].y);
    const center2_1 = getCenter(pos['t2-1'].x, pos['t2-1'].y);
    const center2_2 = getCenter(pos['t2-2'].x, pos['t2-2'].y);

    const containerHeight = y2 + NODE_HEIGHT + NODE_GAP;

    return (
        <div className="relative bg-white rounded-xl border border-gray-300 overflow-visible">
            <p className="text-xs text-gray-500 p-2 border-b">
                t1-1 → t2-1, t2-2 연결
            </p>
            <div
                className="relative"
                style={{ width: containerWidth, height: containerHeight }}
            >
                <svg
                    className="absolute left-0 top-0"
                    width={containerWidth}
                    height={containerHeight}
                    style={{ zIndex: 0 }}
                >
                    <line
                        x1={center1.x}
                        y1={center1.y}
                        x2={center2_1.x}
                        y2={center2_1.y}
                        stroke="#64748b"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <line
                        x1={center1.x}
                        y1={center1.y}
                        x2={center2_2.x}
                        y2={center2_2.y}
                        stroke="#64748b"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>

                <div className="relative" style={{ zIndex: 1 }}>
                    {tier1Nodes.map((node, idx) => (
                        <TechNodeCard
                            key={node.id}
                            node={node}
                            status={idx === 0 ? 'completed' : idx === 1 ? 'available' : 'locked'}
                            x={pos[node.id].x}
                            y={pos[node.id].y}
                        />
                    ))}
                    {tier2Nodes.map((node, idx) => (
                        <TechNodeCard
                            key={node.id}
                            node={node}
                            status={idx < 2 ? 'available' : 'locked'}
                            x={pos[node.id].x}
                            y={pos[node.id].y}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export const SameTierMultipleNodes: Story = {
    render: () => <SameTierMultipleNodesStory />,
};

/** Tier 1~2만 + computeTechTreeLayout/getConnectionLines 사용 (SameTier와 FullTechTree 중간) */
function LayoutUtilsTwoTiersStory() {
    const twoTierNodes = techTreeData.filter((n) => n.tier <= 2);
    const containerWidth = 400;
    const layout = computeTechTreeLayout(twoTierNodes, containerWidth);
    const connectionLines = getConnectionLines(twoTierNodes, layout.positions);

    const completedTechIds = useTechStore((s) => s.completedTechIds);
    const getStatus = useTechStore((s) => s.getStatus);
    const unlockTech = useTechStore((s) => s.unlockTech);

    return (
        <div className="relative bg-white rounded-xl border border-gray-300 overflow-visible">
            <p className="text-xs text-gray-500 p-2 border-b">
                layout 유틸 사용, Tier 1~2만 ({twoTierNodes.length}개, 연결선 {connectionLines.length}개, 해금 {completedTechIds.length})
            </p>
            <div
                className="relative"
                style={{ width: layout.width, height: layout.height }}
            >
                <svg
                    className="absolute left-0 top-0"
                    width={layout.width}
                    height={layout.height}
                    style={{ zIndex: 0 }}
                >
                    {connectionLines.map((line, i) => (
                        <line
                            key={i}
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
                    {twoTierNodes.map((node) => {
                        const pos = layout.positions.get(node.id);
                        if (!pos) return null;
                        return (
                            <TechNodeCard
                                key={node.id}
                                node={node}
                                status={getStatus(node.id)}
                                x={pos.x}
                                y={pos.y}
                                onUnlock={unlockTech}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export const LayoutUtilsTwoTiers: Story = {
    render: () => <LayoutUtilsTwoTiersStory />,
};

/** techTreeData 전체 + layout 유틸로 렌더 */
function FullTechTreeDataStory() {
    const containerWidth = 400;
    const layout = computeTechTreeLayout(techTreeData, containerWidth);
    const connectionLines = getConnectionLines(techTreeData, layout.positions);

    const completedTechIds = useTechStore((s) => s.completedTechIds);
    const getStatus = useTechStore((s) => s.getStatus);
    const unlockTech = useTechStore((s) => s.unlockTech);
    const researchProgressByTech = useTechStore((s) => s.researchProgressByTech);

    return (
        <div className="relative bg-white rounded-xl border border-gray-300 overflow-auto">
            <p className="text-xs text-gray-500 p-2 border-b sticky top-0 bg-white z-10">
                techTreeData 전체 ({techTreeData.length}개 노드, 해금 {completedTechIds.length}개)
            </p>
            <div
                className="relative"
                style={{
                    width: layout.width,
                    height: layout.height,
                    minHeight: 400,
                }}
            >
                <svg
                    className="absolute left-0 top-0"
                    width={layout.width}
                    height={layout.height}
                    style={{ zIndex: 0 }}
                >
                    {connectionLines.map((line, i) => (
                        <line
                            key={i}
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
                        return (
                            <TechNodeCard
                                key={node.id}
                                node={node}
                                status={getStatus(node.id)}
                                x={pos.x}
                                y={pos.y}
                                researchProgress={researchProgressByTech[node.id]}
                                onUnlock={unlockTech}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export const FullTechTreeData: Story = {
    render: () => <FullTechTreeDataStory />,
};

/** 연결선만 표시 (노드 없음) - 선이 보이는지 확인용 */
function LineOnly() {
    const y1 = NODE_GAP;
    const y2 = NODE_GAP + (NODE_HEIGHT + TIER_GAP);
    const centerX = 200;
    const center1 = { x: centerX, y: y1 + NODE_HEIGHT / 2 };
    const center2 = { x: centerX, y: y2 + NODE_HEIGHT / 2 };
    const containerHeight = y2 + NODE_HEIGHT + NODE_GAP;

    return (
        <div className="relative bg-white rounded-xl border border-gray-300">
            <p className="text-xs text-gray-500 p-2 border-b">
                디버그: 연결선만 (노드 없음)
            </p>
            <svg width={400} height={containerHeight}>
                <line
                    x1={center1.x}
                    y1={center1.y}
                    x2={center2.x}
                    y2={center2.y}
                    stroke="#64748b"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

export const LineOnlyDebug: Story = {
    render: () => <LineOnly />,
};
