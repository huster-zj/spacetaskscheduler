import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import TaskTransferService from '@/services/TaskTransfer'
import {
  useBasicInfoStore,
  useDurationStore,
  useFormHeadStore,
  usePropStore
} from '@/stores/taskDetailNumStore'

describe('task transfer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps imported task keys and resource requirements aligned', () => {
    const result = new TaskTransferService().transferTask({
      taskFormHeadList: [
        { key: 'task-a', taskName: '任务 A' },
        { key: 'task-b', taskName: '任务 B' }
      ],
      taskBasicInfoList: [
        { key: 'task-a', resourceRequirement: '资源 A' },
        { key: 'task-b', resourceRequirement: '资源 B' }
      ],
      taskPropList: [{ key: 'task-a' }, { key: 'task-b' }],
      taskDurationList: [{ key: 'task-a' }, { key: 'task-b' }]
    })

    expect(result.success).toBe(true)
    expect(useFormHeadStore().formHeadList.map(({ key }) => key)).toEqual(['task-a', 'task-b'])
    expect(useBasicInfoStore().basicInfoList.map(({ key, resourceRequirement }) => ({ key, resourceRequirement })))
      .toEqual([
        { key: 'task-a', resourceRequirement: '资源 A' },
        { key: 'task-b', resourceRequirement: '资源 B' }
      ])
    expect(usePropStore().propList.map(({ key }) => key)).toEqual(['task-a', 'task-b'])
    expect(useDurationStore().durationList.map(({ key }) => key)).toEqual(['task-a', 'task-b'])
  })
})
