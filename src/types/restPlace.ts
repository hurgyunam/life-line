/** 휴식 장소 타입 */
export type RestPlace = 'bareGround' | 'hammock' | 'wrestlingMat' | 'soccerField'

/** 휴식 장소 목록 */
export const REST_PLACES: RestPlace[] = [
    'bareGround',
    'hammock',
    'wrestlingMat',
    'soccerField',
] as const;
