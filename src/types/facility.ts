/** 건설 가능한 시설 종류 */
export const FACILITIES = [
    'workshop',
    'farm',
    'storage',
    'well',
    'kitchen',
] as const;

export type Facility = (typeof FACILITIES)[number]
