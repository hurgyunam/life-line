import type { Meta, StoryObj } from '@storybook/react';
import { TrelloList } from '@/components/examples/TrelloList';
import { TrelloListSimple } from '@/components/examples/TrelloListSimple';
import { TrelloListWithButtons } from '@/components/examples/TrelloListWithButtons';
import { TrelloListGuidelinesStyle } from '@/components/examples/TrelloListGuidelinesStyle';
import { TrelloListGuidelinesOptimized } from '@/components/examples/TrelloListGuidelinesOptimized';
import { TrelloListGuidelinesAdvanced } from '@/components/examples/TrelloListGuidelinesAdvanced';

const meta = {
    title: '예제/드래그앤드랍 성능 비교',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>

// 원본 TrelloList (가장 빠름)
export const OriginalTrelloList: Story = {
    render: () => (
        <div className="w-full max-w-md mx-auto p-4">
            <TrelloList />
        </div>
    ),
};

// 가장 단순한 버전 (텍스트만)
export const SimpleTextOnly: Story = {
    render: () => (
        <div className="w-full max-w-2xl mx-auto p-4">
            <TrelloListSimple />
        </div>
    ),
};

// 버튼 포함 버전 (중간 복잡도)
export const WithButtons: Story = {
    render: () => (
        <div className="w-full max-w-2xl mx-auto p-4">
            <TrelloListWithButtons />
        </div>
    ),
};

// Guidelines 스타일 적용 버전 (가장 복잡)
export const GuidelinesStyle: Story = {
    render: () => (
        <div className="w-full max-w-2xl mx-auto p-4">
            <TrelloListGuidelinesStyle />
        </div>
    ),
};

// Guidelines 스타일 + 최적화 적용 버전 (중간)
export const GuidelinesOptimized: Story = {
    render: () => (
        <div className="w-full max-w-2xl mx-auto p-4">
            <TrelloListGuidelinesOptimized />
        </div>
    ),
};

// Guidelines 고급 버전 (i18n + 메모이제이션)
export const GuidelinesAdvanced: Story = {
    render: () => (
        <div className="w-full max-w-2xl mx-auto p-4">
            <TrelloListGuidelinesAdvanced />
        </div>
    ),
};
