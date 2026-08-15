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

const ANCHOR_DEFINITIONS = [
  { key: '1', anchor_type: '锚定在最前' },
  { key: '2', anchor_type: '锚定在最后' }
]

const createEmptyAnchor = ({ key, anchor_type }) => ({
  key,
  anchor_type,
  anchor_task: '无',
  anchor_task_key: '',
  anchor_task_priority: null,
  anchor_task_note: ''
})

export const createDefaultAnchorConstraints = () => ANCHOR_DEFINITIONS.map(createEmptyAnchor)

export const normalizeAnchorConstraints = (constraints) => {
  const source = Array.isArray(constraints) ? constraints : []

  return ANCHOR_DEFINITIONS.map((definition) => {
    const existing = source.find((item) => String(item?.key) === definition.key)
    return {
      ...createEmptyAnchor(definition),
      ...(existing || {}),
      key: definition.key,
      anchor_type: definition.anchor_type
    }
  })
}

export const useAnchorContraintListStore = defineStore(
  'anchorContraintList',
  () => {
    // 定义一个数组来存储 锚定需求 对象
    const anchorContraintList = ref(createDefaultAnchorConstraints())

    // 保证锚定需求相关的任务数据可以实时与任务数据保持一致
    const formHeadStore = useFormHeadStore()
    const clearAnchorConstraint = (key) => {
      const definition = ANCHOR_DEFINITIONS.find((item) => item.key === String(key))
      const index = anchorContraintList.value.findIndex((item) => item.key === String(key))
      if (!definition || index < 0) return false

      anchorContraintList.value[index] = createEmptyAnchor(definition)
      return true
    }

    const updateAnchorConstraint = (key = '', anchor_task_key = '') => {
      const normalizedKey = String(key)
      const anchorItem = anchorContraintList.value.find((item) => item.key === normalizedKey)
      const anchorTask = formHeadStore.formHeadList.find(
        (item) => String(item.key) === String(anchor_task_key)
      )

      if (!anchorItem) return false
      if (!anchorTask) return clearAnchorConstraint(normalizedKey)

      anchorItem.anchor_task = anchorTask.taskName
      anchorItem.anchor_task_key = anchorTask.key
      anchorItem.anchor_task_priority = anchorTask.priority
      anchorItem.anchor_task_note = anchorTask.taskNotes
      return true
    }

    const ensureAnchorConstraints = () => {
      anchorContraintList.value = normalizeAnchorConstraints(anchorContraintList.value)
      anchorContraintList.value.forEach((item) => {
        if (item.anchor_task_key) updateAnchorConstraint(item.key, item.anchor_task_key)
      })
    }

    return {
      anchorContraintList,
      clearAnchorConstraint,
      ensureAnchorConstraints,
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
