import { create } from 'zustand'
import type { Survivor } from '../types/survivor'

const initialSurvivors: Survivor[] = [
  { id: '1', name: '김민수', age: 32, status: '건강함', currentAction: '당근 농사 진행중', hunger: 85, tiredness: 70, thirst: 90, boredom: 75 },
  { id: '2', name: '이서연', age: 28, status: '지루함', currentAction: '광산에서 돌 캐는 중', hunger: 60, tiredness: 55, thirst: 45, boredom: 30 },
  { id: '3', name: '박준호', age: 45, status: '굶주림', currentAction: '요리 중', hunger: 20, tiredness: 65, thirst: 50, boredom: 65 },
  { id: '4', name: '최지은', age: 24, status: '피로', currentAction: '휴식 중', hunger: 75, tiredness: 25, thirst: 80, boredom: 55 },
  { id: '5', name: '정현우', age: 38, status: '만족', currentAction: '나무 베는 중', hunger: 90, tiredness: 80, thirst: 85, boredom: 90 },
  { id: '6', name: '한소희', age: 29, status: '스트레스', currentAction: '수면 중', hunger: 50, tiredness: 15, thirst: 70, boredom: 50 },
  { id: '7', name: '강민준', age: 41, status: '건강함', currentAction: '연구 중', hunger: 70, tiredness: 60, thirst: 65, boredom: 80 },
  { id: '8', name: '윤수아', age: 26, status: '지루함', currentAction: '대기 중', hunger: 55, tiredness: 50, thirst: 40, boredom: 25 },
]

interface SurvivorState {
  survivors: Survivor[]
}

export const useSurvivorStore = create<SurvivorState>(() => ({
  survivors: initialSurvivors,
}))
