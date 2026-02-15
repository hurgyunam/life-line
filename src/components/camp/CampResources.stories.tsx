import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { CampResources } from '@/components/camp/CampResources';
import { useCampResourceStore } from '@/stores/campResourceStore';

const meta = {
    title: '지역/캠프/CampResources',
    component: CampResources,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-md p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof CampResources>;

export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => <CampResources />,
};

export const WithResources: Story = {
    render: () => {
        const setQuantity = useCampResourceStore((s) => s.setQuantity);
        useEffect(() => {
            setQuantity('wood', 50);
            setQuantity('stone', 30);
            setQuantity('water', 20);
            setQuantity('potato', 15);
            setQuantity('corn', 8);
        }, [setQuantity]);
        return <CampResources />;
    },
};
