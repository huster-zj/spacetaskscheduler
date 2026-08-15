import dayjs from 'dayjs'

import {
  isAssignedStatus,
  normalizePreprocessEvents,
  parseOutputContent
} from '@/services/ParseFile'

const MINUTE = 60 * 1000

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

export const toDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value?.toDate === 'function') return toDate(value.toDate())

  if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value).trim())) {
    const number = Number(value)
    if (!Number.isFinite(number)) return null
    const date = new Date(Math.abs(number) < 1e12 ? number * 1000 : number)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const normalized = String(value).trim().replace(/_/g, ' ')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDateTime = (value) => {
  const date = toDate(value)
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

export const formatGanttDate = (value) => {
  const date = toDate(value)
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : ''
}

const durationMinutes = (start, end) => {
  const startDate = toDate(start)
  const endDate = toDate(end)
  if (!startDate || !endDate || endDate <= startDate) return 0
  return Math.max(1, Math.ceil((endDate - startDate) / MINUTE))
}

export const normalizeLogicalTaskId = (value) => String(value || '').trim().replace(/_\d+$/, '')

export const findScheduleRowsForTask = (scheduleResult, task = {}) => {
  const identifiers = [task.key, task.taskName]
    .filter((value) => value !== undefined && value !== null && String(value).trim())
    .map(String)

  return (scheduleResult?.rows || []).filter((row) => {
    const rowIdentifiers = [row.id, row.event?.task_name]
      .filter((value) => value !== undefined && value !== null && String(value).trim())
      .map(String)

    return rowIdentifiers.some((rowIdentifier) => identifiers.some((identifier) =>
      rowIdentifier === identifier || normalizeLogicalTaskId(rowIdentifier) === normalizeLogicalTaskId(identifier)
    ))
  })
}

const findEvent = (events, item) => {
  const arcId = String(item.arcId || '')
  const exactArcMatch = events.find((event) => String(event.tracking_plan_id) === arcId)
  if (exactArcMatch) return exactArcMatch

  const logicalTaskId = normalizeLogicalTaskId(item.id)
  return events.find((event) =>
    normalizeLogicalTaskId(event.task_name) === logicalTaskId &&
    event.resources.includes(arcId)
  )
}

export const createScheduleResult = ({ outputText = '', preprocessOutput, taskDefinitions = [] }) => {
  const parsed = parseOutputContent(outputText)
  const events = normalizePreprocessEvents(preprocessOutput)
  const seenTasks = new Set()

  const rows = parsed.data.map((item, index) => {
    const event = findEvent(events, item)
    const startTime = firstDefined(item.startTime, event?.start_time)
    const endTime = firstDefined(item.endTime, event?.end_time)
    const resources = event?.resources || []
    seenTasks.add(normalizeLogicalTaskId(item.id))

    return {
      ...item,
      key: item.key || `result-${index}`,
      assigned: isAssignedStatus(item.status),
      startTime,
      endTime,
      startTimeLabel: formatDateTime(startTime),
      endTimeLabel: formatDateTime(endTime),
      durationMinutes: durationMinutes(startTime, endTime),
      resources,
      resourceLabel: resources.join('、') || '-',
      target: event?.task_to_craft || '-',
      event
    }
  })

  if (parsed.hasContent) {
    taskDefinitions.forEach((task) => {
      const taskId = String(task.taskName || task.key || '')
      if (!taskId || seenTasks.has(normalizeLogicalTaskId(taskId))) return
      rows.push({
        key: `unreported-${task.key || taskId}`,
        id: taskId,
        status: '未生成结果',
        assigned: false,
        startTime: '',
        endTime: '',
        startTimeLabel: '-',
        endTimeLabel: '-',
        durationMinutes: 0,
        arcId: '-',
        resources: [],
        resourceLabel: '-',
        target: '-',
        event: null
      })
    })
  }

  const assignedCount = rows.filter((item) => item.assigned).length
  return {
    rows,
    events,
    totalArcs: parsed.totalArcs,
    hasOutput: parsed.hasContent,
    parsingStatus: parsed.parsingStatus,
    parsingError: parsed.parsingError,
    assignedCount,
    unassignedCount: rows.length - assignedCount,
    assignmentRate: rows.length ? Math.round((assignedCount / rows.length) * 100) : 0
  }
}

const getValidWindows = (detail = {}) => {
  const windowLists = [
    detail.singlePeriodData,
    detail.singleDiscreteData,
    detail.repeatPeriodData,
    detail.repeatDiscreteData,
    detail.availabilityPeriodData,
    detail.availabilityDiscreteData,
    detail.visible_time_window
  ]

  const windows = windowLists.flatMap((list) => {
    if (!Array.isArray(list)) return []
    return list.flatMap((item) => {
      const start = firstDefined(item?.startTime, item?.start_time, item?.start)
      const end = firstDefined(item?.endTime, item?.end_time, item?.end)
      return durationMinutes(start, end) > 0 ? [{ start, end }] : []
    })
  })

  return windows.filter((window, index) => windows.findIndex((candidate) =>
    String(candidate.start) === String(window.start) &&
    String(candidate.end) === String(window.end)
  ) === index)
}

const toGanttRow = ({ id, text, start, end, kind, resource = '', arcId = '', parent = 0 }) => {
  const duration = durationMinutes(start, end)
  if (!duration) return null
  return {
    id,
    text,
    start_date: formatGanttDate(start),
    end_date: formatGanttDate(end),
    startLabel: formatDateTime(start),
    endLabel: formatDateTime(end),
    duration,
    kind,
    resource,
    arcId,
    parent,
    open: true
  }
}

export const buildTaskGanttData = ({
  scheduleResult,
  taskDefinitions = [],
  taskProperties = [],
  schedulerStateMap = new Map()
}) => {
  const data = []
  const represented = new Set()

  scheduleResult.rows.forEach((result, index) => {
    const event = result.event
    const start = firstDefined(result.startTime, event?.start_time)
    const end = firstDefined(result.endTime, event?.end_time)
    const row = toGanttRow({
      id: `result-${index}`,
      text: result.id,
      start,
      end,
      kind: result.assigned ? 'scheduled' : 'unassigned',
      resource: result.resourceLabel === '-' ? '' : result.resourceLabel,
      arcId: result.arcId
    })
    if (row) {
      represented.add(normalizeLogicalTaskId(result.id))
      data.push(row)
    }
  })

  taskDefinitions.forEach((task, taskIndex) => {
    const taskName = String(task.taskName || task.key || `任务 ${taskIndex + 1}`)
    if (represented.has(normalizeLogicalTaskId(taskName))) return

    const scheduleState = schedulerStateMap instanceof Map
      ? schedulerStateMap.get(task.key)?.taskScheduleData || []
      : []
    scheduleState.forEach((state, stateIndex) => {
      const row = toGanttRow({
        id: `state-${task.key}-${stateIndex}`,
        text: taskName,
        start: state.startTime,
        end: state.endTime,
        kind: 'scheduled',
        resource: state.resource || ''
      })
      if (row) data.push(row)
    })

    if (scheduleState.length) return
    const detail = taskProperties.find((item) => item.key === task.key) || taskProperties[taskIndex]
    getValidWindows(detail).forEach((window, windowIndex) => {
      const row = toGanttRow({
        id: `window-${task.key || taskIndex}-${windowIndex}`,
        text: taskName,
        start: window.start,
        end: window.end,
        kind: 'window'
      })
      if (row) data.push(row)
    })
  })

  return { data, links: [] }
}

const addAssignment = (groups, resourceName, assignment) => {
  if (!resourceName) return
  const key = String(resourceName)
  if (!groups.has(key)) groups.set(key, [])
  const duplicate = groups.get(key).some((item) =>
    item.taskName === assignment.taskName &&
    String(item.start) === String(assignment.start) &&
    String(item.end) === String(assignment.end)
  )
  if (!duplicate) groups.get(key).push(assignment)
}

export const buildResourceGanttData = ({
  scheduleResult,
  resourceDefinitions = [],
  resourceUsabilities = [],
  resourceOccupancyMap = new Map(),
  cekongResources = []
}) => {
  const groups = new Map()

  resourceDefinitions.forEach((resource, index) => {
    const name = resource.resourceName || `资源 ${index + 1}`
    if (!groups.has(name)) groups.set(name, [])
    const occupancies = resourceOccupancyMap instanceof Map
      ? resourceOccupancyMap.get(resource.key) || []
      : []
    occupancies.forEach((item) => addAssignment(groups, name, {
      taskName: item.taskName || '已占用',
      start: item.startTime,
      end: item.endTime,
      kind: 'scheduled'
    }))

    if (!occupancies.length) {
      const availability = resourceUsabilities.find((item) => item.key === resource.key) || resourceUsabilities[index]
      getValidWindows(availability).forEach((window) => addAssignment(groups, name, {
        taskName: '可用时间窗',
        start: window.start,
        end: window.end,
        kind: 'window'
      }))
    }
  })

  cekongResources.forEach((resource) => {
    const name = resource.cekong_resource_name
    if (!name) return
    if (!groups.has(name)) groups.set(name, [])
    if (!groups.get(name).length) {
      getValidWindows({ visible_time_window: resource.visible_time_window }).forEach((window) => addAssignment(groups, name, {
        taskName: '可见时间窗',
        start: window.start,
        end: window.end,
        kind: 'window'
      }))
    }
  })

  scheduleResult.rows.filter((item) => item.assigned).forEach((item) => {
    item.resources.forEach((resource) => addAssignment(groups, resource, {
      taskName: item.id,
      start: item.startTime,
      end: item.endTime,
      kind: 'scheduled',
      arcId: item.arcId
    }))
  })

  const data = []
  Array.from(groups.entries()).forEach(([resourceName, assignments], groupIndex) => {
    const validAssignments = assignments.filter((item) => durationMinutes(item.start, item.end) > 0)
    if (!validAssignments.length) return
    const starts = validAssignments.map((item) => toDate(item.start)).filter(Boolean)
    const ends = validAssignments.map((item) => toDate(item.end)).filter(Boolean)
    const parentId = `resource-${groupIndex}`
    const parent = toGanttRow({
      id: parentId,
      text: resourceName,
      start: new Date(Math.min(...starts.map(Number))),
      end: new Date(Math.max(...ends.map(Number))),
      kind: 'resource'
    })
    if (parent) {
      parent.type = 'project'
      data.push(parent)
    }

    validAssignments.forEach((assignment, assignmentIndex) => {
      const row = toGanttRow({
        id: `${parentId}-${assignmentIndex}`,
        text: assignment.taskName,
        start: assignment.start,
        end: assignment.end,
        kind: assignment.kind,
        arcId: assignment.arcId,
        parent: parentId
      })
      if (row) data.push(row)
    })
  })

  return { data, links: [] }
}

const markdownCell = (value) => String(value ?? '-').replace(/\|/g, '\\|').replace(/\n/g, ' ')

export const buildReportContent = ({
  config = {},
  taskDefinitions = [],
  resourceDefinitions = [],
  logicalConstraints = [],
  scheduleResult
}) => {
  const packageName = config.packageName || '未命名规划包'
  const timeRange = Array.isArray(config.timeRange) && config.timeRange.length === 2
    ? `${formatDateTime(config.timeRange[0])} 至 ${formatDateTime(config.timeRange[1])}`
    : '未设置'
  const taskRows = scheduleResult.rows
  const resourceNames = Array.from(new Set([
    ...resourceDefinitions.map((item) => item.resourceName || item.key),
    ...taskRows.flatMap((item) => item.resources || [])
  ].filter(Boolean)))
  const conflictRows = taskRows.filter((item) => !item.assigned)
  const table = (headers, rows) => [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(' | ')} |`)
  ].join('\n')

  const scheduleReport = `# ${packageName} 调度报告

计划时间：${timeRange}
结果状态：${scheduleResult.hasOutput ? '已生成' : '尚未运行算法'}

## 调度概览

- 任务总数：${taskDefinitions.length}
- 结果条目：${taskRows.length}
- 已分配：${scheduleResult.assignedCount}
- 未分配：${scheduleResult.unassignedCount}
- 分配率：${scheduleResult.assignmentRate}%
- 使用弧段数：${scheduleResult.totalArcs}
`

  const summaryReport = `# ${packageName} 摘要报告

## 规划包信息

- 规划包名称：${packageName}
- 规划包描述：${config.packageDescription || '未填写'}
- 规划时间：${timeRange}
- 资源数量：${resourceDefinitions.length}
- 任务数量：${taskDefinitions.length}
- 调度涉及资源数量：${resourceNames.length}
- 任务组数量：${logicalConstraints.length}

## 调度统计

${table(['指标', '数量'], [
  ['结果条目', taskRows.length],
  ['已分配', scheduleResult.assignedCount],
  ['未分配', scheduleResult.unassignedCount]
])}
`

  const taskReport = `# ${packageName} 任务报告

${table(['任务', '状态', '开始时间', '结束时间', '资源'], taskRows.map((item) => [
    item.id,
    item.status,
    item.startTimeLabel,
    item.endTimeLabel,
    item.resourceLabel
  ])) || '暂无任务数据。'}
`

  const resourceReport = `# ${packageName} 资源报告

${resourceNames.length ? resourceNames.map((name) => `- 资源：${name}`).join('\n') : '暂无调度资源数据。'}

${table(['资源', '任务数'], resourceNames.map((name) => [
    name,
    taskRows.filter((item) => item.resources?.includes(name)).length
  ]))}
`

  const taskConflictReport = `# ${packageName} 未分配任务报告

${conflictRows.length
    ? table(['任务', '状态', '弧段'], conflictRows.map((item) => [item.id, item.status, item.arcId]))
    : '当前没有未分配任务。'}
`

  const taskGroupReport = `# ${packageName} 任务组报告

${logicalConstraints.length
    ? table(['任务组', '关系', '包含任务'], logicalConstraints.map((item) => [
      item.task_group_name,
      item.task_relationship,
      (item.task_group_includeTaskList || []).map((task) => task.name || task.taskName || task.key).join('、') || '-'
    ]))
    : '当前没有定义任务组。'}
`

  return {
    scheduleReport,
    resourceReport,
    summaryReport,
    taskGroupReport,
    taskConflictReport,
    taskReport
  }
}
