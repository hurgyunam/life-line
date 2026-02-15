import type { Meta, StoryObj } from '@storybook/react';
import { TrelloListGuidelinesOptimized } from '@/components/examples/TrelloListGuidelinesOptimized';

const meta = {
    title: '예제/TrelloListGuidelinesOptimized',
    component: TrelloListGuidelinesOptimized,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof TrelloListGuidelinesOptimized>;

export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {};

export const WithCustomCards: Story = {
    args: {
        initialCards: [
            {
                id: '1',
                template: '배고픔이 {{hungerThreshold}} 이하면 {{foodResource}}을(를) 섭취한다.',
                parts: [
                    { type: 'text', content: '배고픔이 ' },
                    { type: 'numberButton', content: 25, key: 'hungerThreshold' },
                    { type: 'text', content: ' 이하면 ' },
                    { type: 'foodButton', content: '감자', key: 'foodResource' },
                    { type: 'text', content: '을(를) 섭취한다.' },
                ],
            },
            {
                id: '2',
                template: '피곤함이 {{tirednessThreshold}} 이하면 남는 {{sleepingBag}}에서 취침한다.',
                parts: [
                    { type: 'text', content: '피곤함이 ' },
                    { type: 'numberButton', content: 40, key: 'tirednessThreshold' },
                    { type: 'text', content: ' 이하면 남는 ' },
                    { type: 'sleepingBagButton', content: '침낭 2', key: 'sleepingBag' },
                    { type: 'text', content: '에서 취침한다.' },
                ],
            },
            {
                id: '3',
                template: '목마름이 {{thirstThreshold}} 이하일 경우 식수를 섭취한다.',
                parts: [
                    { type: 'text', content: '목마름이 ' },
                    { type: 'numberButton', content: 35, key: 'thirstThreshold' },
                    { type: 'text', content: ' 이하일 경우 식수를 섭취한다.' },
                ],
            },
            {
                id: '4',
                template: '지루함이 {{boredomThreshold}} 이하일 경우 {{restPlace}}에서 휴식한다.',
                parts: [
                    { type: 'text', content: '지루함이 ' },
                    { type: 'numberButton', content: 20, key: 'boredomThreshold' },
                    { type: 'text', content: ' 이하일 경우 ' },
                    { type: 'restPlaceButton', content: '흔들의자', key: 'restPlace' },
                    { type: 'text', content: '에서 휴식한다.' },
                ],
            },
        ],
    },
};
