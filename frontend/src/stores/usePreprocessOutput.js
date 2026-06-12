/*
 * @Author: Jerry
 * @Date: 2025-05-19 10:49:05
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-05-19 10:51:17
 * @FilePath: \spacetaskscheduler\src\stores\usePreprocessOutput.js
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePreprocessOutputStore = defineStore(
  'preprocessOutput',
  () => {
    // 存储连续和非连续跟踪事件的预处理结果
    const preprocessOutput = ref({
      // 连续跟踪事件预处理结果
      continuousEvents: [],
      
      // 非连续跟踪事件预处理结果  
      discreteEvents: []
    })

    // 更新连续跟踪事件数据
    const updateContinuousEvents = (events) => {
      preprocessOutput.value.continuousEvents = events
    }

    // 更新非连续跟踪事件数据
    const updateDiscreteEvents = (events) => {
      preprocessOutput.value.discreteEvents = events
    }

    // 清空所有数据
    const clearAll = () => {
      preprocessOutput.value.continuousEvents = []
      preprocessOutput.value.discreteEvents = []
    }

    // 获取数据的辅助方法
    const getContinuousEvents = () => preprocessOutput.value.continuousEvents
    const getDiscreteEvents = () => preprocessOutput.value.discreteEvents

    return { 
      preprocessOutput,
      updateContinuousEvents,
      updateDiscreteEvents, 
      clearAll,
      getContinuousEvents,
      getDiscreteEvents
    }
  },
  {
    persist: {
      enabled: true,
      key: 'preprocessOutput',
      storage: sessionStorage
    }
  }
)