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
    const createEmptyOutput = () => ({
      continuousEvents: [],
      discreteEvents: [],
      taskStates: {},
      batchState: { status: 'idle', message: '', updatedAt: '' }
    })

    // 存储连续和非连续跟踪事件的预处理结果
    const preprocessOutput = ref(createEmptyOutput())

    const ensureOutputShape = () => {
      if (!Array.isArray(preprocessOutput.value.continuousEvents)) {
        preprocessOutput.value.continuousEvents = []
      }
      if (!Array.isArray(preprocessOutput.value.discreteEvents)) {
        preprocessOutput.value.discreteEvents = []
      }
      if (!preprocessOutput.value.taskStates || typeof preprocessOutput.value.taskStates !== 'object') {
        preprocessOutput.value.taskStates = {}
      }
      if (!preprocessOutput.value.batchState || typeof preprocessOutput.value.batchState !== 'object') {
        preprocessOutput.value.batchState = { status: 'idle', message: '', updatedAt: '' }
      }
    }

    const getEventTaskName = (event) => String(event?.task_name || event?.taskName || '')
    const getEventTaskKey = (event) => String(event?.task_key || event?.taskKey || '')
    const matchesTask = (event, taskKey, taskName) => {
      const eventTaskKey = getEventTaskKey(event)
      if (eventTaskKey) return eventTaskKey === String(taskKey || '')
      return Boolean(taskName) && getEventTaskName(event) === String(taskName)
    }

    const normalizeEvents = (events, taskKey, taskName) => (Array.isArray(events) ? events : [])
      .map((event) => ({
        ...event,
        task_key: event?.task_key || event?.taskKey || taskKey || '',
        task_name: event?.task_name || event?.taskName || taskName || ''
      }))

    // 更新连续跟踪事件数据
    const updateContinuousEvents = (events) => {
      ensureOutputShape()
      preprocessOutput.value.continuousEvents = events
    }

    // 更新非连续跟踪事件数据
    const updateDiscreteEvents = (events) => {
      ensureOutputShape()
      preprocessOutput.value.discreteEvents = events
    }

    const replaceTaskEvents = (
      taskKey,
      taskName,
      continuousEvents,
      discreteEvents,
      { status = 'success', message = '' } = {}
    ) => {
      ensureOutputShape()
      const currentContinuous = preprocessOutput.value.continuousEvents
        .filter((event) => !matchesTask(event, taskKey, taskName))
      const currentDiscrete = preprocessOutput.value.discreteEvents
        .filter((event) => !matchesTask(event, taskKey, taskName))

      const nextContinuous = normalizeEvents(continuousEvents, taskKey, taskName)
      const nextDiscrete = normalizeEvents(discreteEvents, taskKey, taskName)
      preprocessOutput.value.continuousEvents = [
        ...currentContinuous,
        ...nextContinuous.map((event) => ({ ...event, kind: 'continuous' }))
      ]
      preprocessOutput.value.discreteEvents = [
        ...currentDiscrete,
        ...nextDiscrete.map((event) => ({ ...event, kind: 'discrete' }))
      ]
      preprocessOutput.value.taskStates[String(taskKey || taskName)] = {
        status,
        message,
        updatedAt: new Date().toISOString()
      }
    }

    const replaceAllEvents = ({
      continuousEvents = [],
      discreteEvents = [],
      taskStates = {}
    } = {}) => {
      ensureOutputShape()
      preprocessOutput.value.continuousEvents = normalizeEvents(continuousEvents)
      preprocessOutput.value.discreteEvents = normalizeEvents(discreteEvents)
      preprocessOutput.value.taskStates = { ...taskStates }
      preprocessOutput.value.batchState = {
        status: 'success',
        message: '',
        updatedAt: new Date().toISOString()
      }
    }

    const getEventsForTask = (taskKey, taskName) => {
      ensureOutputShape()
      return [
        ...preprocessOutput.value.continuousEvents,
        ...preprocessOutput.value.discreteEvents
      ].filter((event) => matchesTask(event, taskKey, taskName))
    }

    const getTaskState = (taskKey, taskName) => {
      ensureOutputShape()
      const key = String(taskKey || taskName || '')
      const state = preprocessOutput.value.taskStates[key]
      if (state) return state
      return getEventsForTask(taskKey, taskName).length
        ? { status: 'success', message: '', updatedAt: '' }
        : { status: 'idle', message: '', updatedAt: '' }
    }

    const markTaskStale = (taskKey, taskName, message = '资源需求已变更，请重新计算可行时间窗') => {
      ensureOutputShape()
      preprocessOutput.value.taskStates[String(taskKey || taskName)] = {
        status: 'stale',
        message,
        updatedAt: new Date().toISOString()
      }
    }

    const markTaskError = (taskKey, taskName, message = '预处理失败') => {
      ensureOutputShape()
      preprocessOutput.value.taskStates[String(taskKey || taskName)] = {
        status: 'error',
        message,
        updatedAt: new Date().toISOString()
      }
    }

    const markBatchError = (message = '预处理失败') => {
      ensureOutputShape()
      preprocessOutput.value.batchState = {
        status: 'error',
        message,
        updatedAt: new Date().toISOString()
      }
    }

    // 清空所有数据
    const clearAll = () => {
      preprocessOutput.value = createEmptyOutput()
    }

    // 获取数据的辅助方法
    const getContinuousEvents = () => preprocessOutput.value.continuousEvents
    const getDiscreteEvents = () => preprocessOutput.value.discreteEvents

    return { 
      preprocessOutput,
      updateContinuousEvents,
      updateDiscreteEvents, 
      replaceTaskEvents,
      replaceAllEvents,
      getEventsForTask,
      getTaskState,
      markTaskStale,
      markTaskError,
      markBatchError,
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
