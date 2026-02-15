import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { GameHeader } from '@/components/layout/GameHeader'
import { SurvivorList } from '@/components/survivor/SurvivorList'
import { useSurvivorStore } from '@/stores/survivorStore'
import type { Survivor } from '@/types/survivor'

const initialSurvivors: Survivor[] = [
  { id: '1', name: '김민수', age: 32, status: 'healthy', currentAction: 'farming_wildStrawberries', hunger: 90, tiredness: 85, thirst: 95, boredom: 80 },
  { id: '2', name: '이서연', age: 28, status: 'healthy', currentAction: 'mining_stones', hunger: 75, tiredness: 70, thirst: 80, boredom: 65 },
]

const meta = {
  title: '레이아웃/GameHeader',
  component: GameHeader,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-full min-w-[320px] max-w-md">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof GameHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <GameHeader />,
}

/**
 * GameHeader(게임 시간)와 SurvivorList(생존자 수치)를 함께 보여줍니다.
 * - 일시정지 시: 수치가 줄어들지 않습니다.
 * - 2배속 시: 1배속 대비 2배로 수치가 줄어듭니다.
 */
export const WithSurvivorListAndTimeDecay: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: '일시정지를 해제하고 배속을 선택하면 게임 시간이 흐르며 생존자 수치가 감소합니다. 일시정지 시 수치가 멈추고, 2배속일 때는 2배로 빠르게 감소합니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-4 space-y-4">
        <Story />
      </div>
    ),
  ],
  render: function WithSurvivorListAndTimeDecayStory() {
    const survivors = useSurvivorStore((state) => state.survivors)
    useEffect(() => {
      useSurvivorStore.setState({ survivors: initialSurvivors })
    }, [])
    return (
      <>
        <GameHeader />
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">생존자</h3>
          <SurvivorList survivors={survivors} />
        </div>
      </>
    )
  },
}
