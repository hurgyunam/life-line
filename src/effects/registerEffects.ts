/**
 * 이펙트 핸들러 등록
 *
 * 앱 부트 시 호출. survivorStore, campResourceStore, activityStore 등에 대한
 * 결합을 이 파일에만 두고, 각 스토어는 서로를 직접 참조하지 않습니다.
 */

import { addMinutesToPoint, genActivityId, randomInRange } from '@/logic/survivorStoreUtils'
import { GAME_TIME_CONFIG, ACTIVITY_BALANCE, SURVIVOR_BALANCE } from '@/constants/gameConfig'
import { getSettings } from '@/utils/gameStorage'
import { useGameTimeStore } from '@/stores/gameTimeStore'
import { useRestPlaceStore } from '@/stores/restPlaceStore'
import { useCampResourceStore } from '@/stores/campResourceStore'
import { useSurvivorStore } from '@/stores/survivorStore'
import { useActivityStore } from '@/stores/activityStore'
import { registerActivityEffect, registerUpdateSurvivorStat } from '@/stores/effectRegistry'
import type { SleepingBag } from '@/types/sleepingBag'
import type { RestPlace } from '@/types/restPlace'

export function registerEffects(): void {
  registerUpdateSurvivorStat(({ survivorId, stat, value }) => {
    useSurvivorStore.getState().updateSurvivorStat(survivorId, stat, value)
  })

  registerActivityEffect('eatWildStrawberry', ({ survivorId }) => {
    if (useCampResourceStore.getState().getQuantity('wildStrawberry') <= 0) return false
    useSurvivorStore.getState().eatWildStrawberry(survivorId)
    return true
  })

  registerActivityEffect('drinkWater', ({ survivorId }) => {
    if (useCampResourceStore.getState().getQuantity('water') <= 0) return false
    useSurvivorStore.getState().drinkWater(survivorId)
    return true
  })

  registerActivityEffect('searchFood', ({ survivorId, now }) => {
    if (!now) return false
    const endAt = addMinutesToPoint(
      now,
      ACTIVITY_BALANCE.FOOD_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR
    )
    useActivityStore.getState().startSearchFood(survivorId, endAt)
    return true
  })

  registerActivityEffect('searchWater', ({ survivorId }) => {
    useGameTimeStore.getState().advanceByMinutes(
      ACTIVITY_BALANCE.WATER_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR
    )
    const gain = randomInRange(ACTIVITY_BALANCE.WATER_SEARCH.GAIN_MIN, ACTIVITY_BALANCE.WATER_SEARCH.GAIN_MAX)
    useCampResourceStore.getState().addQuantity('water', gain)
    return true
  })

  registerActivityEffect('searchSurvivor', ({ survivorId }) => {
    useGameTimeStore.getState().advanceByMinutes(
      ACTIVITY_BALANCE.SURVIVOR_SEARCH.DURATION_HOURS * GAME_TIME_CONFIG.MINUTES_PER_HOUR
    )
    useActivityStore.getState().searchSurvivor()
    return true
  })

  registerActivityEffect('doResearch', ({ survivorId }) => {
    useActivityStore.getState().doResearch()
    return true
  })

  registerActivityEffect('restWithSleepingBag', ({ survivorId, now }) => {
    if (!now) return false
    const settings = getSettings()
    const sleepingBag = (settings.guidelinesValues.sleepingBag as SleepingBag) ?? 'sleepingBag1'
    const gainPerHour = SURVIVOR_BALANCE.SLEEPING_BAG_TIREDNESS_GAIN_PER_HOUR[sleepingBag]
    const survivor = useSurvivorStore.getState().survivors.find((s) => s.id === survivorId)
    if (!survivor) return false

    const need = Math.max(0, 100 - survivor.tiredness)
    const hoursNeeded = Math.ceil(need / gainPerHour) || 1
    const endAt = addMinutesToPoint(now, hoursNeeded * GAME_TIME_CONFIG.MINUTES_PER_HOUR)

    useActivityStore.getState().addPendingActivity({
      id: genActivityId(),
      survivorId,
      type: 'restWithSleepingBag',
      endAt,
      sleepingBag,
    })
    return true
  })

  registerActivityEffect('restAtPlace', ({ survivorId, now }) => {
    if (!now) return false
    const settings = getSettings()
    const restPlace = (settings.guidelinesValues.restPlace as RestPlace) ?? 'bareGround'
    const restPlaceStore = useRestPlaceStore.getState()
    const stock = restPlaceStore.getStock(restPlace)
    if (stock <= 0) return false

    if (restPlace !== 'bareGround') {
      restPlaceStore.setStock(restPlace, stock - 1)
    }

    const gainPerHour = SURVIVOR_BALANCE.REST_PLACE_BOREDOM_GAIN_PER_HOUR
    const survivor = useSurvivorStore.getState().survivors.find((s) => s.id === survivorId)
    if (!survivor) return false

    const need = Math.max(0, 100 - survivor.boredom)
    const hoursNeeded = Math.ceil(need / gainPerHour) || 1
    const endAt = addMinutesToPoint(now, hoursNeeded * GAME_TIME_CONFIG.MINUTES_PER_HOUR)

    useActivityStore.getState().addPendingActivity({
      id: genActivityId(),
      survivorId,
      type: 'restAtPlace',
      endAt,
      restPlace,
    })
    return true
  })
}
