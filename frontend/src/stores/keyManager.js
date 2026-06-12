import { nanoid } from 'nanoid'
import {
  useFormHeadStore as useResourceFormHeadStore,
  useBasicInfoStore as useResourceBasicInfoStore,
  useUsabilityStore,
  useThreePartsStore,
  useOccupancyStore
} from './resourceDetailNumStore.js'

import {
  useFormHeadStore as useTaskFormHeadStore,
  useBasicInfoStore as useTaskBasicInfoStore,
  usePropStore,
  useDurationStore,
  useSchedulerStateStore
} from './taskDetailNumStore.js'

let Key = null

export function generateKey() {
  Key = nanoid()
  return Key
}

export function getKey() {
  return Key
}

export function deleteResourceKey(key) {
  const formHeadStore = useResourceFormHeadStore()
  const basicInfoStore = useResourceBasicInfoStore()
  const usabilityStore = useUsabilityStore()
  const threePartsStore = useThreePartsStore()
  const occupancyStore = useOccupancyStore()

  // 删除 FormHead 相关记录
  const formHeadIndex = formHeadStore.formHeadList.findIndex((item) => item.key === key)
  if (formHeadIndex !== -1) {
    formHeadStore.removeResourceFormHead(formHeadIndex)
  }

  // 删除 BasicInfo 相关记录
  const basicInfoIndex = basicInfoStore.basicInfoList.findIndex((item) => item.key === key)
  if (basicInfoIndex !== -1) {
    basicInfoStore.removeResourceBasicInfo(basicInfoIndex)
  }

  // 删除 Usability 相关记录
  const usabilityIndex = usabilityStore.usabilityList.findIndex((item) => item.key === key)
  if (usabilityIndex !== -1) {
    usabilityStore.removeResourceUsability(usabilityIndex)
  }

  // 删除 ThreeParts 相关记录
  const threePartsIndex = threePartsStore.threePartsList.findIndex((item) => item.key === key)
  if (threePartsIndex !== -1) {
    threePartsStore.removeResourceThreeParts(threePartsIndex)
  }

  // 删除 Occupancy 相关记录
  occupancyStore.occupancyMap.forEach((value, mapKey) => {
    const occupancyIndex = value.findIndex((item) => item.key === key)
    if (occupancyIndex !== -1) {
      occupancyStore.removeResourceOccupancy(mapKey, occupancyIndex)
    }
  })
}

export function deleteTaskKey(key) {
  const formHeadStore = useTaskFormHeadStore()
  const basicInfoStore = useTaskBasicInfoStore()
  const propStore = usePropStore()
  const durationStore = useDurationStore()
  const schedulerStateStore = useSchedulerStateStore()

  // 删除 FormHead 相关记录
  const formHeadIndex = formHeadStore.formHeadList.findIndex((item) => item.key === key)
  if (formHeadIndex !== -1) {
    formHeadStore.removeTaskFormHead(formHeadIndex)
  }

  // 删除 BasicInfo 相关记录
  const basicInfoIndex = basicInfoStore.basicInfoList.findIndex((item) => item.key === key)
  if (basicInfoIndex !== -1) {
    basicInfoStore.removeTaskBasicInfo(basicInfoIndex)
  }

  // 删除 Prop 相关记录
  const propIndex = propStore.propList.findIndex((item) => item.key === key)
  if (propIndex !== -1) {
    propStore.removeTaskProp(propIndex)
  }

  // 删除 Duration 相关记录
  const durationIndex = durationStore.durationList.findIndex((item) => item.key === key)
  if (durationIndex !== -1) {
    durationStore.removeTaskDuration(durationIndex)
  }

  // 删除 SchedulerState 相关记录
  schedulerStateStore.schedulerStateMap.forEach((value, mapKey) => {
    const schedulerStateIndex = value.taskScheduleData.findIndex((item) => item.key === key)
    if (schedulerStateIndex !== -1) {
      schedulerStateStore.removeSchedulerState(mapKey, schedulerStateIndex)
    }
    const conflictIndex = value.potentialConflictData.findIndex((item) => item.key === key)
    if (conflictIndex !== -1) {
      schedulerStateStore.removePotentialConflict(mapKey, conflictIndex)
    }
  })
}
