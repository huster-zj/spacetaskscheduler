import { findPreprocessEventsForTask } from '@/services/ParseFile'
import { durationMinutes, formatDateTime } from '@/services/scheduleData'

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

const TIME_WINDOW_FIELDS = [
  ['singlePeriodData', '单次时间段'],
  ['singleDiscreteData', '单次离散时间窗'],
  ['repeatPeriodData', '周期时间段'],
  ['repeatDiscreteData', '周期离散时间窗']
]

const getWindow = (item) => {
  const start = firstDefined(item?.startTime, item?.start_time, item?.start)
  const end = firstDefined(item?.endTime, item?.end_time, item?.end)
  if (!start || !end || durationMinutes(start, end) <= 0) return null
  return { start, end }
}

export const buildTaskTimeWindowRows = (taskProperty = {}) => TIME_WINDOW_FIELDS.flatMap(([field, label]) => {
  const values = Array.isArray(taskProperty[field]) ? taskProperty[field] : []
  return values.flatMap((item, index) => {
    const window = getWindow(item)
    if (!window) return []
    return [{
      key: `${field}-${item?.id ?? index}`,
      type: label,
      startTime: formatDateTime(window.start),
      endTime: formatDateTime(window.end),
      duration: `${durationMinutes(window.start, window.end)} 分钟`,
      preferredStartTime: formatDateTime(firstDefined(item?.preferredStartTime, window.start))
    }]
  })
})

export const getTaskCandidateEvents = (preprocessOutput, task) =>
  findPreprocessEventsForTask(preprocessOutput, task)

export const buildCandidateTimeRows = (events = []) => events.map((event, index) => ({
  key: `${event.task_key || event.task_name}-${event.tracking_plan_id || index}`,
  planId: event.tracking_plan_id || '-',
  startTime: formatDateTime(event.start_time),
  endTime: formatDateTime(event.end_time),
  duration: `${Number(event.duration) > 0
    ? Math.max(1, Math.ceil(Number(event.duration) / 60))
    : durationMinutes(event.start_time, event.end_time)} 分钟`,
  resources: event.resources.join('、') || '-'
}))

export const buildCandidateResourceRows = (events = []) => events.flatMap((event, eventIndex) => {
  const resources = event.resourceDetails.length
    ? event.resourceDetails
    : event.resources.map((id) => ({ id, name: id, station: '' }))
  return resources.map((resource, resourceIndex) => ({
    key: `${event.tracking_plan_id || eventIndex}-${resource.id || resourceIndex}`,
    planId: event.tracking_plan_id || '-',
    resourceId: resource.id || resource.name || '-',
    station: resource.station || '-',
    resourceName: resource.name || resource.id || '-',
    startTime: formatDateTime(event.start_time),
    endTime: formatDateTime(event.end_time),
    duration: `${Number(event.duration) > 0
      ? Math.max(1, Math.ceil(Number(event.duration) / 60))
      : durationMinutes(event.start_time, event.end_time)} 分钟`
  }))
})

export const buildCandidateResourcePlanRows = (events = []) => events.map((event, index) => ({
  key: `${event.task_key || event.task_name}-${event.tracking_plan_id || index}`,
  planId: event.tracking_plan_id || '-',
  resourceCount: event.resources.length,
  resources: event.resources.join('、') || '-',
  startTime: formatDateTime(event.start_time),
  endTime: formatDateTime(event.end_time),
  duration: `${Number(event.duration) > 0
    ? Math.max(1, Math.ceil(Number(event.duration) / 60))
    : durationMinutes(event.start_time, event.end_time)} 分钟`
}))
