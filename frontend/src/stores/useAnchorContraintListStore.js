/*
 * @Author: Jerry
 * @Date: 2024-11-25 19:35:43
 * @LastEditors: Do not edit
 * @LastEditTime: 2024-12-23 15:22:42
 * @FilePath: \spacetaskscheduler\src\stores\useAnchorContraintListStore.js
 */
// import { useAnchorContraintListStore } from '@/stores/useAnchorContraintListStore.js'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'

export const useAnchorContraintListStore = defineStore(
  'anchorContraintList',
  () => {
    // 定义一个数组来存储 锚定需求 对象
    const anchorContraintList = ref([
      {
        key: '1',
        anchor_type: '锚定在最前',
        anchor_task: '无',
        anchor_task_key: '',
        anchor_task_priority: null,
        anchor_task_note: ''
      },
      {
        key: '2',
        anchor_type: '锚定在最后',
        anchor_task: '无',
        anchor_task_key: '',
        anchor_task_priority: null,
        anchor_task_note: ''
      }
    ])

    // 保证锚定需求相关的任务数据可以实时与任务数据保持一致
    const formHeadStore = useFormHeadStore()
    const updateAnchorConstraint = (key = '', anchor_task_key = '') => {
      const anchorItem = anchorContraintList.value.find((item) => item.key === key)
      const anchorTask = formHeadStore.formHeadList.find((item) => item.key === anchor_task_key)
      if (anchorItem && anchorTask) {
        anchorItem.anchor_task = anchorTask.taskName
        anchorItem.anchor_task_key = anchorTask.key
        anchorItem.anchor_task_priority = anchorTask.priority
        anchorItem.anchor_task_note = anchorTask.taskNotes
      }
    }

    return {
      anchorContraintList,
      updateAnchorConstraint
    }
  },
 {
   // 定义一个持久化的策略，将数据存储在 sessionStorage 中
   persist: {
   enabled: true,
   key: 'anchorContraintList',
   storage: sessionStorage
   }
  }
)
