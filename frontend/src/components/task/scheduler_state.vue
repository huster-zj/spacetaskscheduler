<template>
  <div class="form-container">
    <div class="form-head">
      <a-typography-title :level="3">调度情况</a-typography-title>
    </div>

    <a-alert
      v-if="taskNotFound"
      type="warning"
      show-icon
      message="当前任务数据不存在"
      description="请返回任务列表重新打开任务详情。"
    />
    <a-alert
      v-else-if="scheduleResult.parsingStatus === 'empty'"
      type="info"
      show-icon
      message="尚未生成调度结果"
      description="完成预处理并运行算法后，这里会显示当前任务的具体安排。"
    />
    <a-alert
      v-else-if="scheduleResult.parsingStatus === 'error'"
      type="error"
      show-icon
      message="调度结果解析失败"
      :description="scheduleResult.parsingError"
    />
    <a-empty
      v-else-if="!taskScheduleData.length"
      description="当前任务没有匹配到调度结果"
    />
    <template v-else>
      <div class="table-title">任务安排信息</div>
      <a-table
        :columns="taskScheduleColumns"
        :data-source="taskScheduleData"
        :pagination="false"
        :scroll="{ x: 980 }"
        row-key="key"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.assigned ? 'green' : 'orange'">{{ record.status }}</a-tag>
          </template>
        </template>
      </a-table>
    </template>

    <div class="conflict-section">
      <div class="table-title">潜在冲突</div>
      <a-table
        v-if="potentialConflictData.length"
        :columns="potentialConflictColumns"
        :data-source="potentialConflictData"
        :pagination="false"
        :scroll="{ x: 720 }"
        row-key="key"
      />
      <a-empty v-else description="当前任务没有潜在冲突" />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { findScheduleRowsForTask, createScheduleResult } from '@/services/scheduleData'
import { useFormHeadStore as useTaskFormHeadStore } from '@/stores/taskDetailNumStore'
import { useSchedulerStateStore } from '@/stores/taskDetailNumStore'
import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

const taskFormHeadStore = useTaskFormHeadStore()
const schedulerStateStore = useSchedulerStateStore()
const algorithmOutputStore = useAlgorithmOutputStore()
const preprocessOutputStore = usePreprocessOutputStore()
const { formHeadList } = storeToRefs(taskFormHeadStore)
const { schedulerStateMap } = storeToRefs(schedulerStateStore)
const { algorithmOutput } = storeToRefs(algorithmOutputStore)
const { preprocessOutput } = storeToRefs(preprocessOutputStore)

const currentTask = computed(() => {
  if (props.taskKey) {
    return formHeadList.value.find((item) => String(item.key) === String(props.taskKey)) || null
  }
  return formHeadList.value[formHeadList.value.length - 1] || null
})
const taskNotFound = computed(() => Boolean(props.taskKey) && !currentTask.value)

const scheduleResult = computed(() => createScheduleResult({
  outputText: algorithmOutput.value.outputText,
  preprocessOutput: preprocessOutput.value,
  taskDefinitions: formHeadList.value
}))

const matchedRows = computed(() => findScheduleRowsForTask(scheduleResult.value, currentTask.value || {
  key: props.taskKey
}))

const taskScheduleData = computed(() => matchedRows.value.map((row, index) => ({
  key: `${props.taskKey || currentTask.value?.key || 'task'}-${row.key || index}`,
  assigned: row.assigned,
  status: row.assigned ? '已安排' : row.status || '未安排',
  startTime: row.startTimeLabel || '-',
  endTime: row.endTimeLabel || '-',
  duration: row.durationMinutes ? `${row.durationMinutes} 分钟` : '-',
  resource: row.resourceLabel || '-',
  arcId: row.arcId || '-',
  note: row.assigned
    ? (row.target && row.target !== '-' ? `跟踪方案：${row.target}` : '算法已分配')
    : (row.status || '当前任务未安排')
})))

const potentialConflictData = computed(() => {
  if (!props.taskKey) return []
  return schedulerStateMap.value.get(props.taskKey)?.potentialConflictData || []
})

const taskScheduleColumns = [
  { title: '状态', dataIndex: 'status', key: 'status', fixed: 'left' },
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '持续时长', dataIndex: 'duration', key: 'duration' },
  { title: '测控资源', dataIndex: 'resource', key: 'resource' },
  { title: '弧段 / 跟踪方案', dataIndex: 'arcId', key: 'arcId' },
  { title: '备注', dataIndex: 'note', key: 'note' }
]

const potentialConflictColumns = [
  { title: '冲突任务', dataIndex: 'conflictTask', key: 'conflictTask' },
  { title: '冲突资源', dataIndex: 'conflictResource', key: 'conflictResource' },
  { title: '开始时间', dataIndex: 'assignedStart', key: 'assignedStart' },
  { title: '结束时间', dataIndex: 'assignedStop', key: 'assignedStop' }
]
</script>

<style scoped>
.form-container {
  padding: 0 2rem;
  background-color: #f9f9f9;
}

.form-head {
  margin-bottom: 16px;
}

.table-title {
  margin: 18px 0 10px;
  color: var(--sts-ink-primary);
  font-size: 15px;
  font-weight: 600;
}

.conflict-section {
  margin-top: 24px;
}

@media (max-width: 767px) {
  .form-container {
    padding: 0;
  }
}
</style>
