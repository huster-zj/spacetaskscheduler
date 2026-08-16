import { describe, expect, it } from 'vitest'

import { normalizePreprocessEvents } from '@/services/ParseFile'
import {
  buildCandidateResourceRows,
  buildCandidateTimeRows,
  buildTaskTimeWindowRows
} from '@/services/preprocessData'

const event = {
  task_key: 'task-a',
  task_name: 'FK-1-1',
  tracking_plan_id: 'PLAN-1',
  start_time: '2026-09-14 01:00:00',
  end_time: '2026-09-14 02:00:00',
  duration: 3600,
  cekong_resource: [
    { cekong_station: 'TIANLIAN_2-01', cekong_resource_id: 'CK-1' },
    { cekong_station: 'TIANLIAN_2-02', cekong_resource_id: 'CK-2' }
  ]
}

describe('preprocess data mapping', () => {
  it('normalizes task identity and preserves every candidate resource', () => {
    const [normalized] = normalizePreprocessEvents([event])

    expect(normalized).toMatchObject({
      task_key: 'task-a',
      task_name: 'FK-1-1',
      resources: ['CK-1', 'CK-2']
    })
    expect(normalized.resourceDetails).toHaveLength(2)
  })

  it('builds readable candidate time and resource rows', () => {
    const [normalized] = normalizePreprocessEvents([event])
    const timeRows = buildCandidateTimeRows([normalized])
    const resourceRows = buildCandidateResourceRows([normalized])

    expect(timeRows[0]).toMatchObject({
      planId: 'PLAN-1',
      duration: '60 分钟',
      resources: 'CK-1、CK-2'
    })
    expect(resourceRows).toHaveLength(2)
    expect(resourceRows.map(({ resourceId }) => resourceId)).toEqual(['CK-1', 'CK-2'])
  })

  it('maps configured task windows without placeholder rows', () => {
    const rows = buildTaskTimeWindowRows({
      singleDiscreteData: [{
        id: 1,
        startTime: '2026-09-14 00:00:00',
        endTime: '2026-09-14 01:30:00'
      }],
      repeatPeriodData: [{
        startTime: '2026-09-15 00:00:00',
        endTime: '2026-09-15 00:30:00'
      }]
    })

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ type: '单次离散时间窗', duration: '90 分钟' })
    expect(rows[1]).toMatchObject({ type: '周期时间段', duration: '30 分钟' })
  })
})
