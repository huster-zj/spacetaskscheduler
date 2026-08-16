import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null)

export const normalizeResources = (value) => {
  if (!value) return []
  if (typeof value === 'string') {
    return value
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') return item
      return firstDefined(
        item?.cekong_resource_id,
        item?.resource_id,
        item?.resourceName,
        item?.name
      )
    })
    .filter(Boolean)
    .map(String)
}

export const normalizeResourceDetails = (value) => {
  if (!value) return []
  const source = Array.isArray(value) ? value : [value]

  return source.map((item) => {
    if (typeof item === 'string') {
      return {
        id: item,
        station: '',
        name: item
      }
    }

    return {
      id: String(firstDefined(
        item?.cekong_resource_id,
        item?.resource_id,
        item?.id,
        item?.resourceName,
        item?.name,
        ''
      )),
      station: String(firstDefined(
        item?.cekong_station,
        item?.station,
        item?.stationName,
        ''
      )),
      name: String(firstDefined(
        item?.resourceName,
        item?.resource_name,
        item?.name,
        item?.cekong_resource_id,
        item?.resource_id,
        item?.id,
        ''
      ))
    }
  }).filter((item) => item.id || item.name || item.station)
}

export const normalizePreprocessEvents = (input) => {
  const source = Array.isArray(input)
    ? input
    : [input?.continuousEvents || [], input?.discreteEvents || []].flat()

  return source.filter(Boolean).map((item, index) => ({
    key: String(firstDefined(item.key, item.tracking_plan_id, `arc-${index + 1}`)),
    task_key: String(firstDefined(item.task_key, item.taskKey, '')),
    task_name: String(firstDefined(item.task_name, item.taskName, item.id, '')),
    tracking_plan_id: String(firstDefined(item.tracking_plan_id, item.trackingPlanId, '')),
    start_time: firstDefined(item.start_time, item.startTime, ''),
    end_time: firstDefined(item.end_time, item.endTime, ''),
    duration: firstDefined(item.duration, ''),
    task_to_craft: String(firstDefined(item.task_to_craft, item.taskToCraft, '')),
    resources: normalizeResources(firstDefined(item.cekong_resource, item.resources, item.resource)),
    resourceDetails: normalizeResourceDetails(firstDefined(
      item.cekong_resource,
      item.resources,
      item.resource
    )),
    raw: item
  }))
}

export const findPreprocessEventsForTask = (input, task = {}) => {
  const events = normalizePreprocessEvents(input)
  const taskKey = String(task.key || '').trim()
  const taskName = String(task.taskName || task.name || '').trim()
  if (!taskKey && !taskName) return []

  const keyedEvents = taskKey
    ? events.filter((event) => event.task_key && event.task_key === taskKey)
    : []
  if (keyedEvents.length) return keyedEvents

  return events.filter((event) => {
    if (event.task_key) return false
    return taskName && event.task_name === taskName
  })
}

export async function parsePreprocessFiles() {
  const store = usePreprocessOutputStore()
  return normalizePreprocessEvents(store.preprocessOutput)
}

export async function parseOutputFile() {
  const store = useAlgorithmOutputStore()
  return parseOutputContent(store.algorithmOutput.outputText)
}

export function parseOutputContent(content = '') {
  const text = String(content || '').replace(/\r\n?/g, '\n')
  const totalArcsMatch = text.match(/使用的弧段总数\s*[：:]\s*(\d+)/)
  const totalArcs = totalArcsMatch ? Number(totalArcsMatch[1]) : 0
  const data = []
  let hasExpectedHeader = false

  text.split('\n').forEach((line, lineIndex) => {
    if (!line.includes('|')) return
    const parts = line.split('|').map((part) => part.trim())
    if (parts.length < 5 || !parts[0]) return

    const normalizedHeader = parts.slice(0, 5).join('').toLowerCase()
    if (
      normalizedHeader.includes('飞控事件') ||
      normalizedHeader.includes('开始时间') ||
      normalizedHeader.includes('status')
    ) {
      hasExpectedHeader = true
      return
    }

    data.push({
      key: `${parts[0]}-${lineIndex}`,
      id: parts[0],
      status: parts[1],
      startTime: parts[2],
      endTime: parts[3],
      arcId: parts[4]
    })
  })

  const hasContent = Boolean(text.trim())
  const parsingStatus = !hasContent
    ? 'empty'
    : data.length || hasExpectedHeader || totalArcsMatch
      ? 'success'
      : 'error'

  return {
    data,
    totalArcs: totalArcs || data.filter((item) => isAssignedStatus(item.status)).length,
    hasContent,
    parsingStatus,
    parsingError: parsingStatus === 'error'
      ? '算法输出内容存在，但未识别到调度结果表格。'
      : ''
  }
}

export function isAssignedStatus(status) {
  const value = String(status || '').trim().toLowerCase()
  return ['是', '已分配', '成功', 'true', 'yes', '1', 'assigned'].includes(value)
}
