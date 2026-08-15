<template>
  <div ref="ganttContainer" class="gantt-container"></div>
</template>

<script setup>
import { gantt } from 'dhtmlx-gantt'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'

const props = defineProps({
  tasks: {
    type: Object,
    default: () => ({ data: [], links: [] })
  },
  scale: {
    type: String,
    default: 'day'
  },
  resourceMode: {
    type: Boolean,
    default: false
  }
})

const ganttContainer = ref(null)
let readyEventId

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const configureGantt = () => {
  gantt.config.date_format = '%Y-%m-%d %H:%i'
  gantt.config.duration_unit = 'minute'
  gantt.config.duration_step = 1
  gantt.config.readonly = true
  gantt.config.drag_move = false
  gantt.config.drag_resize = false
  gantt.config.drag_progress = false
  gantt.config.show_progress = false
  gantt.config.autosize = false
  gantt.config.row_height = 42
  gantt.config.scale_height = 56
  gantt.config.columns = [
    {
      name: 'text',
      label: props.resourceMode ? '资源 / 占用' : '任务',
      width: 220,
      tree: true
    },
    { name: 'start_date', label: '开始时间', align: 'center', width: 148 },
    { name: 'duration', label: '分钟', align: 'center', width: 64 }
  ]

  if (props.scale === 'hour') {
    gantt.config.scales = [
      { unit: 'day', step: 1, format: '%m月%d日' },
      { unit: 'hour', step: 1, format: '%H:%i' }
    ]
  } else if (props.scale === 'week') {
    gantt.config.scales = [
      { unit: 'month', step: 1, format: '%Y年%m月' },
      { unit: 'week', step: 1, format: '第%W周' }
    ]
  } else {
    gantt.config.scales = [
      { unit: 'month', step: 1, format: '%Y年%m月' },
      { unit: 'day', step: 1, format: '%d日' }
    ]
  }

  gantt.plugins({ tooltip: true })
  gantt.templates.task_class = (_start, _end, task) => `gantt-task--${task.kind || 'window'}`
  gantt.templates.tooltip_text = (_start, _end, task) => {
    const details = [
      `<b>${escapeHtml(task.text)}</b>`,
      `开始：${escapeHtml(task.startLabel || task.start_date || '-')}`,
      `结束：${escapeHtml(task.endLabel || task.end_date || '-')}`,
      `类型：${escapeHtml(task.kind || '-')}`
    ]
    if (task.resource) details.push(`资源：${escapeHtml(task.resource)}`)
    if (task.arcId) details.push(`弧段：${escapeHtml(task.arcId)}`)
    return details.join('<br/>')
  }
}

const renderTasks = () => {
  if (!ganttContainer.value) return
  gantt.clearAll()
  gantt.parse({ data: props.tasks?.data || [], links: props.tasks?.links || [] })
  gantt.setSizes()
}

const render = () => {
  configureGantt()
  renderTasks()
}

watch(() => props.tasks, renderTasks, { deep: true })
watch(() => props.scale, render)

onMounted(() => {
  configureGantt()
  readyEventId = gantt.attachEvent('onGanttReady', () => {
    gantt.ext.tooltips.tooltip.setViewport(gantt.$task_data)
  })
  gantt.init(ganttContainer.value)
  renderTasks()
})

onBeforeUnmount(() => {
  if (readyEventId) gantt.detachEvent(readyEventId)
  gantt.clearAll()
})
</script>

<style>
.gantt-container {
  width: 100%;
  height: 100%;
  min-height: 480px;
}

.gantt-container .gantt_task_line {
  border: 0;
  border-radius: 3px;
}

.gantt-container .gantt_task_line.gantt-task--scheduled {
  background: #2e7d68;
}

.gantt-container .gantt_task_line.gantt-task--unassigned {
  background: #b06a54;
}

.gantt-container .gantt_task_line.gantt-task--window {
  background: #6b8cae;
}

.gantt-container .gantt_task_line.gantt-task--resource {
  background: #176b87;
}

.gantt-container .gantt_task_line.gantt-task--resource .gantt_task_progress {
  background: #176b87;
}
</style>
