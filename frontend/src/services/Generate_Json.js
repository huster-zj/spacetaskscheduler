/*
 * @Author: Jerry
 * @Date: 2025-05-14 11:58:48
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-05-20 12:38:22
 * @FilePath: \spacetaskscheduler\src\services\Generate_Json.js
 */
import {
  useFormHeadStore as resource_useFormHeadStore,
  useBasicInfoStore as resource_useBasicInfoStore,
  useUsabilityStore as resource_useUsabilityStore,
  useThreePartsStore as resource_useThreePartsStore,
  useOccupancyStore as resource_useOccupancyStore
} from '@/stores/resourceDetailNumStore'

import {
  useFormHeadStore as task_useFormHeadStore,
  useBasicInfoStore as task_useBasicInfoStore,
  usePropStore as task_usePropStore,
  useDurationStore as task_useDurationStore,
  useSchedulerStateStore as task_useSchedulerStateStore
} from '@/stores/taskDetailNumStore'

class GenerateJsonService {
  /**
   * 生成资源JSON数据
   * @returns {Object} 资源数据对象
   */
  generateResourceJson() {
    try {
      // 初始化所有资源相关的store
      const formHeadStore = resource_useFormHeadStore()
      const basicInfoStore = resource_useBasicInfoStore()
      const usabilityStore = resource_useUsabilityStore()
      const threePartsStore = resource_useThreePartsStore()
      const occupancyStore = resource_useOccupancyStore()

      // 构建资源数据对象
      const resourceData = {
        resourceFormHeadList: formHeadStore.formHeadList,
        resourceBasicInfoList: basicInfoStore.basicInfoList,
        resourceUsabilityList: usabilityStore.usabilityList,
        resourceThreePartsList: threePartsStore.threePartsList,
        resourceOccupancyMap: Array.from(occupancyStore.occupancyMap.entries())
      }

      console.log('生成的资源JSON数据:', resourceData)

      const resourceDataJson = JSON.stringify(resourceData, null, 2)

      return resourceDataJson
    } catch (error) {
      console.error('生成资源JSON数据失败:', error)
      throw new Error('生成资源JSON数据失败')
    }
  }

  /**
   * 预处理任务数据
   * @param {Object} originalData 原始任务数据
   * @returns {Object} 处理后的任务数据
   */
  preprocessTaskData(originalData) {
    try {
      const processedData = JSON.parse(JSON.stringify(originalData)); // 深拷贝
      
      // 创建任务名称映射
      const taskNameMap = {};
      originalData.taskFormHeadList.forEach(task => {
        taskNameMap[task.key] = task.taskName;
      });

      // 将keyPointConstraint移动到taskFormHeadList
      const keyPointConstraints = {};
      originalData.taskBasicInfoList.forEach(task => {
        if (task.keyPointConstraint && task.keyPointConstraint.length > 0) {
          keyPointConstraints[task.key] = task.keyPointConstraint;
        }
      });

      // 更新taskFormHeadList
      processedData.taskFormHeadList = processedData.taskFormHeadList.map(task => ({
        ...task,
        key: task.taskName,
        keyPointConstraint: keyPointConstraints[task.key] || []
      }));

      // 更新其他列表中的key
      ['taskBasicInfoList', 'taskPropList', 'taskDurationList'].forEach(listName => {
        processedData[listName] = processedData[listName].map(item => ({
          ...item,
          key: taskNameMap[item.key]
        }));
      });

      // 从taskBasicInfoList中移除keyPointConstraint
      processedData.taskBasicInfoList = processedData.taskBasicInfoList.map(({ keyPointConstraint, ...rest }) => rest);

      return {
        original: originalData,
        processed: processedData
      };
    } catch (error) {
      console.error('预处理任务数据失败:', error);
      throw new Error('预处理任务数据失败');
    }
  }

  /**
   * 生成任务JSON数据
   * @returns {Object} 任务数据对象
   */
  generateTaskJson() {
    try {
      // 初始化所有任务相关的store
      const formHeadStore = task_useFormHeadStore()
      const basicInfoStore = task_useBasicInfoStore()
      const propStore = task_usePropStore()
      const durationStore = task_useDurationStore()
      const schedulerStateStore = task_useSchedulerStateStore()

      // 构建任务数据对象
      const originalTaskData = {
        taskFormHeadList: formHeadStore.formHeadList,
        taskBasicInfoList: basicInfoStore.basicInfoList,
        taskPropList: propStore.propList,
        taskDurationList: durationStore.durationList,
        taskSchedulerStateMap: Array.from(schedulerStateStore.schedulerStateMap.entries())
      }

      // 预处理数据
      const { original, processed } = this.preprocessTaskData(originalTaskData);

      console.log('生成的任务JSON数据:', original);
      console.log('处理后的任务JSON数据:', processed);
      
      return {
        taskDataStr: JSON.stringify(original, null, 2),
        taskDataStr2: JSON.stringify(processed, null, 2)
      };

    } catch (error) {
      console.error('生成任务JSON数据失败:', error)
      throw new Error('生成任务JSON数据失败')
    }
  }

  /**
   * 检查数据有效性
   * @param {Object} data 
   * @returns {boolean}
   */
  validateData(data) {
    return data && 
           Array.isArray(data.formHeadList) && 
           data.formHeadList.length > 0
  }
}

export default new GenerateJsonService()