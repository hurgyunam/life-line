import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { GameHeader } from '@/components/layout/GameHeader';
import { SurvivorList } from '@/components/survivor/SurvivorList';
import { useSurvivorStore } from '@/stores/survivorStore';
import type { Survivor } from '@/types/survivor';

const mockSurvivors: Survivor[] = [
    { id: '1', name: '김민수', age: 32, status: 'healthy', currentAction: 'farming_wildStrawberries', hunger: 85, tiredness: 70, thirst: 90, boredom: 75 },
    { id: '2', name: '이서연', age: 28, status: 'bored', currentAction: 'mining_stones', hunger: 60, tiredness: 55, thirst: 45, boredom: 30 },
    { id: '3', name: '박준호', age: 45, status: 'hungry', currentAction: 'cooking', hunger: 20, tiredness: 65, thirst: 50, boredom: 65 },
];

const meta = {
    title: '생존자/SurvivorList',
    component: SurvivorList,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-2xl p-4">
                <Story />
            </div>
        ),
    ],
    tags: ['autodocs'],
} satisfies Meta<typeof SurvivorList>;

export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { survivors: mockSurvivors },
    render: (args) => {
        const survivors = useSurvivorStore((state) => state.survivors);
        return <SurvivorList {...args} survivors={survivors} />;
    },
};

export const WithMockData: Story = {
    args: {
        survivors: mockSurvivors,
    },
};

/**
 * 게임 로직(GameHeader tick + survivorStore.decayByMinutes)으로 수치가 감소합니다.
 * 일시정지 시 멈추고, 배속에 따라 감소 속도가 달라집니다.
 */
export const TimeDecaySimulation: Story = {
    args: { survivors: mockSurvivors },
    parameters: {
        docs: {
            description: {
                story: 'GameHeader의 tick과 survivorStore.decayByMinutes를 사용합니다. 일시정지 해제 후 배속을 선택하면 수치가 감소합니다.',
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-2xl space-y-4 p-4">
                <Story />
            </div>
        ),
    ],
    render: function TimeDecaySimulationStory() {
        const survivors = useSurvivorStore((state) => state.survivors);
        useEffect(() => {
            useSurvivorStore.setState({ survivors: mockSurvivors });
        }, []);
        return (
            <>
                <GameHeader />
                <SurvivorList survivors={survivors} />
            </>
        );
    },
};
