<template>
  <div class="container">
    <div class="gantt-control">
      <span class="control-label">时间粒度</span>
      <a-radio-group v-model:value="scale" option-type="button" size="small">
        <a-radio-button value="hour">小时</a-radio-button>
        <a-radio-button value="day">天</a-radio-button>
        <a-radio-button value="week">周</a-radio-button>
      </a-radio-group>
      <span v-if="scheduleResult.hasOutput" class="data-hint">
        {{ scheduleResult.assignedCount }} 项任务已完成资源匹配
      </span>
    </div>
    <div v-if="tasks.data.length" class="left-container">
      <GanttComponent :tasks="tasks" :scale="scale" />
    </div>
    <a-empty v-else description="暂无可展示的资源时间数据" class="gantt-empty">
      <template #image><UnorderedListOutlined /></template>
      <span>导入资源或完成调度后，这里会显示资源占用情况。</span>
    </a-empty>
  </div>
</template>

<script setup>
import { UnorderedListOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

import GanttComponent from '@/components/ResourceGanttComponent.vue'
import { createScheduleResult, buildResourceGanttData } from '@/services/scheduleData'
import {
  useFormHeadStore as useResourceFormHeadStore,
  useOccupancyStore,
  useUsabilityStore
} from '@/stores/resourceDetailNumStore'
import { useFormHeadStore as useTaskFormHeadStore } from '@/stores/taskDetailNumStore'
import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput'
import { useCekongResourceListStore } from '@/stores/useCekongResourceListStore'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

const scale = ref('day')
const resourceFormHeadStore = useResourceFormHeadStore()
const resourceUsabilityStore = useUsabilityStore()
const resourceOccupancyStore = useOccupancyStore()
const taskFormHeadStore = useTaskFormHeadStore()
const cekongResourceStore = useCekongResourceListStore()
const algorithmOutputStore = useAlgorithmOutputStore()
const preprocessOutputStore = usePreprocessOutputStore()
const { formHeadList: resourceDefinitions } = storeToRefs(resourceFormHeadStore)
const { usabilityList } = storeToRefs(resourceUsabilityStore)
const { occupancyMap } = storeToRefs(resourceOccupancyStore)
const { formHeadList: taskDefinitions } = storeToRefs(taskFormHeadStore)
const { cekongResourceList } = storeToRefs(cekongResourceStore)
const { algorithmOutput } = storeToRefs(algorithmOutputStore)
const { preprocessOutput } = storeToRefs(preprocessOutputStore)

const scheduleResult = computed(() => createScheduleResult({
  outputText: algorithmOutput.value.outputText,
  preprocessOutput: preprocessOutput.value,
  taskDefinitions: taskDefinitions.value
}))

const tasks = computed(() => buildResourceGanttData({
  scheduleResult: scheduleResult.value,
  resourceDefinitions: resourceDefinitions.value,
  resourceUsabilities: usabilityList.value,
  resourceOccupancyMap: occupancyMap.value,
  cekongResources: cekongResourceList.value
}))
</script>

<style scoped>
.container {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: inherit;
  flex-direction: column;
}

.left-container {
  position: relative;
  flex: 1;
  min-height: 480px;
  overflow: hidden;
}

.gantt-control {
  display: flex;
  min-height: 54px;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  overflow-x: auto;
  border-bottom: 1px solid var(--sts-border);
  background: var(--sts-surface-subtle);
  white-space: nowrap;
}

.control-label {
  color: var(--sts-ink-secondary);
  font-size: 13px;
}

.data-hint {
  margin-left: auto;
  color: var(--sts-ink-muted);
  font-size: 12px;
}

.gantt-empty {
  display: grid;
  min-height: 480px;
  place-content: center;
  gap: 8px;
  color: var(--sts-ink-muted);
}

.gantt-empty :deep(.anticon) {
  color: var(--sts-primary);
  font-size: 36px;
}

@media (max-width: 767px) {
  .data-hint {
    display: none;
  }
}
</style>
