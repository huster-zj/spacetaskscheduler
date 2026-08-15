<template>
  <div class="calendar-container">
    <section class="calendar-summary" aria-label="调度概览">
      <div class="summary-item">
        <span>结果条目</span>
        <strong>{{ scheduleResult.rows.length }}</strong>
      </div>
      <div class="summary-item summary-item--success">
        <span>已分配</span>
        <strong>{{ scheduleResult.assignedCount }}</strong>
      </div>
      <div class="summary-item summary-item--warning">
        <span>未分配</span>
        <strong>{{ scheduleResult.unassignedCount }}</strong>
      </div>
      <div class="summary-item">
        <span>预处理弧段</span>
        <strong>{{ preprocessData.length }}</strong>
      </div>
    </section>

    <section class="calendar-section">
      <header class="section-header">
        <div>
          <h2>调度结果</h2>
          <p>算法输出中的任务分配与时间安排。</p>
        </div>
      </header>
      <a-table
        v-if="scheduleResult.rows.length"
        :columns="outputColumns"
        :data-source="scheduleResult.rows"
        :scroll="{ x: 940 }"
        row-key="key"
        :pagination="{ pageSize: 8, hideOnSinglePage: true }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.assigned ? 'green' : 'orange'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'resourceLabel'">
            {{ record.resourceLabel }}
          </template>
        </template>
      </a-table>
      <a-empty v-if="!scheduleResult.rows.length" description="暂无调度结果" />
    </section>

    <section class="calendar-section">
      <header class="section-header">
        <div>
          <h2>预处理弧段</h2>
          <p>任务时间窗与可用测控资源候选。</p>
        </div>
      </header>
      <a-table
        v-if="preprocessData.length"
        :columns="preprocessColumns"
        :data-source="preprocessData"
        :scroll="{ x: 980 }"
        row-key="key"
        :pagination="{ pageSize: 8, hideOnSinglePage: true }"
      />
      <a-empty v-if="!preprocessData.length" description="暂无预处理弧段" />
    </section>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { normalizePreprocessEvents } from '@/services/ParseFile'
import { createScheduleResult, formatDateTime } from '@/services/scheduleData'
import { useFormHeadStore as useTaskFormHeadStore } from '@/stores/taskDetailNumStore'
import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

defineOptions({ name: 'ScheduleCalendarView' })

const taskFormHeadStore = useTaskFormHeadStore()
const algorithmOutputStore = useAlgorithmOutputStore()
const preprocessOutputStore = usePreprocessOutputStore()
const { formHeadList } = storeToRefs(taskFormHeadStore)
const { algorithmOutput } = storeToRefs(algorithmOutputStore)
const { preprocessOutput } = storeToRefs(preprocessOutputStore)

const scheduleResult = computed(() => createScheduleResult({
  outputText: algorithmOutput.value.outputText,
  preprocessOutput: preprocessOutput.value,
  taskDefinitions: formHeadList.value
}))

const preprocessData = computed(() => normalizePreprocessEvents(preprocessOutput.value).map((item) => ({
  ...item,
  start_time: formatDateTime(item.start_time),
  end_time: formatDateTime(item.end_time),
  resources: item.resources.join('、') || '-'
})))

const outputColumns = [
  { title: '飞控事件 ID', dataIndex: 'id', key: 'id' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '开始时间', dataIndex: 'startTimeLabel', key: 'startTimeLabel' },
  { title: '结束时间', dataIndex: 'endTimeLabel', key: 'endTimeLabel' },
  { title: '弧段 ID', dataIndex: 'arcId', key: 'arcId' },
  { title: '测控资源', dataIndex: 'resourceLabel', key: 'resourceLabel' }
]

const preprocessColumns = [
  { title: '飞控事件 ID', dataIndex: 'task_name', key: 'task_name' },
  { title: '跟踪计划 ID', dataIndex: 'tracking_plan_id', key: 'tracking_plan_id' },
  { title: '开始时间', dataIndex: 'start_time', key: 'start_time' },
  { title: '结束时间', dataIndex: 'end_time', key: 'end_time' },
  { title: '持续时间', dataIndex: 'duration', key: 'duration' },
  { title: '目标航天器', dataIndex: 'task_to_craft', key: 'task_to_craft' },
  { title: '测控资源', dataIndex: 'resources', key: 'resources' }
]
</script>

<style scoped>
.calendar-container {
  display: grid;
  gap: 20px;
  padding: 20px;
  overflow: auto;
}

.calendar-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 12px;
}

.summary-item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-left: 3px solid var(--sts-primary);
  background: var(--sts-surface-subtle);
}

.summary-item span {
  color: var(--sts-ink-secondary);
  font-size: 13px;
}

.summary-item strong {
  color: var(--sts-ink-primary);
  font-size: 22px;
}

.summary-item--success {
  border-left-color: var(--sts-success);
}

.summary-item--warning {
  border-left-color: var(--sts-warning);
}

.calendar-section {
  display: grid;
  gap: 12px;
}

.section-header h2 {
  margin: 0;
  color: var(--sts-ink-primary);
  font-size: 17px;
}

.section-header p {
  margin: 4px 0 0;
  color: var(--sts-ink-secondary);
  font-size: 13px;
}

@media (max-width: 767px) {
  .calendar-container {
    padding: 12px;
  }

  .calendar-summary {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}
</style>
