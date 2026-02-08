import * as LucideIcons from 'lucide-react';

export type TechStatus = 'locked' | 'available' | 'completed';

/** 런타임 status는 techStore에서 파생. 트리 데이터에는 status 없음 */
export interface TechNodeBase {
  id: string;
  tier: number;
  title: string;
  description: string;
  effect: string;
  iconName: keyof typeof LucideIcons;
  cost: number;
  prerequisites: string[];
  category: 'Production' | 'Combat' | 'Utility';
}

export interface TechNode extends TechNodeBase {
  status: TechStatus;
}

export const techTreeData: TechNodeBase[] = [
    // --- TIER 1: 생존의 기초 (기본 오픈) ---
    { id: 't1-1', tier: 1, title: '돌 도구 제작', description: '맨손보다는 낫죠. 기본적인 채집 효율이 상승합니다.', effect: '채집 속도 +20%', iconName: 'Pickaxe', cost: 50, prerequisites: [], category: 'Production' },
    { id: 't1-2', tier: 1, title: '캠프파이어', description: '밤의 추위와 짐승으로부터 당신을 보호합니다.', effect: '체력 회복력 +10%', iconName: 'Flame', cost: 50, prerequisites: [], category: 'Utility' },
    { id: 't1-3', tier: 1, title: '나무 몽둥이', description: '최소한의 자기방어 수단입니다.', effect: '공격력 +5', iconName: 'Swords', cost: 50, prerequisites: [], category: 'Combat' },

    // --- TIER 2: 자동화와 저장 ---
    { id: 't2-1', tier: 2, title: '자동 채굴기 V1', description: '허리가 아프신가요? 기계가 대신 땅을 파줍니다.', effect: '광물 자동 수집 (초당 0.5)', iconName: 'Cpu', cost: 150, prerequisites: ['t1-1'], category: 'Production' },
    { id: 't2-2', tier: 2, title: '가죽 배낭', description: '인벤토리 부족으로 템을 버리는 일은 이제 그만.', effect: '인벤토리 슬롯 +10', iconName: 'Briefcase', cost: 120, prerequisites: ['t1-1', 't1-2'], category: 'Utility' },
    { id: 't2-3', tier: 2, title: '강화 활', description: '멀리서 안전하게 적을 제압하세요.', effect: '사거리 +2m', iconName: 'Target', cost: 200, prerequisites: ['t1-3'], category: 'Combat' },

    // --- TIER 3: 기동성과 효율 ---
    { id: 't3-1', tier: 3, title: '강화 가죽 장화', description: '답답한 이동 속도는 이제 안녕! 맵 끝까지 순식간에.', effect: '이동 속도 +25%', iconName: 'Footprints', cost: 300, prerequisites: ['t2-2'], category: 'Utility' },
    { id: 't3-2', tier: 3, title: '용광로 가동', description: '원석을 정제하여 더 단단한 금속을 얻습니다.', effect: '금속 생산량 +40%', iconName: 'Zap', cost: 400, prerequisites: ['t2-1'], category: 'Production' },
    { id: 't3-3', tier: 3, title: '철제 갑옷', description: '이제 웬만한 공격에는 끄떡없습니다.', effect: '방어력 +15', iconName: 'ShieldCheck', cost: 450, prerequisites: ['t2-3'], category: 'Combat' },

    // --- TIER 4: 중급 산업 시대 ---
    { id: 't4-1', tier: 4, title: '컨베이어 벨트', description: '자원 운송의 혁명. 물류가 물 흐르듯 흐릅니다.', effect: '운송 속도 +50%', iconName: 'Repeat', cost: 700, prerequisites: ['t3-2'], category: 'Production' },
    { id: 't4-2', tier: 4, title: '나침반 제작', description: '길치 탈출! 미니맵에 주요 자원 위치가 표시됩니다.', effect: '자원 탐지 레이더 활성', iconName: 'Compass', cost: 550, prerequisites: ['t3-1'], category: 'Utility' },
    { id: 't4-3', tier: 4, title: '화약 추출', description: '강력한 폭발의 힘을 손에 넣으세요.', effect: '폭발 데미지 추가', iconName: 'Bomb', cost: 800, prerequisites: ['t3-3'], category: 'Combat' },

    // --- TIER 5: 전력 및 통신 ---
    { id: 't5-1', tier: 5, title: '증기 발전기', description: '모든 자동화 기계에 전력을 공급해 출력을 높입니다.', effect: '자동화 기계 속도 +100%', iconName: 'ZapOff', cost: 1200, prerequisites: ['t4-1'], category: 'Production' },
    { id: 't5-2', tier: 5, title: '무전기 도입', description: '멀리 있는 드론에게 명령을 내릴 수 있습니다.', effect: '원격 수집 범위 +50m', iconName: 'Radio', cost: 1000, prerequisites: ['t4-2'], category: 'Utility' },
    { id: 't5-3', tier: 5, title: '머스킷 소총', description: '검과 활의 시대는 끝났습니다. 압도적 화력!', effect: '기본 데미지 +50', iconName: 'Crosshair', cost: 1500, prerequisites: ['t4-3'], category: 'Combat' },

    // --- TIER 6: 정밀 가공 ---
    { id: 't6-1', tier: 6, title: '강철 합금', description: '훨씬 가볍고 단단한 강철을 생산합니다.', effect: '장비 내구도 +100%', iconName: 'Gem', cost: 2000, prerequisites: ['t5-1'], category: 'Production' },
    { id: 't6-2', tier: 6, title: '보관함 확장', description: '4차원 주머니급 용량. 무엇이든 담으세요.', effect: '인벤토리 슬롯 +30', iconName: 'Package', cost: 1800, prerequisites: ['t5-2'], category: 'Utility' },
    { id: 't6-3', tier: 6, title: '전술 망원경', description: '먼 곳의 적을 미리 파악하고 약점을 노립니다.', effect: '치명타 확률 +20%', iconName: 'Telescope', cost: 2200, prerequisites: ['t5-3'], category: 'Combat' },

    // --- TIER 7: 비행과 탐사 ---
    { id: 't7-1', tier: 7, title: '자동 비행 드론', description: '드론이 하늘을 날며 자원을 수거해 옵니다.', effect: '자동 수집 범위 무제한', iconName: 'Plane', cost: 3500, prerequisites: ['t6-1', 't6-2'], category: 'Production' },
    { id: 't7-2', tier: 7, title: '제트팩 V1', description: '장애물을 뛰어넘으세요. 이제 지형은 무의미합니다.', effect: '공중 대쉬 기능 해금', iconName: 'Wind', cost: 4000, prerequisites: ['t6-2'], category: 'Utility' },
    { id: 't7-3', tier: 7, title: '자동 포탑', description: '기지에 접근하는 모든 적을 자동으로 섬멸합니다.', effect: '방어 포탑 건설 가능', iconName: 'TowerControl', cost: 3800, prerequisites: ['t6-3'], category: 'Combat' },

    // --- TIER 8: 에너지 혁명 ---
    { id: 't8-1', tier: 8, title: '태양광 패널', description: '무한한 태양 에너지로 기지를 가동합니다.', effect: '유지 비용 0원 달성', iconName: 'Sun', cost: 6000, prerequisites: ['t7-1'], category: 'Production' },
    { id: 't8-2', tier: 8, title: '나노 수트', description: '신체 능력을 극한으로 끌어올리는 첨단 슈트.', effect: '모든 능력치 +15%', iconName: 'Shirt', cost: 5500, prerequisites: ['t7-2'], category: 'Utility' },
    { id: 't8-3', tier: 8, title: '레일건', description: '빛의 속도로 탄환을 발사합니다. 관통력 100%.', effect: '모든 방어력 무시', iconName: 'Zap', cost: 7000, prerequisites: ['t7-3'], category: 'Combat' },

    // --- TIER 9: 인공지능과 우주 ---
    { id: 't9-1', tier: 9, title: '중앙 AI 제어', description: '기지가 스스로 판단하고 생산량을 조절합니다.', effect: '전체 생산성 +200%', iconName: 'Brain', cost: 12000, prerequisites: ['t8-1'], category: 'Production' },
    { id: 't9-2', tier: 9, title: '웜홀 이동', description: '순간이동 포탈을 설치하여 맵을 이동합니다.', effect: '텔레포트 기능 해금', iconName: 'Aperture', cost: 15000, prerequisites: ['t8-2'], category: 'Utility' },
    { id: 't9-3', tier: 9, title: '궤도 폭격', description: '하늘에서 정의가 빗발칩니다.', effect: '광범위 필살기 해금', iconName: 'Satellite', cost: 14000, prerequisites: ['t8-3'], category: 'Combat' },

    // --- TIER 10: 초월의 시대 ---
    { id: 't10-1', tier: 10, title: '물질 재구성', description: '무에서 유를 창조합니다. 자원 걱정이 사라집니다.', effect: '모든 자원 무한 수급 가능', iconName: 'Atom', cost: 50000, prerequisites: ['t9-1'], category: 'Production' },
    { id: 't10-2', tier: 10, title: '시간 왜곡', description: '게임의 시간을 가속하거나 멈출 수 있습니다.', effect: '진행 속도 2배 가속 가능', iconName: 'Timer', cost: 45000, prerequisites: ['t9-2'], category: 'Utility' },
    { id: 't10-3', tier: 10, title: '반물질 병기', description: '존재 자체를 소멸시키는 최강의 무기입니다.', effect: '모든 적 즉사 확률 부여', iconName: 'Zap', cost: 60000, prerequisites: ['t9-3'], category: 'Combat' },
];