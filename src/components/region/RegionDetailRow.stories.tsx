import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { RegionDetailRow } from '@/components/region/RegionDetailRow';
import { useRegionCampStore } from '@/stores/regionCampStore';
import type { Region } from '@/types/region';

const sampleRegion: Region = {
    id: 'region-sample',
    resources: {
        wood: 100,
        stone: 50,
        ironOre: 20,
        water: 30,
    },
};

const meta = {
    title: '지역/캠프/RegionDetailRow',
    component: RegionDetailRow,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-md">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <tbody className="divide-y divide-gray-200 bg-white">
                        <Story />
                    </tbody>
                </table>
            </div>
        ),
    ],
} satisfies Meta<typeof RegionDetailRow>;

export default meta;

type Story = StoryObj<typeof meta>

export const Collapsed: Story = {
    args: {
        region: sampleRegion,
        isExpanded: false,
    },
};

export const Expanded: Story = {
    args: {
        region: sampleRegion,
        isExpanded: true,
    },
};

export const ExpandedWithManyResources: Story = {
    args: {
        region: {
            id: 'region-rich',
            resources: {
                wood: 90,
                stone: 95,
                ironOre: 100,
                cotton: 80,
                leather: 45,
                water: 50,
                wildStrawberry: 20,
                potato: 70,
            },
        },
        isExpanded: true,
    },
};

const regionWithCamp: Region = {
    id: 'region-with-camp',
    resources: {
        wood: 80,
        stone: 60,
        water: 40,
    },
};

function RegionWithCampSetup() {
    const buildCamp = useRegionCampStore((s) => s.buildCamp);
    const installFacility = useRegionCampStore((s) => s.installFacility);
    useEffect(() => {
        buildCamp(regionWithCamp.id);
        installFacility(regionWithCamp.id, 'workshop');
        installFacility(regionWithCamp.id, 'farm');
    }, [buildCamp, installFacility]);
    return <RegionDetailRow region={regionWithCamp} isExpanded />; 
}

/** 캠프 건설 후 시설 설치 UI - 캠프 건설 버튼 대신 시설 건설 버튼과 설치된 시설 목록 표시 */
export const ExpandedWithCampAndFacilities: Story = {
    args: {
        region: regionWithCamp,
        isExpanded: true,
    },
    render: () => <RegionWithCampSetup />,
};
