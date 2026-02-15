import type { Meta, StoryObj } from '@storybook/react'
import { TrelloListWithButtons } from '@/components/examples/TrelloListWithButtons'

const meta = {
  title: '예제/TrelloListWithButtons',
  component: TrelloListWithButtons,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TrelloListWithButtons>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
