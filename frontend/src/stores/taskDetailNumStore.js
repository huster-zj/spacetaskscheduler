// import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'
/*   
BasicInfo.vue:
schedulePreference —— 无、早、中、晚
timePreference
*/

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getKey } from './keyManager.js'

// FormHead 页面相关的 store
export const useFormHeadStore = defineStore(
  'taskFormHead',
  () => {
    // 定义一个数组来存储 formHeadList 对象
    const formHeadList = ref([])

    // 定义 taskFormHead 对象的格式
    const createTaskFormHead = (
      taskName = '',
      taskNotes = '',
      state = 1, // 默认状态值
      priority = 1,
      isExclusiveTask = false
    ) => {
      return {
        key: getKey(),
        taskName: taskName,
        taskNotes: taskNotes,
        state: state,
        priority: priority,
        isExclusiveTask: isExclusiveTask
      }
    }

    // 添加一个新的 taskFormHead 对象
    const addTaskFormHead = (newTaskFormHead) => {
      formHeadList.value.push(
        createTaskFormHead(
          newTaskFormHead.taskName,
          newTaskFormHead.taskNotes,
          newTaskFormHead.state,
          newTaskFormHead.priority,
          newTaskFormHead.isExclusiveTask
        )
      )
    }

    // 删除一个 taskFormHead 对象
    const removeTaskFormHead = (index) => {
      formHeadList.value.splice(index, 1)
    }

    // 更新一个 taskFormHead 对象
    const updateTaskFormHead = (index, newTaskFormHead) => {
      Object.assign(formHeadList[index], newTaskFormHead)
    }

    return {
      formHeadList,
      addTaskFormHead,
      removeTaskFormHead,
      updateTaskFormHead
    }
  },
  {
    persist: {
      enabled: true,
      key: 'taskFormHead',
      storage: sessionStorage
    }
  }
)

// BasicInfo 页面相关的 store
export const useBasicInfoStore = defineStore(
  'taskBasicInfo',
  () => {
    // 定义一个数组来存储 basicInfoList 对象
    const basicInfoList = ref([])

    // 定义 taskBasicInfo 对象的格式
    const createTaskBasicInfo = (
      schedulePreference = '',
      timePointPreference = '',
      startTimePreference = '',
      keyPointConstraint = []
    ) => {
      return {
        key: getKey(),
        schedulePreference: schedulePreference,
        timePointPreference: timePointPreference,
        startTimePreference: startTimePreference,
        keyPointConstraint: keyPointConstraint
      }
    }

    // 添加一个新的 taskBasicInfo 对象
    const addTaskBasicInfo = (newTaskBasicInfo) => {
      basicInfoList.value.push(
        createTaskBasicInfo(
          newTaskBasicInfo.schedulePreference,
          newTaskBasicInfo.timePointPreference,
          newTaskBasicInfo.startTimePreference,
          newTaskBasicInfo.keyPointConstraint
        )
      )
    }

    // 删除一个 taskBasicInfo 对象
    const removeTaskBasicInfo = (index) => {
      basicInfoList.value.splice(index, 1)
    }

    // 更新一个 taskBasicInfo 对象
    const updateTaskBasicInfo = (index, newTaskBasicInfo) => {
      Object.assign(basicInfoList[index], newTaskBasicInfo)
    }

    return {
      basicInfoList,
      addTaskBasicInfo,
      removeTaskBasicInfo,
      updateTaskBasicInfo
    }
  },
  {
    persist: {
      enabled: true,
      key: 'taskBasicInfo',
      storage: sessionStorage,
    }
  }
)

// Prop 页面相关的 store
export const usePropStore = defineStore(
  'taskProp',
  () => {
    // 定义一个数组来存储 propList 对象
    const propList = ref([])

    // 定义 taskProp 对象的格式
    const createTaskProp = (
      availability = 1,
      timeWindowType = 1,
      selectedTimeOption = 1,
      selectedTimeOption2 = 1,
      selectedTimeOption3 = 1,
      selectedTimeOption4 = 1,
      minIntervalTime1 = null,
      maxIntervalTime1 = null,
      minIntervalTime2 = null,
      maxIntervalTime2 = null,
      singlePeriodData = [],
      singleDiscreteData = [],
      repeatPeriodData = [],
      repeatDiscreteData = []
    ) => {
      return {
        key: getKey(),
        availability: availability,
        timeWindowType: timeWindowType,
        selectedTimeOption: selectedTimeOption,
        selectedTimeOption2: selectedTimeOption2,
        selectedTimeOption3: selectedTimeOption3,
        selectedTimeOption4: selectedTimeOption4,
        minIntervalTime1: minIntervalTime1,
        maxIntervalTime1: maxIntervalTime1,
        minIntervalTime2: minIntervalTime2,
        maxIntervalTime2: maxIntervalTime2,
        singlePeriodData: singlePeriodData,
        singleDiscreteData: singleDiscreteData,
        repeatPeriodData: repeatPeriodData,
        repeatDiscreteData: repeatDiscreteData
      }
    }

    // 添加一个新的 taskProp 对象
    const addTaskProp = (newTaskProp) => {
      propList.value.push(
        createTaskProp(
          newTaskProp.availability,
          newTaskProp.timeWindowType,
          newTaskProp.selectedTimeOption,
          newTaskProp.selectedTimeOption2,
          newTaskProp.selectedTimeOption3,
          newTaskProp.selectedTimeOption4,
          newTaskProp.minIntervalTime1,
          newTaskProp.maxIntervalTime1,
          newTaskProp.minIntervalTime2,
          newTaskProp.maxIntervalTime2,
          newTaskProp.singlePeriodData,
          newTaskProp.singleDiscreteData,
          newTaskProp.repeatPeriodData,
          newTaskProp.repeatDiscreteData
        )
      )
    }

    // 删除一个 taskProp 对象
    const removeTaskProp = (index) => {
      propList.value.splice(index, 1)
    }

    // 更新一个 taskProp 对象
    const updateTaskProp = (index, newTaskProp) => {
      Object.assign(propList[index], newTaskProp)
    }

    return {
      propList,
      addTaskProp,
      removeTaskProp,
      updateTaskProp
    }
  },
  {
    persist: {
      enabled: true,
      key: 'taskProp',
      storage: sessionStorage
    }
  }
)

// Duration 页面相关的 store
export const useDurationStore = defineStore(
  'taskDuration',
  () => {
    // 定义一个数组来存储 durationList 对象
    const durationList = ref([])

    // 定义 taskDuration 对象的格式
    const createTaskDuration = (
      durationType = 1,
      fixedDuration = null,
      minTotalDuration = null,
      needsRestrict = false,
      needsFullWindow = false,
      allowsSegmentedCompletion = false,
      allowsResourceChange = false,
      segmentMinDuration = null,
      maxOverlapDuration = null,
      exactOverlapDuration = null,
      overlapType = 1
    ) => {
      return {
        key: getKey(),
        durationType: durationType,
        fixedDuration: fixedDuration,
        minTotalDuration: minTotalDuration,
        needsRestrict: needsRestrict,
        needsFullWindow: needsFullWindow,
        allowsSegmentedCompletion: allowsSegmentedCompletion,
        allowsResourceChange: allowsResourceChange,
        segmentMinDuration: segmentMinDuration,
        maxOverlapDuration: maxOverlapDuration,
        exactOverlapDuration: exactOverlapDuration,
        overlapType: overlapType
      }
    }

    // 添加一个新的 taskDuration 对象
    const addTaskDuration = (newTaskDuration) => {
      durationList.value.push(
        createTaskDuration(
          newTaskDuration.durationType,
          newTaskDuration.fixedDuration,
          newTaskDuration.minTotalDuration,
          newTaskDuration.needsRestrict,
          newTaskDuration.needsFullWindow,
          newTaskDuration.allowsSegmentedCompletion,
          newTaskDuration.allowsResourceChange,
          newTaskDuration.segmentMinDuration,
          newTaskDuration.maxOverlapDuration,
          newTaskDuration.exactOverlapDuration,
          newTaskDuration.overlapType
        )
      )
    }

    // 删除一个 taskDuration 对象
    const removeTaskDuration = (index) => {
      durationList.value.splice(index, 1)
    }

    // 更新一个 taskDuration 对象
    const updateTaskDuration = (index, newTaskDuration) => {
      Object.assign(durationList[index], newTaskDuration)
    }

    return {
      durationList,
      addTaskDuration,
      removeTaskDuration,
      updateTaskDuration
    }
  },
  {
    persist: {
      enabled: true,
      key: 'taskDuration',
      storage: sessionStorage
    }
  }
)

// SchedulerState 页面相关的 store
export const useSchedulerStateStore = defineStore(
  'taskSchedulerState',
  () => {
    const schedulerStateMap = ref(new Map())

    const createSchedulerState = (
      poss = '',
      startTime = '',
      endTime = '',
      duration = '',
      resource = '',
      note = '',
      conflictTask = '',
      conflictResource = '',
      assignedStart = '',
      assignedStop = ''
    ) => {
      return {
        poss,
        startTime,
        endTime,
        duration,
        resource,
        note,
        conflictTask,
        conflictResource,
        assignedStart,
        assignedStop
      }
    }

    const addSchedulerState = (key, newSchedulerState) => {
      if (!schedulerStateMap.value.has(key)) {
        schedulerStateMap.value.set(key, { taskScheduleData: [], potentialConflictData: [] })
      }
      schedulerStateMap.value
        .get(key)
        .taskScheduleData.push(
          createSchedulerState(
            newSchedulerState.poss,
            newSchedulerState.startTime,
            newSchedulerState.endTime,
            newSchedulerState.duration,
            newSchedulerState.resource,
            newSchedulerState.note
          )
        )
    }

    const addPotentialConflict = (key, newConflict) => {
      if (!schedulerStateMap.value.has(key)) {
        schedulerStateMap.value.set(key, { taskScheduleData: [], potentialConflictData: [] })
      }
      schedulerStateMap.value
        .get(key)
        .potentialConflictData.push(
          createSchedulerState(
            newConflict.poss,
            '',
            '',
            '',
            '',
            '',
            newConflict.conflictTask,
            newConflict.conflictResource,
            newConflict.assignedStart,
            newConflict.assignedStop
          )
        )
    }

    const removeSchedulerState = (key, index) => {
      if (schedulerStateMap.value.has(key)) {
        schedulerStateMap.value.get(key).taskScheduleData.splice(index, 1)
      }
    }

    const removePotentialConflict = (key, index) => {
      if (schedulerStateMap.value.has(key)) {
        schedulerStateMap.value.get(key).potentialConflictData.splice(index, 1)
      }
    }

    const updateSchedulerState = (key, index, newSchedulerState) => {
      if (schedulerStateMap.value.has(key)) {
        Object.assign(schedulerStateMap.value.get(key).taskScheduleData[index], newSchedulerState)
      }
    }

    const updatePotentialConflict = (key, index, newConflict) => {
      if (schedulerStateMap.value.has(key)) {
        Object.assign(schedulerStateMap.value.get(key).potentialConflictData[index], newConflict)
      }
    }

    return {
      schedulerStateMap,
      addSchedulerState,
      addPotentialConflict,
      removeSchedulerState,
      removePotentialConflict,
      updateSchedulerState,
      updatePotentialConflict
    }
  },
  {
    persist: {
      enabled: true,
      key: 'taskSchedulerState',
      storage: sessionStorage,
      // 自定义序列化和反序列化
      serializer: {
        serialize: (state) => {
          return JSON.stringify({
            ...state,
            schedulerStateMap: Array.from(state.schedulerStateMap.entries())
          })
        },
        deserialize: (state) => {
          const parsedState = JSON.parse(state)
          return {
            ...parsedState,
            schedulerStateMap: new Map(parsedState.schedulerStateMap)
          }
        }
      }
    }
  }
)
