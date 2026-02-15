export enum TechStatus {
    LOCKED = 'locked',
    AVAILABLE = 'available',
    COMPLETED = 'completed',
}

export interface TechNode {
    id: string;
    tier: number; // Y축 결정 (1티어, 2티어...)
    title: string;
    description: string; // 유저를 유혹하는 설명
    effect: string; // "생산 속도 +20%" 같은 실질적 이득
    icon: string;
    cost: number;
    prerequisites: string[]; // 선행 기술 ID
    status: TechStatus;
  } 
  
export const techTreeData: TechNode[] = [
    {
        id: 'auto-collect-1',
        tier: 1,
        title: '기초 자동화',
        description: '매번 클릭하기 힘드셨죠? 이제 일꾼들이 대신 움직입니다.',
        effect: '자원 자동 수집 활성화 (초당 1개)',
        icon: '🤖',
        cost: 100,
        prerequisites: [],
        status: TechStatus.AVAILABLE
    },
    {
        id: 'fast-boots',
        tier: 2,
        title: '강화 가죽 장화',
        description: '답답한 이동 속도는 이제 안녕! 맵 끝까지 순식간에 이동하세요.',
        effect: '캐릭터 이동 속도 +50% 증가',
        icon: '👞',
        cost: 300,
        prerequisites: ['auto-collect-1'],
        status: TechStatus.LOCKED
    }
    // 데이터가 추가되어도 UI는 자동으로 늘어납니다.
];