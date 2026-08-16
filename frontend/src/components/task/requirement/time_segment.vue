<template>
  <a-collapse accordion>
    <a-collapse-panel key="1" header="时段">
      <a-alert
        v-if="taskNotFound"
        type="warning"
        show-icon
        message="当前任务数据不存在"
        description="请返回任务列表重新打开任务详情。"
      />
      <a-alert
        v-else-if="calculationState.status === 'idle'"
        type="info"
        show-icon
        message="尚未计算可行时间窗"
        description="完成资源需求表达式后，点击“计算可行时间窗”查看备选测控弧段。"
      />
      <a-alert
        v-else-if="calculationState.status === 'stale'"
        type="warning"
        show-icon
        message="当前备选弧段可能已过期"
        :description="calculationState.message || '任务配置已变更，请重新计算可行时间窗。'"
      />
      <a-alert
        v-else-if="calculationState.status === 'error'"
        type="error"
        show-icon
        message="可行时间窗计算失败"
        :description="calculationState.message || '请检查输入后重试。'"
      />
      <a-alert
        v-else-if="calculationState.status === 'empty' && !candidateTimeRows.length"
        type="warning"
        show-icon
        message="未找到可行时间窗"
        :description="calculationState.message || '请检查任务时段和资源需求表达式。'"
      />

      <a-collapse accordion>
        <a-collapse-panel key="1-1" :header="`时段_任务 (${taskTimeData.length})`">
          <a-table
            :columns="taskTimeColumns"
            :data-source="taskTimeData"
            :pagination="false"
            :scroll="{ x: 820 }"
            row-key="key"
          />
          <a-empty v-if="!taskTimeData.length" description="当前任务未配置时段" />
        </a-collapse-panel>
        <a-collapse-panel
          key="1-2"
          :header="`时段_可能性 (${possibilityData.length}, ${possibilityTimeWindowData.length})`"
        >
          <a-row :gutter="16">
            <a-col :xs="24" :lg="10">
              <div class="table-label">备选方案</div>
              <a-table
                :columns="possibilityColumns"
                :data-source="possibilityData"
                :pagination="false"
                :scroll="{ x: 440 }"
                row-key="key"
              />
              <a-empty v-if="!possibilityData.length" description="暂无备选方案" />
            </a-col>
            <a-col :xs="24" :lg="14">
              <div class="table-label">方案时间窗</div>
              <a-table
                :columns="possibilityTimeWindowColumns"
                :data-source="possibilityTimeWindowData"
                :pagination="false"
                :scroll="{ x: 560 }"
                row-key="key"
              />
              <a-empty v-if="!possibilityTimeWindowData.length" description="暂无备选时间窗" />
            </a-col>
          </a-row>
        </a-collapse-panel>
      </a-collapse>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import {
  buildCandidateTimeRows,
  buildTaskTimeWindowRows,
  getTaskCandidateEvents
} from '@/services/preprocessData'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'
import { useFormHeadStore as useTaskFormHeadStore, usePropStore } from '@/stores/taskDetailNumStore'

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

const taskFormHeadStore = useTaskFormHeadStore()
const taskPropStore = usePropStore()
const preprocessStore = usePreprocessOutputStore()
const { formHeadList } = storeToRefs(taskFormHeadStore)
const { propList } = storeToRefs(taskPropStore)
const { preprocessOutput } = storeToRefs(preprocessStore)

const currentTask = computed(() => {
  if (props.taskKey) {
    return formHeadList.value.find((item) => String(item.key) === String(props.taskKey)) || null
  }
  return formHeadList.value[formHeadList.value.length - 1] || null
})

const taskNotFound = computed(() => Boolean(props.taskKey) && !currentTask.value)
const currentTaskProperty = computed(() => {
  if (!currentTask.value) return null
  return propList.value.find((item) => String(item.key) === String(currentTask.value.key)) || null
})

const calculationState = computed(() => preprocessStore.getTaskState(
  currentTask.value?.key,
  currentTask.value?.taskName
))
const candidateEvents = computed(() => getTaskCandidateEvents(
  preprocessOutput.value,
  currentTask.value || { key: props.taskKey }
))
const taskTimeData = computed(() => buildTaskTimeWindowRows(currentTaskProperty.value || {}))
const candidateTimeRows = computed(() => buildCandidateTimeRows(candidateEvents.value))
const possibilityData = computed(() => candidateTimeRows.value.map((row) => ({
  ...row,
  resource: row.resources
})))
const possibilityTimeWindowData = computed(() => candidateTimeRows.value.map((row) => ({
  ...row,
  index: row.planId
})))

const taskTimeColumns = [
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '持续时长', dataIndex: 'duration', key: 'duration' },
  { title: '偏好开始时间', dataIndex: 'preferredStartTime', key: 'preferredStartTime' }
]

const possibilityColumns = [
  { title: '跟踪方案', dataIndex: 'planId', key: 'planId' },
  { title: '测控资源', dataIndex: 'resource', key: 'resource' }
]

const possibilityTimeWindowColumns = [
  { title: '跟踪方案', dataIndex: 'index', key: 'index' },
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '持续时长', dataIndex: 'duration', key: 'duration' }
]
</script>

<style scoped>
.table-label {
  margin: 0 0 8px;
  color: var(--sts-ink-primary);
  font-size: 14px;
  font-weight: 600;
}

:deep(.ant-table-wrapper) {
  max-width: 100%;
  overflow: hidden;
}

@media (max-width: 767px) {
  :deep(.ant-table) {
    font-size: 13px;
  }
}
</style>
