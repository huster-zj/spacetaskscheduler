import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useFormHeadStore } from '@/stores/taskDetailNumStore'
import {
  useAnchorContraintListStore
} from '@/stores/useAnchorContraintListStore'
import { useTemConstraintsListStore } from '@/stores/useTemConstraintsListStore'

describe('constraint stores', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('repairs empty anchors and keeps task details synchronized', () => {
    const taskStore = useFormHeadStore()
    taskStore.formHeadList = [{ key: 'task-1', taskName: '任务-1', priority: 3, taskNotes: '备注' }]

    const anchorStore = useAnchorContraintListStore()
    anchorStore.anchorContraintList = []
    anchorStore.ensureAnchorConstraints()

    expect(anchorStore.anchorContraintList).toHaveLength(2)
    expect(anchorStore.anchorContraintList[0].anchor_task).toBe('无')

    anchorStore.updateAnchorConstraint('1', 'task-1')
    expect(anchorStore.anchorContraintList[0]).toMatchObject({
      anchor_task: '任务-1',
      anchor_task_key: 'task-1',
      anchor_task_priority: 3,
      anchor_task_note: '备注'
    })

    taskStore.formHeadList = []
    anchorStore.ensureAnchorConstraints()
    expect(anchorStore.anchorContraintList[0].anchor_task).toBe('无')
  })

  it('updates and removes temporal constraints by stable key', () => {
    const constraintStore = useTemConstraintsListStore()
    const created = constraintStore.addTemConstraints({
      tem_constraint_task1: '任务-1',
      tem_constraint_task2: '任务-2',
      tem_constraint_type: 'predecessor'
    })

    expect(constraintStore.updateTemConstraints(created.key, {
      tem_constraint_task1: '任务-1-更新'
    })).toBe(true)
    expect(constraintStore.getTemConstraintByKey(created.key).tem_constraint_task1).toBe('任务-1-更新')
    expect(constraintStore.removeTemConstraints(created.key)).toBe(true)
    expect(constraintStore.getTemConstraintByKey(created.key)).toBeUndefined()
  })
})
