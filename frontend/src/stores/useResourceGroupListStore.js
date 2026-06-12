// import { useResourceGroupListStore } from '@/stores/useResourceGroupListStore.js'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { nanoid } from 'nanoid'

export const useResourceGroupListStore = defineStore(
  'resourceGroupList',
  () => {
    // 定义一个数组来存储 customResourceGroup 对象
    const customResourceGroupList = ref([])

    // 定义 customResourceGroup 对象的格式
    const createCustomResourceGroup = (
      name = '',
      note = '',
      includeList = [],
      excludeList = [],
      type = ''
    ) => {
      return {
        key: nanoid(),
        resourceGroupName: name,
        resourceType: type,
        resourceGroupNote: note,
        includeResourceList: includeList,
        excludeResourceList: excludeList
      }
    }

    // 添加一个新的 customResourceGroup 对象
    const addCustomResourceGroup = (newCustomResourceGroup) => {
      customResourceGroupList.value.push(
        createCustomResourceGroup(
          newCustomResourceGroup.resourceGroupName,
          newCustomResourceGroup.resourceGroupNote,
          newCustomResourceGroup.includeResourceList,
          newCustomResourceGroup.excludeResourceList,
          newCustomResourceGroup.resourceType
        )
      )
    }

    // 删除一个 customResourceGroup 对象
    const removeCustomResourceGroup = (index) => {
      customResourceGroupList.value.splice(index, 1)
    }

    // 更新一个 customResourceGroup 对象
    const updateCustomResourceGroup = (index, newCustomResourceGroup) => {
      Object.assign(customResourceGroupList[index], newCustomResourceGroup)
    }

    return {
      customResourceGroupList,
      addCustomResourceGroup,
      removeCustomResourceGroup,
      updateCustomResourceGroup
    }
  },
  {
    // 定义一个持久化的策略，将数据存储在 sessionStorage 中
    persist: {
      enabled: true,
      key: 'resourceGroupList',
      storage: sessionStorage
    }
  }
)
