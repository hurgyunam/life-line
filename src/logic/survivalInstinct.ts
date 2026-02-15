/**
 * 생존 본능: 상태 지수가 기준(5%) 미만일 때 해당 지수를 채우는 활동 타입 반환
 * 행동 지침과 무관하게 적용됨
 */

import type { Survivor } from '@/types/survivor';
import type { ReservedActivityType } from '@/stores/survivorStore.types';
import type { RestPlace } from '@/types/restPlace';
import { SURVIVAL_INSTINCT_THRESHOLD } from '@/constants/gameConfig';
import { useCampResourceStore } from '@/stores/campResourceStore';
import { useRestPlaceStore } from '@/stores/restPlaceStore';
import { getSettings } from '@/utils/gameStorage';

export interface SurvivalInstinctResult {
    type: ReservedActivityType;
}

/**
 * 생존자 상태 지수 중 기준(5%) 미만인 것이 있으면, 그 지수를 채우는 활동 타입을 반환.
 * 여러 개면 가장 낮은 지수 하나만 선택. 실행 가능한 활동만 반환(재고/휴식장소 등).
 */
export function getSurvivalInstinctActivity(
    survivor: Survivor,
): SurvivalInstinctResult | null {
    const threshold = SURVIVAL_INSTINCT_THRESHOLD;
    const candidates: { stat: number; type: ReservedActivityType }[] = [];

    if (survivor.hunger < threshold) {
        const qty = useCampResourceStore
            .getState()
            .getQuantity('wildStrawberry');
        if (qty > 0)
            candidates.push({
                stat: survivor.hunger,
                type: 'eatWildStrawberry',
            });
    }
    if (survivor.thirst < threshold) {
        const qty = useCampResourceStore.getState().getQuantity('water');
        if (qty > 0)
            candidates.push({ stat: survivor.thirst, type: 'drinkWater' });
    }
    if (survivor.tiredness < threshold) {
        candidates.push({
            stat: survivor.tiredness,
            type: 'restWithSleepingBag',
        });
    }
    if (survivor.boredom < threshold) {
        const settings = getSettings();
        const restPlace =
            (settings.guidelinesValues.restPlace as RestPlace) ?? 'bareGround';
        const stock = useRestPlaceStore.getState().getStock(restPlace);
        if (stock > 0)
            candidates.push({ stat: survivor.boredom, type: 'restAtPlace' });
    }

    if (candidates.length === 0) return null;
    const lowest = candidates.reduce((a, b) => (a.stat <= b.stat ? a : b));
    return { type: lowest.type };
}
