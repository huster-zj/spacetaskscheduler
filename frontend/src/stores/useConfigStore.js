// src/stores/useConfigStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore(
  'generalConfig',
  () => {
    // 定义 basicConfig 对象
    const basicConfig = ref({
      packageName: '',
      packageDescription: '',
      timeRange: [],
      resourceMinValue: 1,
      resourceMaxValue: 10,
      resourceRule: 1,
      taskMinValue: 1,
      taskMaxValue: 10,
      taskRule: 1
    })

    // 更新 basicConfig 对象
    const updateConfig = (newConfig) => {
      Object.assign(basicConfig.value, newConfig)
    }

    return { basicConfig, updateConfig }
  },
  {
    persist: {
      enabled: true,
      key: 'basicConfig',
      storage: sessionStorage
    }
  }
)
