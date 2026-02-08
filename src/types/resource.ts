/** 건축/조합용 자원 */
export const CONSTRUCTION_RESOURCES = [
    'wood',
    'stone',
    'ironOre',
    'cotton',
    'leather',
] as const;

/** 식량 자원 */
export const FOOD_RESOURCES = [
    'wildStrawberry',
    'potato',
    'corn',
    'wheat',
] as const;

/** 물 자원 */
export const WATER_RESOURCE = 'water' as const;

/** 건축/조합용 자원 타입 */
export type ConstructionResource = (typeof CONSTRUCTION_RESOURCES)[number]

/** 식량 자원 타입 */
export type FoodResource = (typeof FOOD_RESOURCES)[number]

/** 물 자원 타입 */
export type WaterResource = typeof WATER_RESOURCE

/** 소비용 자원 (물 + 식량) */
export type ConsumableResource = WaterResource | FoodResource

/** 캠프 자원 전체 (건축 + 소비) */
export type CampResource = ConstructionResource | ConsumableResource

/** 캠프 자원 분류 및 종류 */
export const CAMP_RESOURCES = {
    /** 건축/조합용 자원 */
    CONSTRUCTION: CONSTRUCTION_RESOURCES,
    /** 소비용 자원 */
    CONSUMABLE: {
        water: WATER_RESOURCE,
        food: FOOD_RESOURCES,
    },
} as const;
