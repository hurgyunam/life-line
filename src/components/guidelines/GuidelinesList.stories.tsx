import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { GuidelinesList } from '@/components/guidelines/GuidelinesList'
import { useCampResourceStore } from '@/stores/campResourceStore'
import { setSettings } from '@/utils/gameStorage'

const meta = {
  title: '행동 지침/GuidelinesList',
  component: GuidelinesList,
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
} satisfies Meta<typeof GuidelinesList>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    useEffect(() => {
      // 기본 설정 초기화
      setSettings({
        guidelinesValues: {
          hungerThreshold: 30,
          foodResource: 'wildStrawberry',
          tirednessThreshold: 30,
          sleepingBag: 'sleepingBag1',
          thirstThreshold: 30,
          boredomThreshold: 30,
          restPlace: 'bareGround',
        },
        guidelinesOrder: [
          'hungerThreshold',
          'tirednessThreshold',
          'thirstThreshold',
          'boredomThreshold',
        ],
      })
    }, [])
    return <GuidelinesList />
  },
}

export const WithCustomOrder: Story = {
  render: () => {
    const setQuantity = useCampResourceStore((s) => s.setQuantity)
    useEffect(() => {
      // 커스텀 순서로 설정
      setSettings({
        guidelinesValues: {
          hungerThreshold: 25,
          foodResource: 'potato',
          tirednessThreshold: 40,
          sleepingBag: 'sleepingBag2',
          thirstThreshold: 35,
          boredomThreshold: 20,
          restPlace: 'tent',
        },
        guidelinesOrder: [
          'boredomThreshold',
          'hungerThreshold',
          'thirstThreshold',
          'tirednessThreshold',
        ],
      })
      // 캠프 자원 설정 (음식 선택 모달에서 사용)
      setQuantity('wildStrawberry', 10)
      setQuantity('potato', 5)
      setQuantity('corn', 3)
    }, [setQuantity])
    return <GuidelinesList />
  },
}

export const WithCustomValues: Story = {
  render: () => {
    const setQuantity = useCampResourceStore((s) => s.setQuantity)
    useEffect(() => {
      // 커스텀 값으로 설정
      setSettings({
        guidelinesValues: {
          hungerThreshold: 50,
          foodResource: 'corn',
          tirednessThreshold: 60,
          sleepingBag: 'sleepingBag3',
          thirstThreshold: 45,
          boredomThreshold: 35,
          restPlace: 'cabin',
        },
        guidelinesOrder: [
          'hungerThreshold',
          'tirednessThreshold',
          'thirstThreshold',
          'boredomThreshold',
        ],
      })
      setQuantity('wildStrawberry', 20)
      setQuantity('potato', 15)
      setQuantity('corn', 8)
    }, [setQuantity])
    return <GuidelinesList />
  },
}
