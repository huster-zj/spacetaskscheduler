<template>
  <a-collapse accordion>
    <a-collapse-panel key="1" header="资源占用">
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
        message="尚未生成资源占用候选"
        description="计算可行时间窗后，这里会显示备选方案的预计测控资源占用。"
      />
      <a-alert
        v-else-if="calculationState.status === 'stale'"
        type="warning"
        show-icon
        message="资源占用候选可能已过期"
        :description="calculationState.message || '任务配置已变更，请重新计算可行时间窗。'"
      />
      <a-alert
        v-else-if="calculationState.status === 'error'"
        type="error"
        show-icon
        message="资源占用候选计算失败"
        :description="calculationState.message || '请检查输入后重试。'"
      />
      <a-alert
        v-else-if="calculationState.status === 'empty' && !resourceOccupationTaskData.length"
        type="warning"
        show-icon
        message="未找到可行资源占用"
        :description="calculationState.message || '请检查任务时段和资源需求表达式。'"
      />

      <a-collapse accordion>
        <a-collapse-panel key="1-1" :header="`资源占用_任务 (${resourceOccupationTaskData.length})`">
          <a-table
            :data-source="resourceOccupationTaskData"
            :columns="resourceOccupationTaskColumns"
            :pagination="false"
            :scroll="{ x: 980 }"
            row-key="key"
          />
          <a-empty v-if="!resourceOccupationTaskData.length" description="暂无备选资源占用" />
        </a-collapse-panel>
        <a-collapse-panel
          key="1-2"
          :header="`资源占用_可能性 (${possibilityData.length})`"
        >
          <a-table
            :columns="possibilityColumns"
            :data-source="possibilityData"
            :pagination="false"
            :scroll="{ x: 920 }"
            row-key="key"
          />
          <a-empty v-if="!possibilityData.length" description="暂无资源占用方案" />
        </a-collapse-panel>
      </a-collapse>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import {
  buildCandidateResourcePlanRows,
  buildCandidateResourceRows,
  getTaskCandidateEvents
} from '@/services/preprocessData'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'
import { useFormHeadStore as useTaskFormHeadStore } from '@/stores/taskDetailNumStore'

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

const taskFormHeadStore = useTaskFormHeadStore()
const preprocessStore = usePreprocessOutputStore()
const { formHeadList } = storeToRefs(taskFormHeadStore)
const { preprocessOutput } = storeToRefs(preprocessStore)

const currentTask = computed(() => {
  if (props.taskKey) {
    return formHeadList.value.find((item) => String(item.key) === String(props.taskKey)) || null
  }
  return formHeadList.value[formHeadList.value.length - 1] || null
})
const taskNotFound = computed(() => Boolean(props.taskKey) && !currentTask.value)
const calculationState = computed(() => preprocessStore.getTaskState(
  currentTask.value?.key,
  currentTask.value?.taskName
))
const candidateEvents = computed(() => getTaskCandidateEvents(
  preprocessOutput.value,
  currentTask.value || { key: props.taskKey }
))
const resourceOccupationTaskData = computed(() => buildCandidateResourceRows(candidateEvents.value))
const possibilityData = computed(() => buildCandidateResourcePlanRows(candidateEvents.value))

const resourceOccupationTaskColumns = [
  { title: '资源 ID', dataIndex: 'resourceId', key: 'resourceId' },
  { title: '资源名称', dataIndex: 'resourceName', key: 'resourceName' },
  { title: '测控站', dataIndex: 'station', key: 'station' },
  { title: '跟踪方案', dataIndex: 'planId', key: 'planId' },
  { title: '占用开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '占用结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '占用时长', dataIndex: 'duration', key: 'duration' }
]

const possibilityColumns = [
  { title: '跟踪方案', dataIndex: 'planId', key: 'planId' },
  { title: '资源数', dataIndex: 'resourceCount', key: 'resourceCount' },
  { title: '资源列表', dataIndex: 'resources', key: 'resources' },
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '持续时长', dataIndex: 'duration', key: 'duration' }
]
</script>

<style scoped>
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
