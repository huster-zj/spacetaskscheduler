// import { useTemConstraintsListStore } from '@/stores/useTemConstraintsListStore.js'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { nanoid } from 'nanoid'

export const useTemConstraintsListStore = defineStore('temConstraintsList', () => {
  // 定义一个数组来存储 temConstraints 对象'
  const temConstraintsList = ref([])
  // const temConstraintsList = ref([
  //   {
  //     key: '1',
  //     tem_constraint_task1: 'FK101',
  //     tem_constraint_task2: 'FK102',
  //     tem_constraint_type: 'predecessor',
  //     minimum_interval_time: '1',
  //     min_timing_start_point: 'start',
  //     maximum_interval_time: '2',
  //     max_timing_start_point: 'end',
  //     tem_constraint_note: '无'
  //   },
  //   {
  //     key: '2',
  //     tem_constraint_task1: 'FK102',
  //     tem_constraint_task2: 'FK103',
  //     tem_constraint_type: 'predecessor',
  //     minimum_interval_time: '1',
  //     min_timing_start_point: 'start',
  //     maximum_interval_time: '2',
  //     max_timing_start_point: 'start',
  //     tem_constraint_note: '无'
  //   },
  //   {
  //     key: '3',
  //     tem_constraint_task1: 'FK103',
  //     tem_constraint_task2: 'FK104',
  //     tem_constraint_type: 'during',
  //     minimum_interval_time: '1',
  //     min_timing_start_point: 'end',
  //     maximum_interval_time: '2',
  //     max_timing_start_point: 'end',
  //     tem_constraint_note: '无'
  //   },
  // ]);

  // 定义 temConstraints 对象的格式
  const createTemConstraints = (tem_constraint_task1 = '', tem_constraint_task2 = '', tem_constraint_type = '', minimum_interval_time = '', min_timing_start_point = '', maximum_interval_time = '', max_timing_start_point = '', tem_constraint_note = '') => {
    return {
      key: nanoid(),
      tem_constraint_task1: tem_constraint_task1,
      tem_constraint_task2: tem_constraint_task2,
      tem_constraint_type: tem_constraint_type,
      minimum_interval_time: minimum_interval_time,
      min_timing_start_point: min_timing_start_point,
      maximum_interval_time: maximum_interval_time,
      max_timing_start_point: max_timing_start_point,
      tem_constraint_note: tem_constraint_note,
    }
  }

  // 添加一个新的 temConstraints 对象
  const addTemConstraints = (newTemConstraints) => {
    const constraint = createTemConstraints(
      newTemConstraints.tem_constraint_task1,
      newTemConstraints.tem_constraint_task2,
      newTemConstraints.tem_constraint_type,
      newTemConstraints.minimum_interval_time,
      newTemConstraints.min_timing_start_point,
      newTemConstraints.maximum_interval_time,
      newTemConstraints.max_timing_start_point,
      newTemConstraints.tem_constraint_note
    )
    temConstraintsList.value.push(constraint)
    return constraint
  }

  // 更新一个 temConstraints 对象
  const updateTemConstraints = (key, newTemConstraints) => {
    const constraint = temConstraintsList.value.find((item) => String(item.key) === String(key))
    if (!constraint) return false

    Object.assign(constraint, newTemConstraints, { key: constraint.key })
    return true
  }

  // 删除一个 temConstraints 对象
  const removeTemConstraints = (key) => {
    const index = temConstraintsList.value.findIndex((item) => String(item.key) === String(key))
    if (index < 0) return false

    temConstraintsList.value.splice(index, 1)
    return true
  }

  const getTemConstraintByKey = (key) => temConstraintsList.value.find(
    (item) => String(item.key) === String(key)
  )

  return {
    temConstraintsList,
    addTemConstraints,
    getTemConstraintByKey,
    updateTemConstraints,
    removeTemConstraints
  }
},
{
  // 定义一个持久化的策略，将数据存储在 sessionStorage 中
  persist: {
  enabled: true,
  key: 'temConstraintsList',
  storage: sessionStorage
  }
 }
)
