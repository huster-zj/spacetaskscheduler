import { describe, expect, it } from 'vitest'

import {
  createResourcePool,
  normalizeResourcePool,
  validateResourcePool
} from '@/services/resourcePool'

describe('resource pool model', () => {
  const context = {
    resources: [{ resourceName: '资源 A' }, { resourceName: '资源 B' }],
    resourceGroups: [{
      resourceGroupName: '测控资源组',
      includeResourceList: ['资源 A', '资源 B'],
      excludeResourceList: []
    }],
    existingPools: []
  }

  it('normalizes a pool with a stable key and task identity', () => {
    const pool = createResourcePool({ taskKey: 'task-a', poolName: '主备资源池' })
    expect(pool).toMatchObject({
      taskKey: 'task-a',
      poolName: '主备资源池',
      selectionMode: 'all',
      resourceList: [],
      resourceGroupList: []
    })
    expect(pool.key).toBeTruthy()
  })

  it('validates duplicate names, members, and count limits', () => {
    const duplicate = validateResourcePool({
      ...createResourcePool({ taskKey: 'task-a', poolName: '资源 A', resourceList: ['资源 A'] }),
      resourceList: ['资源 A']
    }, context)
    expect(duplicate.valid).toBe(false)
    expect(duplicate.errors.join('')).toContain('重名')

    const tooMany = validateResourcePool({
      ...createResourcePool({
        taskKey: 'task-a',
        poolName: '候选池',
        selectionMode: 'count',
        requiredCount: 3,
        resourceList: ['资源 A'],
        resourceGroupList: ['测控资源组']
      })
    }, context)
    expect(tooMany.valid).toBe(false)
    expect(tooMany.errors.join('')).toContain('不能超过')
  })

  it('rejects case-insensitive duplicate names and groups that expand to no resources', () => {
    const duplicate = validateResourcePool({
      ...createResourcePool({ poolName: 'resource a', resourceList: ['资源 B'] })
    }, {
      ...context,
      resources: [{ resourceName: 'Resource A' }, { resourceName: '资源 B' }]
    })
    expect(duplicate.errors.join('')).toContain('重名')

    const emptyGroup = validateResourcePool({
      ...createResourcePool({ poolName: '空组池', resourceGroupList: ['空组'] })
    }, {
      resources: context.resources,
      resourceGroups: [{ resourceGroupName: '空组', includeResourceList: ['未配置资源'] }],
      existingPools: []
    })
    expect(emptyGroup.errors.join('')).toContain('有效资源')
  })

  it('accepts a count pool after normalizing old aliases', () => {
    const pool = normalizeResourcePool({
      id: 'pool-1',
      taskKey: 'task-a',
      name: '候选池',
      mode: 'count',
      count: 1,
      resources: ['资源 A'],
      groups: []
    })
    expect(pool).toMatchObject({
      key: 'pool-1',
      poolName: '候选池',
      selectionMode: 'count',
      requiredCount: 1,
      resourceList: ['资源 A']
    })
  })

  it('includes resource pools in expression candidates', async () => {
    const { createResourceRequirementCandidates } = await import('@/services/resourceRequirement')
    expect(createResourceRequirementCandidates({
      resourcePools: [{ poolName: '主备资源池' }]
    })).toEqual([{ value: '主备资源池', type: 'resource-pool' }])
  })
})
