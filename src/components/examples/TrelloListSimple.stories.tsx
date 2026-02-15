import type { Meta, StoryObj } from '@storybook/react';
import { TrelloListSimple } from '@/components/examples/TrelloListSimple';

const meta = {
    title: '예제/TrelloListSimple',
    component: TrelloListSimple,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof TrelloListSimple>;

export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {};

export const WithCustomCards: Story = {
    args: {
        initialCards: [
            { id: '1', text: '배고픔이 25 이하면 감자를 섭취한다.' },
            { id: '2', text: '피곤함이 40 이하면 남는 침낭 2에서 취침한다.' },
            { id: '3', text: '목마름이 35 이하일 경우 식수를 섭취한다.' },
            { id: '4', text: '지루함이 20 이하일 경우 흔들의자에서 휴식한다.' },
        ],
    },
};
