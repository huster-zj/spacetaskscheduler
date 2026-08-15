import { describe, expect, it } from 'vitest'

import { parseOutputContent } from '@/services/ParseFile'
import {
  buildResourceGanttData,
  buildTaskGanttData,
  createScheduleResult
} from '@/services/scheduleData'

const outputText = `调度结果\n飞控事件ID|状态|开始时间|结束时间|弧段ID\nFK-1|是|1735689600|1735693200|ARC-1\nFK-2|否|||ARC-2\n使用的弧段总数：1`

describe('schedule data conversion', () => {
  it('parses assigned and unassigned output rows without example data', () => {
    const parsed = parseOutputContent(outputText)

    expect(parsed.totalArcs).toBe(1)
    expect(parsed.parsingStatus).toBe('success')
    expect(parsed.data).toHaveLength(2)
    expect(parsed.data[0]).toMatchObject({ id: 'FK-1', status: '是', arcId: 'ARC-1' })
  })

  it('reports non-empty output that cannot be parsed', () => {
    const parsed = parseOutputContent('算法返回了无法识别的内容')

    expect(parsed.hasContent).toBe(true)
    expect(parsed.parsingStatus).toBe('error')
    expect(parsed.parsingError).toContain('未识别到调度结果表格')
  })

  it('joins algorithm rows with preprocess resources and task gantt data', () => {
    const scheduleResult = createScheduleResult({
      outputText,
      preprocessOutput: {
        continuousEvents: [{
          task_name: 'FK-1',
          tracking_plan_id: 'ARC-1',
          start_time: '1735689600',
          end_time: '1735693200',
          cekong_resource: [{ cekong_resource_id: 'CK-1' }]
        }],
        discreteEvents: []
      },
      taskDefinitions: [{ key: 'task-1', taskName: 'FK-1' }]
    })
    const taskGantt = buildTaskGanttData({
      scheduleResult,
      taskDefinitions: [{ key: 'task-1', taskName: 'FK-1' }],
      taskProperties: [],
      schedulerStateMap: new Map()
    })

    expect(scheduleResult.rows[0].resourceLabel).toBe('CK-1')
    expect(taskGantt.data[0]).toMatchObject({
      text: 'FK-1',
      kind: 'scheduled',
      arcId: 'ARC-1',
      duration: 60
    })
  })

  it('joins discrete output by logical task and resource without duplicating segmented tasks', () => {
    const segmentedOutput = `调度结果\n飞控事件ID|状态|开始时间|结束时间|弧段ID\nFK-1-3_1|是|1735689600|1735693200|CK-TIANLIAN_2-01-1\n使用的弧段总数：1`
    const taskDefinitions = [{ key: 'task-3', taskName: 'FK-1-3' }]
    const scheduleResult = createScheduleResult({
      outputText: segmentedOutput,
      preprocessOutput: {
        continuousEvents: [],
        discreteEvents: [{
          task_name: 'FK-1-3_1',
          tracking_plan_id: 'Plan_1_7',
          start_time: '1735689600',
          end_time: '1735693200',
          cekong_resource: [{ cekong_resource_id: 'CK-TIANLIAN_2-01-1' }]
        }]
      },
      taskDefinitions
    })
    const taskGantt = buildTaskGanttData({
      scheduleResult,
      taskDefinitions,
      taskProperties: [{
        key: 'task-3',
        singleDiscreteData: [{ startTime: '1735689600', endTime: '1735696800' }]
      }]
    })

    expect(scheduleResult.rows).toHaveLength(1)
    expect(scheduleResult.rows[0]).toMatchObject({
      id: 'FK-1-3_1',
      resourceLabel: 'CK-TIANLIAN_2-01-1'
    })
    expect(scheduleResult.rows[0].event.tracking_plan_id).toBe('Plan_1_7')
    expect(taskGantt.data).toHaveLength(1)
    expect(taskGantt.data[0].kind).toBe('scheduled')
  })

  it('groups assigned rows under real resource names', () => {
    const scheduleResult = createScheduleResult({
      outputText,
      preprocessOutput: {
        continuousEvents: [{
          task_name: 'FK-1',
          tracking_plan_id: 'ARC-1',
          start_time: '1735689600',
          end_time: '1735693200',
          cekong_resource: [{ cekong_resource_id: 'CK-1' }]
        }],
        discreteEvents: []
      },
      taskDefinitions: []
    })
    const resourceGantt = buildResourceGanttData({
      scheduleResult,
      resourceDefinitions: [],
      resourceUsabilities: [],
      resourceOccupancyMap: new Map(),
      cekongResources: [{ cekong_resource_name: 'CK-1' }]
    })

    expect(resourceGantt.data).toHaveLength(2)
    expect(resourceGantt.data[0]).toMatchObject({ text: 'CK-1', type: 'project' })
    expect(resourceGantt.data[1]).toMatchObject({ text: 'FK-1', parent: 'resource-0' })
  })

  it('keeps every valid task and resource time window in gantt data', () => {
    const scheduleResult = createScheduleResult({ outputText: '', taskDefinitions: [] })
    const windows = [
      { startTime: '1735689600', endTime: '1735693200' },
      { startTime: '1735776000', endTime: '1735779600' }
    ]
    const taskGantt = buildTaskGanttData({
      scheduleResult,
      taskDefinitions: [{ key: 'task-1', taskName: 'FK-1' }],
      taskProperties: [{ key: 'task-1', singleDiscreteData: windows }]
    })
    const resourceGantt = buildResourceGanttData({
      scheduleResult,
      resourceDefinitions: [{ key: 'resource-1', resourceName: '测控资源 1' }],
      resourceUsabilities: [{ key: 'resource-1', availabilityDiscreteData: windows }]
    })

    expect(taskGantt.data).toHaveLength(2)
    expect(taskGantt.data.every(({ kind }) => kind === 'window')).toBe(true)
    expect(resourceGantt.data).toHaveLength(3)
    expect(resourceGantt.data.filter(({ kind }) => kind === 'window')).toHaveLength(2)
  })
})
