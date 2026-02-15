/**
 * 소비 활동(먹기/마시기) 관련 UI 매핑
 * 새 음식 추가 시 CONSUMABLE_ACTIVITIES 설정과 이 매핑만 갱신하면 됨
 */

import type { ConsumableResource } from '@/types/resource';

/** consumableKey → reservedActivity i18n 키 */
export const CONSUMABLE_RESERVED_ACTIVITY_KEYS: Record<
    ConsumableResource,
    string
> = {
    wildStrawberry: 'reservedActivity.eatWildStrawberry',
    water: 'reservedActivity.drinkWater',
    potato: 'reservedActivity.eatPotato',
    corn: 'reservedActivity.eatCorn',
    wheat: 'reservedActivity.eatWheat',
};

/** consumableKey → action(진행 중) i18n 키 */
export const CONSUMABLE_ACTION_KEYS: Record<ConsumableResource, string> = {
    wildStrawberry: 'action.eating_wild_strawberry',
    water: 'action.drinking_water',
    potato: 'action.eating_potato',
    corn: 'action.eating_corn',
    wheat: 'action.eating_wheat',
};

export function getConsumableReservedLabelKey(
    consumableKey: ConsumableResource,
): string {
    return CONSUMABLE_RESERVED_ACTIVITY_KEYS[consumableKey] ?? consumableKey;
}

export function getConsumableActionKey(
    consumableKey: ConsumableResource,
): string {
    return CONSUMABLE_ACTION_KEYS[consumableKey] ?? 'action.waiting';
}
