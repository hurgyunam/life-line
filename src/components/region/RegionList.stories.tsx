import type { Meta, StoryObj } from '@storybook/react';
import { RegionList } from '@/components/region/RegionList';

const meta = {
    title: '지역/캠프/RegionList',
    component: RegionList,
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof RegionList>;

export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {};
