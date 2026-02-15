
export interface Quest {
    id: string;
    name: string;
    description: string;
    rewards: {
        resources: {
            [key: string]: number;
        };
    };
    requirements: {
        [key: string]: number;
    };
    progress: number;
    status: 'inAvailable' | 'available' | 'inProgress' | 'completed';
}

export const QUEST_BALANCE = [
    {

    }
];