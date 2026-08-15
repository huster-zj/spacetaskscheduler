import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { buildReportContent, createScheduleResult } from '@/services/scheduleData'
import { useFormHeadStore as useResourceFormHeadStore } from '@/stores/resourceDetailNumStore'
import { useFormHeadStore as useTaskFormHeadStore } from '@/stores/taskDetailNumStore'
import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput'
import { useConfigStore } from '@/stores/useConfigStore'
import { useLogicalConstraintsListStore } from '@/stores/useLogicalConstraintsListStore'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

export const useDynamicReports = () => {
  const configStore = useConfigStore()
  const taskFormHeadStore = useTaskFormHeadStore()
  const resourceFormHeadStore = useResourceFormHeadStore()
  const logicalConstraintStore = useLogicalConstraintsListStore()
  const algorithmOutputStore = useAlgorithmOutputStore()
  const preprocessOutputStore = usePreprocessOutputStore()
  const { basicConfig } = storeToRefs(configStore)
  const { formHeadList: taskDefinitions } = storeToRefs(taskFormHeadStore)
  const { formHeadList: resourceDefinitions } = storeToRefs(resourceFormHeadStore)
  const { logicalConstraintsList } = storeToRefs(logicalConstraintStore)
  const { algorithmOutput } = storeToRefs(algorithmOutputStore)
  const { preprocessOutput } = storeToRefs(preprocessOutputStore)

  const scheduleResult = computed(() => createScheduleResult({
    outputText: algorithmOutput.value.outputText,
    preprocessOutput: preprocessOutput.value,
    taskDefinitions: taskDefinitions.value
  }))

  const reports = computed(() => buildReportContent({
    config: basicConfig.value,
    taskDefinitions: taskDefinitions.value,
    resourceDefinitions: resourceDefinitions.value,
    logicalConstraints: logicalConstraintsList.value,
    scheduleResult: scheduleResult.value
  }))

  return {
    scheduleResult,
    reports,
    taskDefinitions,
    resourceDefinitions,
    logicalConstraintsList
  }
}
