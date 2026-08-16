import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

const candidate = (taskKey, planId) => ({
  task_key: taskKey,
  task_name: taskKey,
  tracking_plan_id: planId,
  cekong_resource: []
})

describe('preprocess output task isolation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('replaces one task without deleting another task result', () => {
    const store = usePreprocessOutputStore()
    store.replaceAllEvents({
      discreteEvents: [candidate('task-a', 'A-1'), candidate('task-b', 'B-1')]
    })

    store.replaceTaskEvents('task-a', 'task-a', [], [candidate('task-a', 'A-2')])

    expect(store.getEventsForTask('task-a', 'task-a').map(({ tracking_plan_id }) => tracking_plan_id))
      .toEqual(['A-2'])
    expect(store.getEventsForTask('task-b', 'task-b').map(({ tracking_plan_id }) => tracking_plan_id))
      .toEqual(['B-1'])
  })

  it('batch replacement removes stale task results and retains state', () => {
    const store = usePreprocessOutputStore()
    store.replaceTaskEvents('task-old', '旧任务', [], [candidate('task-old', 'OLD')])
    store.replaceAllEvents({
      continuousEvents: [candidate('task-new', 'NEW')],
      taskStates: { 'task-new': { status: 'success', message: '' } }
    })

    expect(store.getEventsForTask('task-old', '旧任务')).toEqual([])
    expect(store.getTaskState('task-new', '新任务').status).toBe('success')
  })

  it('records task and batch errors without deleting existing events', () => {
    const store = usePreprocessOutputStore()
    store.replaceTaskEvents('task-a', '任务 A', [], [candidate('task-a', 'A-1')])

    store.markTaskError('task-a', '任务 A', '表达式无效')
    store.markBatchError('网络错误')

    expect(store.getTaskState('task-a', '任务 A')).toMatchObject({
      status: 'error',
      message: '表达式无效'
    })
    expect(store.preprocessOutput.batchState).toMatchObject({
      status: 'error',
      message: '网络错误'
    })
    expect(store.getEventsForTask('task-a', '任务 A')).toHaveLength(1)
  })
})
