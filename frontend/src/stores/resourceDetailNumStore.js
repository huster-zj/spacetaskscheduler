// import { useFormHeadStore } from '@/stores/resourceDetailNumStore.js'
/*   
ThreeParts.vue:
selectedType —— 消耗性、可重复利用型、状态模式,
selectedConstraint —— 硬约束、软约束,
selectedConstraint2 —— 硬约束、软约束,

*/

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getKey } from './keyManager.js'

// FormHead 页面相关的 store
export const useFormHeadStore = defineStore(
  'resourceFormHead',
  () => {
    // 定义一个数组来存储 formHeadList 对象
    const formHeadList = ref([])

    // 定义 resourceFormHead 对象的格式
    const createResourceFormHead = (
      resourceName = '',
      resourceNotes = '',
      resourceType = '',
      priority = 1
    ) => {
      console.log('成功运行createResourceFormHead')
      console.log('resourceName:', resourceName)
      return {
        key: getKey(),
        resourceName: resourceName,
        resourceNotes: resourceNotes,
        resourceType: resourceType,
        priority: priority
      }
    }

    // 添加一个新的 resourceFormHead 对象
    const addResourceFormHead = (newResourceFormHead) => {
      console.log('成功运行addResourceFormHead')
      formHeadList.value.push(
        createResourceFormHead(
          newResourceFormHead.resourceName,
          newResourceFormHead.resourceNotes,
          newResourceFormHead.resourceType,
          newResourceFormHead.priority
        )
      )
    }

    // 删除一个 resourceFormHead 对象
    const removeResourceFormHead = (index) => {
      formHeadList.value.splice(index, 1)
    }

    // 更新一个 resourceFormHead 对象
    const updateResourceFormHead = (index, newResourceFormHead) => {
      Object.assign(formHeadList[index], newResourceFormHead)
    }

    return {
      formHeadList,
      addResourceFormHead,
      removeResourceFormHead,
      updateResourceFormHead
    }
  },
  {
    persist: {
      enabled: true,
      key: 'resourceFormHead',
      storage: sessionStorage
    }
  }
)

// BasicInfo 页面相关的 store
export const useBasicInfoStore = defineStore(
  'resourceBasicInfo',
  () => {
    // 定义一个数组来存储 basicInfoList 对象
    const basicInfoList = ref([])

    // 定义 resourceBasicInfo 对象的格式
    const createResourceBasicInfo = (
      prepareTime = 0, // 确保这里有一个默认值
      breakDownTime = 0,
      bufferTime = 0
    ) => {
      return {
        key: getKey(),
        prepareTime: prepareTime,
        breakDownTime: breakDownTime,
        bufferTime: bufferTime
      }
    }

    // 添加一个新的基本信息对象
    const addResourceBasicInfo = (newResourceBasicInfo) => {
      basicInfoList.value.push(
        createResourceBasicInfo(
          newResourceBasicInfo.prepareTime,
          newResourceBasicInfo.breakDownTime,
          newResourceBasicInfo.bufferTime
        )
      )
    }

    // 删除基本信息对象
    const removeResourceBasicInfo = (index) => {
      basicInfoList.value.splice(index, 1)
    }

    // 更新 resourceBasicInfo 数据
    const updateResourceBasicInfo = (index, newResourceBasicInfo) => {
      Object.assign(basicInfoList[index], newResourceBasicInfo)
    }

    return {
      basicInfoList,
      updateResourceBasicInfo,
      addResourceBasicInfo,
      removeResourceBasicInfo
    }
  },
  {
    persist: {
      enabled: true,
      key: 'resourceBasicInfo',
      storage: sessionStorage
    }
  }
)

// Usability 页面相关的 store
export const useUsabilityStore = defineStore(
  'resourceUsability',
  () => {
    // 定义一个数组来存储 usabilityList 对象
    const usabilityList = ref([])

    // 定义 resourceUsability 对象的格式
    const createResourceUsability = (
      availability = 1,
      timeWindowType = 1,
      availabilityPeriodData = [],
      unavailablePeriodData = [],
      availabilityDiscreteData = [],
      unavailabilityDiscreteData = []
    ) => {
      return {
        key: getKey(),
        availability: availability,
        timeWindowType: timeWindowType,
        availabilityPeriodData: availabilityPeriodData,
        unavailablePeriodData: unavailablePeriodData,
        availabilityDiscreteData: availabilityDiscreteData,
        unavailabilityDiscreteData: unavailabilityDiscreteData
      }
    }

    // 添加一个新的 usability 对象
    const addResourceUsability = (newResourceUsability) => {
      usabilityList.value.push(
        createResourceUsability(
          newResourceUsability.availability,
          newResourceUsability.timeWindowType,
          newResourceUsability.availabilityPeriodData,
          newResourceUsability.unavailablePeriodData,
          newResourceUsability.availabilityDiscreteData,
          newResourceUsability.unavailabilityDiscreteData
        )
      )
    }

    // 删除 usability 对象
    const removeResourceUsability = (index) => {
      usabilityList.value.splice(index, 1)
    }

    // 更新 resourceUsability 数据
    const updateResourceUsability = (index, newResourceUsability) => {
      Object.assign(usabilityList[index], newResourceUsability)
    }

    return {
      usabilityList,
      addResourceUsability,
      removeResourceUsability,
      updateResourceUsability
    }
  },
  {
    persist: {
      enabled: true,
      key: 'resourceUsability',
      storage: sessionStorage,
    }
  }
)

// ThreeParts 页面相关的 store
export const useThreePartsStore = defineStore(
  'resourceThreeParts',
  () => {
    // 定义一个数组来存储 threePartsList 对象
    const threePartsList = ref([])

    // 定义 resourceThreeParts 对象的格式
    const createResourceThreeParts = (
      maxaccom = '',
      unit = '',
      initialQuantity = 0,
      maxQuantity = 0,
      minQuantity = 0,
      statemodes = 0,
      fixedDuration = '',
      efficiencyFactor = 0,
      selectedType = 1,
      selectedConstraint = 1,
      selectedConstraint2 = 1,
      value = 1
    ) => {
      return {
        key: getKey(),
        maxaccom: maxaccom,
        unit: unit,
        initialQuantity: initialQuantity,
        maxQuantity: maxQuantity,
        minQuantity: minQuantity,
        statemodes: statemodes,
        fixedDuration: fixedDuration,
        efficiencyFactor: efficiencyFactor,
        selectedType: selectedType,
        selectedConstraint: selectedConstraint,
        selectedConstraint2: selectedConstraint2,
        value: value
      }
    }

    // 添加一个新的 threeParts 对象
    const addResourceThreeParts = (newResourceThreeParts) => {
      threePartsList.value.push(
        createResourceThreeParts(
          newResourceThreeParts.maxaccom,
          newResourceThreeParts.unit,
          newResourceThreeParts.initialQuantity,
          newResourceThreeParts.maxQuantity,
          newResourceThreeParts.minQuantity,
          newResourceThreeParts.statemodes,
          newResourceThreeParts.fixedDuration,
          newResourceThreeParts.efficiencyFactor,
          newResourceThreeParts.selectedType,
          newResourceThreeParts.selectedConstraint,
          newResourceThreeParts.selectedConstraint2,
          newResourceThreeParts.value
        )
      )
    }

    // 删除 threeParts 对象
    const removeResourceThreeParts = (index) => {
      threePartsList.value.splice(index, 1)
    }

    // 更新 resourceThreeParts 数据
    const updateResourceThreeParts = (index, newResourceThreeParts) => {
      Object.assign(threePartsList[index], newResourceThreeParts)
    }

    return {
      threePartsList,
      addResourceThreeParts,
      removeResourceThreeParts,
      updateResourceThreeParts
    }
  },
  {
    persist: {
      enabled: true,
      key: 'resourceThreeParts',
      storage: sessionStorage
    }
  }
)

// Occupancy 页面相关的 store
export const useOccupancyStore = defineStore(
  'resourceOccupancy',
  () => {
    const occupancyMap = ref(new Map())

    const createResourceOccupancy = (
      taskName = '',
      minPrepStartTime = '',
      actualPrepStartTime = '',
      startTime = '',
      endTime = '',
      cooldownEndTime = '',
      taskQuantity = 0
    ) => {
      return {
        key: getKey(),
        taskName: taskName,
        minPrepStartTime: minPrepStartTime,
        actualPrepStartTime: actualPrepStartTime,
        startTime: startTime,
        endTime: endTime,
        cooldownEndTime: cooldownEndTime,
        taskQuantity: taskQuantity
      }
    }

    const addResourceOccupancy = (key, newResourceOccupancy) => {
      if (!occupancyMap.value.has(key)) {
        occupancyMap.value.set(key, [])
      }
      occupancyMap.value
        .get(key)
        .push(
          createResourceOccupancy(
            newResourceOccupancy.taskName,
            newResourceOccupancy.minPrepStartTime,
            newResourceOccupancy.actualPrepStartTime,
            newResourceOccupancy.startTime,
            newResourceOccupancy.endTime,
            newResourceOccupancy.cooldownEndTime,
            newResourceOccupancy.taskQuantity
          )
        )
    }

    const removeResourceOccupancy = (key, index) => {
      if (occupancyMap.value.has(key)) {
        occupancyMap.value.get(key).splice(index, 1)
      }
    }

    const updateResourceOccupancy = (key, index, newResourceOccupancy) => {
      if (occupancyMap.value.has(key)) {
        Object.assign(occupancyMap.value.get(key)[index], newResourceOccupancy)
      }
    }

    return {
      occupancyMap,
      addResourceOccupancy,
      removeResourceOccupancy,
      updateResourceOccupancy
    }
  },
  {
    persist: {
      enabled: true,
      key: 'resourceOccupancy',
      storage: sessionStorage,
      // 自定义序列化和反序列化
      serializer: {
        serialize: (state) => {
          return JSON.stringify({
            ...state,
            occupancyMap: Array.from(state.occupancyMap.entries())
          })
        },
        deserialize: (state) => {
          const parsedState = JSON.parse(state)
          return {
            ...parsedState,
            occupancyMap: new Map(parsedState.occupancyMap)
          }
        }
      }
    }
  }
)
