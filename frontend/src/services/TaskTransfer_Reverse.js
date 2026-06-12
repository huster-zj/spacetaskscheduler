/*
 * @Author: Jerry
 * @Date: 2025-03-27 08:34:41
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-04-24 10:24:20
 * @FilePath: \spacetaskscheduler\src\services\TaskTransfer.js
 */
import { generateKey } from '../stores/keyManager.js'
import {
  useFormHeadStore,
  useBasicInfoStore,
  usePropStore,
  useDurationStore
} from '../stores/taskDetailNumStore'

export default class TaskTransferService {
  transferTask(fileContent) {
    console.log('TaskTransfer.js 接收到的数据:', fileContent)

    const formHeadStore = useFormHeadStore()
    const basicInfoStore = useBasicInfoStore()
    const propStore = usePropStore()
    const durationStore = useDurationStore()
    const { addTaskFormHead } = formHeadStore
    const { addTaskBasicInfo } = basicInfoStore
    const { addTaskProp } = propStore
    const { addTaskDuration } = durationStore

    // 在这里添加数据处理逻辑
    try {
      // 获取所有任务的key列表
      const taskKeys = fileContent.taskFormHeadList.map((task) => task.key)
      console.log('taskKeys:', taskKeys)

      // 遍历每个任务的key
      taskKeys.forEach((key) => {
        generateKey()

        // 根据key找到对应的各部分数据
        const formHead = fileContent.taskFormHeadList.find((item) => item.key === key)
        const basicInfo = fileContent.taskBasicInfoList.find((item) => item.key === key)
        const prop = fileContent.taskPropList.find((item) => item.key === key)
        const duration = fileContent.taskDurationList.find((item) => item.key === key)

        // 拼装完整的任务数据
        const newTask = {
          // formHead部分
          key: key,
          taskName: formHead?.taskName || '',
          taskNotes: formHead?.taskNotes || '',
          state: formHead?.state || 1,
          priority: formHead?.priority || 1,
          isExclusiveTask: formHead?.isExclusiveTask || false,

          // basicInfo部分
          schedulePreference: basicInfo?.schedulePreference || '',
          timePointPreference: basicInfo?.timePointPreference || '',
          startTimePreference: basicInfo?.startTimePreference || '',
          keyPointConstraint: formHead?.keyPointConstraint || [],

          // prop部分
          availability: prop?.availability || 1,
          timeWindowType: prop?.timeWindowType || 1,
          selectedTimeOption: prop?.selectedTimeOption || 1,
          selectedTimeOption2: prop?.selectedTimeOption2 || 1,
          selectedTimeOption3: prop?.selectedTimeOption3 || 1,
          selectedTimeOption4: prop?.selectedTimeOption4 || 1,
          minIntervalTime1: prop?.minIntervalTime1 || null,
          maxIntervalTime1: prop?.maxIntervalTime1 || null,
          minIntervalTime2: prop?.minIntervalTime2 || null,
          maxIntervalTime2: prop?.maxIntervalTime2 || null,
          singlePeriodData: prop?.singlePeriodData || [],
          singleDiscreteData: prop?.singleDiscreteData || [],
          repeatPeriodData: prop?.repeatPeriodData || [],
          repeatDiscreteData: prop?.repeatDiscreteData || [],

          // duration部分
          durationType: duration?.durationType || 1,
          fixedDuration: duration?.fixedDuration || null,
          minTotalDuration: duration?.minTotalDuration || null,
          needsRestrict: duration?.needsRestrict || false,
          needsFullWindow: duration?.needsFullWindow || false,
          allowsSegmentedCompletion: duration?.allowsSegmentedCompletion || false,
          allowsResourceChange: duration?.allowsResourceChange || false,
          segmentMinDuration: duration?.segmentMinDuration || null,
          maxOverlapDuration: duration?.maxOverlapDuration || null,
          exactOverlapDuration: duration?.exactOverlapDuration || null,
          overlapType: duration?.overlapType || 1
        }

        console.log('newTask:', newTask)

        addTaskFormHead(newTask)
        addTaskBasicInfo(newTask)
        addTaskProp(newTask)
        addTaskDuration(newTask)
      })

      return {
        success: true,
        message: '任务转移成功'
      }
    } catch (error) {
      console.error('任务导入失败:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }
}
