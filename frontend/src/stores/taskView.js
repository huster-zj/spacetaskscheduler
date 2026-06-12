/*
 * @Author: Jerry
 * @Date: 2025-03-11 09:15:52
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-03-11 09:27:49
 * @FilePath: \spacetaskscheduler\src\stores\taskView.js
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTaskViewStore = defineStore('taskView', () => {
  const rawTasks = ref([
    {
      id: 1,
      text: 'FK101',
      earliest_start: '2024-09-26',
      latest_end: '2024-10-01',
      available_start: '2024-09-27',
      available_end: '2024-09-30',
      start_date: '2024-09-28',
      end_date: '2024-09-29',
    },
    {
      id: 2,
      text: 'FK101(1)',
      earliest_start: '2024-09-27',
      latest_end: '2024-10-05',
      available_start: '2024-09-27',
      available_end: '2024-10-03',
      start_date: '2024-09-27',
      end_date: '2024-09-29',
      parent: 1
    },
    {
      id: 3,
      text: 'FK101(2)',
      earliest_start: '2024-09-27',
      latest_end: '2024-10-01',
      available_start: '2024-09-28',
      available_end: '2024-10-01',
      start_date: '2024-09-28',
      end_date: '2024-09-29',
      parent: 1
    },
    {
      id: 4,
      text: 'FK102',
      earliest_start: '2024-10-04',
      latest_end: '2024-10-09',
      available_start: '2024-10-05',
      available_end: '2024-10-08',
      start_date: '2024-10-05',
      end_date: '2024-10-07',
    },
    {
      id: 5,
      text: 'FK102(1)',
      earliest_start: '2024-10-04',
      latest_end: '2024-10-07',
      available_start: '2024-10-05',
      available_end: '2024-10-07',
      start_date: '2024-10-05',
      end_date: '2024-10-06',
      parent: 4
    },
    {
      id: 6,
      text: 'FK103',
      earliest_start: '2024-10-10',
      latest_end: '2024-10-15',
      available_start: '2024-10-11',
      available_end: '2024-10-14',
      start_date: '2024-10-11',
      end_date: '2024-10-13',
    },
    {
      id: 7,
      text: 'FK103(1)',
      earliest_start: '2024-10-10',
      latest_end: '2024-10-13',
      available_start: '2024-10-11',
      available_end: '2024-10-13',
      start_date: '2024-10-11',
      end_date: '2024-10-12',
      parent: 6
    },
    {
      id: 8,
      text: 'FK103(2)',
      earliest_start: '2024-10-11',
      latest_end: '2024-10-15',
      available_start: '2024-10-12',
      available_end: '2024-10-14',
      start_date: '2024-10-12',
      end_date: '2024-10-13',
      parent: 6
    },
    {
      id: 9,
      text: 'FK104',
      earliest_start: '2024-10-16',
      latest_end: '2024-10-20',
      available_start: '2024-10-17',
      available_end: '2024-10-19',
      start_date: '2024-10-17',
      end_date: '2024-10-18',
    },
    {
      id: 10,
      text: 'FK104(1)',
      earliest_start: '2024-10-16',
      latest_end: '2024-10-19',
      available_start: '2024-10-17',
      available_end: '2024-10-19',
      start_date: '2024-10-17',
      end_date: '2024-10-18',
      parent: 9
    },
    {
      id: 11,
      text: 'FK104(2)',
      earliest_start: '2024-10-17',
      latest_end: '2024-10-20',
      available_start: '2024-10-18',
      available_end: '2024-10-19',
      start_date: '2024-10-18',
      end_date: '2024-10-19',
      parent: 9
    },
    {
      id: 12,
      text: 'FK105',
      earliest_start: '2024-10-21',
      latest_end: '2024-10-25',
      available_start: '2024-10-22',
      available_end: '2024-10-24',
      start_date: '2024-10-22',
      end_date: '2024-10-23',
    },
    {
      id: 13,
      text: 'FK105(1)',
      earliest_start: '2024-10-21',
      latest_end: '2024-10-24',
      available_start: '2024-10-22',
      available_end: '2024-10-24',
      start_date: '2024-10-22',
      end_date: '2024-10-23',
      parent: 12
    },
    {
      id: 14,
      text: 'FK105(2)',
      earliest_start: '2024-10-22',
      latest_end: '2024-10-25',
      available_start: '2024-10-23',
      available_end: '2024-10-24',
      start_date: '2024-10-23',
      end_date: '2024-10-24',
      parent: 12
    },
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
})