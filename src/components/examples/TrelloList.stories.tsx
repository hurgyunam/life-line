import type { Meta, StoryObj } from '@storybook/react';
import { TrelloList } from '@/components/examples/TrelloList';

const meta = {
    title: '예제/TrelloList',
    component: TrelloList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof TrelloList>;

export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {};

export const WithCustomCards: Story = {
    args: {
        initialCards: [
            { id: '1', title: '프로젝트 기획', description: '새로운 기능 기획 및 문서화' },
            { id: '2', title: 'UI 디자인', description: '인터페이스 디자인 및 프로토타입 제작' },
            { id: '3', title: '개발 작업', description: '코드 구현 및 테스트' },
            { id: '4', title: '리뷰 및 수정', description: '코드 리뷰 및 피드백 반영' },
            { id: '5', title: '배포', description: '프로덕션 배포 및 모니터링' },
        ],
    },
};

export const Empty: Story = {
    args: {
        initialCards: [],
    },
};
