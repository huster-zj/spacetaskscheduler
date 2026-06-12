/*
 * @Author: Jerry
 * @Date: 2025-03-11 09:15:52
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-03-11 10:46:25
 * @FilePath: \spacetaskscheduler\src\stores\resourceView.js
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useResourceViewStore = defineStore('resourceView', 
  () => {

    const rawTasks = ref([
      {
        id: 1,
        text: 'Resource #1',
        earliest_start: '2024-09-26',
        latest_end: '2024-10-01',
        start_date: '2024-09-28',
        end_date: '2024-09-29',
      },
      {
        id: 2,
        text: 'Resource #2',
        earliest_start: '2024-09-27',
        latest_end: '2024-10-05',
        start_date: '2024-09-27',
        end_date: '2024-09-29',
        parent: 1
      }
    ])

    // 添加新任务
    const addTask = (task) => {
      rawTasks.value.push(task)
    }

    // 更新任务
    const updateTask = (id, updatedTask) => {
      const index = rawTasks.value.findIndex(task => task.id === id)
      if (index !== -1) {
        rawTasks.value[index] = { ...rawTasks.value[index], ...updatedTask }
      }
    }

    // 删除任务
    const deleteTask = (id) => {
      const index = rawTasks.value.findIndex(task => task.id === id)
      if (index !== -1) {
        rawTasks.value.splice(index, 1)
      }
    }

    return {
      rawTasks,
      addTask,
      updateTask,
      deleteTask
    }
  },
  {
    persist: {
      enabled: true,
      key: 'resourceView', // 修改为当前store的名称
      storage: sessionStorage
    }
  }
)