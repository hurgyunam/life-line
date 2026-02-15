import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { TimeController } from '@/components/layout/TimeController';
import { useGameTimeStore } from '@/stores/gameTimeStore';
import { GAME_TIME_CONFIG } from '@/constants/gameConfig';

const ONE_DAY_MINUTES =
    GAME_TIME_CONFIG.HOURS_PER_DAY * GAME_TIME_CONFIG.MINUTES_PER_HOUR;
const ONE_MONTH_MINUTES = GAME_TIME_CONFIG.DAYS_PER_MONTH * ONE_DAY_MINUTES;
const ONE_YEAR_MINUTES = GAME_TIME_CONFIG.MONTHS_PER_YEAR * ONE_MONTH_MINUTES;

function RolloverTestUI() {
    const { advanceByMinutes } = useGameTimeStore();

    const setTime = (args: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
    }) => {
        useGameTimeStore.setState(args);
    };

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
                <h3 className="mb-1 text-xs font-medium text-gray-500">
                    현재 게임 시간
                </h3>
                <TimeController />
            </div>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() =>
                        setTime({
                            year: 1,
                            month: 1,
                            day: 1,
                            hour: 23,
                            minute: 50,
                        })
                    }
                    className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                >
                    1년 1월 1일 23:50
                </button>
                <button
                    type="button"
                    onClick={() =>
                        setTime({
                            year: 1,
                            month: 1,
                            day: 30,
                            hour: 23,
                            minute: 50,
                        })
                    }
                    className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                >
                    1년 1월 30일 23:50
                </button>
                <button
                    type="button"
                    onClick={() =>
                        setTime({
                            year: 1,
                            month: 12,
                            day: 30,
                            hour: 23,
                            minute: 50,
                        })
                    }
                    className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                >
                    1년 12월 30일 23:50
                </button>
            </div>
            <div>
                <h3 className="mb-1 text-xs font-medium text-gray-500">
                    시간 진행 (분 추가)
                </h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => advanceByMinutes(15)}
                        className="rounded bg-amber-200 px-2 py-1 text-xs hover:bg-amber-300"
                    >
                        + 15분
                    </button>
                    <button
                        type="button"
                        onClick={() => advanceByMinutes(ONE_DAY_MINUTES)}
                        className="rounded bg-emerald-200 px-2 py-1 text-xs hover:bg-emerald-300"
                    >
                        + 1일
                    </button>
                    <button
                        type="button"
                        onClick={() => advanceByMinutes(ONE_MONTH_MINUTES)}
                        className="rounded bg-sky-200 px-2 py-1 text-xs hover:bg-sky-300"
                    >
                        + 1달
                    </button>
                    <button
                        type="button"
                        onClick={() => advanceByMinutes(ONE_YEAR_MINUTES)}
                        className="rounded bg-violet-200 px-2 py-1 text-xs hover:bg-violet-300"
                    >
                        + 1년
                    </button>
                </div>
            </div>
            <p className="text-xs text-gray-500">
                예: 1년 1월 1일 23:50 → +15분 → 1년 1월 2일 0:05 (다음날)
                <br />
                1년 1월 30일 23:50 → +15분 → 1년 2월 1일 0:05 (다음달)
                <br />
                1년 12월 30일 23:50 → +15분 → 2년 1월 1일 0:05 (다음해)
            </p>
        </div>
    );
}

const meta = {
    title: '레이아웃/게임 시간 롤오버',
    component: TimeController,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    '게임 시간이 다음 날·다음 달·다음 해로 올바르게 넘어가는지 확인합니다. 위 버튼으로 시점을 정한 뒤 "+ 15분" 등으로 진행해 보세요.',
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="w-full min-w-[320px] max-w-md">
                <Story />
            </div>
        ),
    ],
    tags: ['autodocs'],
} satisfies Meta<typeof TimeController>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: 롤오버 테스트용 UI (초기화 버튼 + 분 추가 버튼) */
export const RolloverTest: Story = {
    render: () => <RolloverTestUI />,
};

/** 다음날 넘김: 1년 1월 1일 23:50에서 15분 진행 → 1년 1월 2일 0:05 */
export const NextDay: Story = {
    render: function NextDayStory() {
        useEffect(() => {
            useGameTimeStore.setState({
                year: 1,
                month: 1,
                day: 1,
                hour: 23,
                minute: 50,
            });
            const id = setTimeout(() => {
                useGameTimeStore.getState().advanceByMinutes(15);
            }, 500);
            return () => clearTimeout(id);
        }, []);
        return (
            <div className="space-y-2">
                <p className="text-sm text-gray-600">
                    1년 1월 1일 23:50 + 15분 → 다음날 0:05
                </p>
                <TimeController />
            </div>
        );
    },
};

/** 다음달 넘김: 1년 1월 30일 23:50에서 15분 진행 → 1년 2월 1일 0:05 */
export const NextMonth: Story = {
    render: function NextMonthStory() {
        useEffect(() => {
            useGameTimeStore.setState({
                year: 1,
                month: 1,
                day: 30,
                hour: 23,
                minute: 50,
            });
            const id = setTimeout(() => {
                useGameTimeStore.getState().advanceByMinutes(15);
            }, 500);
            return () => clearTimeout(id);
        }, []);
        return (
            <div className="space-y-2">
                <p className="text-sm text-gray-600">
                    1년 1월 30일 23:50 + 15분 → 2월 1일 0:05
                </p>
                <TimeController />
            </div>
        );
    },
};

/** 다음해 넘김: 1년 12월 30일 23:50에서 15분 진행 → 2년 1월 1일 0:05 */
export const NextYear: Story = {
    render: function NextYearStory() {
        useEffect(() => {
            useGameTimeStore.setState({
                year: 1,
                month: 12,
                day: 30,
                hour: 23,
                minute: 50,
            });
            const id = setTimeout(() => {
                useGameTimeStore.getState().advanceByMinutes(15);
            }, 500);
            return () => clearTimeout(id);
        }, []);
        return (
            <div className="space-y-2">
                <p className="text-sm text-gray-600">
                    1년 12월 30일 23:50 + 15분 → 2년 1월 1일 0:05
                </p>
                <TimeController />
            </div>
        );
    },
};
