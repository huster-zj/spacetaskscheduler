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
        已分配 {{ scheduleResult.assignedCount }} / {{ scheduleResult.rows.length }} 项
      </span>
    </div>
    <div v-if="tasks.data.length" class="left-container">
      <GanttComponent :tasks="tasks" :scale="scale" />
    </div>
    <a-empty v-else description="暂无可展示的任务时间数据" class="gantt-empty">
      <template #image><BarsOutlined /></template>
      <span>配置任务时间窗或运行调度后，这里会显示任务计划。</span>
    </a-empty>
  </div>
</template>

<script setup>
import { BarsOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

import GanttComponent from '@/components/TaskGanttComponent.vue'
import { createScheduleResult, buildTaskGanttData } from '@/services/scheduleData'
import { useBasicInfoStore as useTaskBasicInfoStore, useFormHeadStore as useTaskFormHeadStore, usePropStore as useTaskPropStore, useSchedulerStateStore } from '@/stores/taskDetailNumStore'
import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

const scale = ref('day')
const taskFormHeadStore = useTaskFormHeadStore()
const taskBasicInfoStore = useTaskBasicInfoStore()
const taskPropStore = useTaskPropStore()
const schedulerStateStore = useSchedulerStateStore()
const algorithmOutputStore = useAlgorithmOutputStore()
const preprocessOutputStore = usePreprocessOutputStore()
const { formHeadList } = storeToRefs(taskFormHeadStore)
const { basicInfoList } = storeToRefs(taskBasicInfoStore)
const { propList } = storeToRefs(taskPropStore)
const { schedulerStateMap } = storeToRefs(schedulerStateStore)
const { algorithmOutput } = storeToRefs(algorithmOutputStore)
const { preprocessOutput } = storeToRefs(preprocessOutputStore)

const scheduleResult = computed(() => createScheduleResult({
  outputText: algorithmOutput.value.outputText,
  preprocessOutput: preprocessOutput.value,
  taskDefinitions: formHeadList.value
}))

const tasks = computed(() => buildTaskGanttData({
  scheduleResult: scheduleResult.value,
  taskDefinitions: formHeadList.value,
  taskProperties: propList.value.length ? propList.value : basicInfoList.value,
  schedulerStateMap: schedulerStateMap.value
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
