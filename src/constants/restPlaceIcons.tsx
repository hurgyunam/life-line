import {
    Bed,
    Dumbbell,
    Circle,
} from 'lucide-react';
import type { RestPlace } from '@/types/restPlace';

const iconClass = 'h-5 w-5 shrink-0';

export const REST_PLACE_ICONS: Record<RestPlace, React.ReactNode> = {
    bareGround: null, // 맨 땅은 아이콘 없음
    hammock: <Bed className={iconClass} />, // 흔들의자 - Bed 아이콘 사용
    wrestlingMat: <Dumbbell className={iconClass} />, // 씨름대 - Dumbbell 아이콘 사용
    soccerField: <Circle className={iconClass} />, // 축구장 - Circle 아이콘 사용 (Soccer는 lab 컬렉션에만 있음)
};
