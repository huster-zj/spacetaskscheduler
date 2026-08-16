import { defineStore } from 'pinia'
import { ref } from 'vue'

import { normalizeResourcePool } from '@/services/resourcePool'

export const useTaskResourcePoolStore = defineStore(
  'taskResourcePools',
  () => {
    const taskResourcePoolList = ref([])

    const addResourcePool = (value) => {
      const pool = normalizeResourcePool(value)
      taskResourcePoolList.value.push(pool)
      return pool
    }

    const updateResourcePool = (key, value) => {
      const index = taskResourcePoolList.value.findIndex((item) => String(item.key) === String(key))
      if (index === -1) return null
      const pool = normalizeResourcePool({ ...taskResourcePoolList.value[index], ...value, key })
      taskResourcePoolList.value.splice(index, 1, pool)
      return pool
    }

    const removeResourcePool = (key) => {
      taskResourcePoolList.value = taskResourcePoolList.value.filter(
        (item) => String(item.key) !== String(key)
      )
    }

    const replaceResourcePools = (values = []) => {
      taskResourcePoolList.value = (Array.isArray(values) ? values : []).map(normalizeResourcePool)
    }

    const getPoolsForTask = (taskKey) => taskResourcePoolList.value.filter(
      (item) => String(item.taskKey) === String(taskKey)
    )

    const removePoolsForTask = (taskKey) => {
      taskResourcePoolList.value = taskResourcePoolList.value.filter(
        (item) => String(item.taskKey) !== String(taskKey)
      )
    }

    return {
      taskResourcePoolList,
      addResourcePool,
      updateResourcePool,
      removeResourcePool,
      replaceResourcePools,
      getPoolsForTask,
      removePoolsForTask
    }
  },
  {
    persist: {
      enabled: true,
      key: 'taskResourcePools',
      storage: sessionStorage
    }
  }
)
