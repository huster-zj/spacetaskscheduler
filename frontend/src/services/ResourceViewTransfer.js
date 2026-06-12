import { useFormHeadStore, useUsabilityStore } from '../stores/resourceDetailNumStore'
import { useResourceViewStore } from '../stores/resourceView'

export default class ResourceViewTransfer {
  formatDate(dateTimeStr) {
    if (!dateTimeStr) return ''
    try {
      // 将 "2024-03-11 14:30:00" 转换为 "2024-03-11"
      return dateTimeStr.split(' ')[0]
    } catch (error) {
      console.error('时间格式转换失败:', error)
      return dateTimeStr
    }
  }

  transferToResourceView() {
    try {
      const formHeadStore = useFormHeadStore()
      const usabilityStore = useUsabilityStore()
      const resourceViewStore = useResourceViewStore()

      // 获取所有资源名称和可用时间窗口数据
      const formHeadData = formHeadStore.formHeadList
      const usabilityData = usabilityStore.usabilityList

      // 清空现有的任务数据
      resourceViewStore.rawTasks.value = []

      // 遍历每个资源
      formHeadData.forEach((formHead, resourceIndex) => {
        // 找到对应的可用性数据
        const usability = usabilityData[resourceIndex]
        if (!usability?.availabilityDiscreteData) return

        const parentTask = {
          id: `${resourceIndex + 1}`,
          text: formHead.resourceName,
        }
        
        // 添加父任务
        resourceViewStore.addTask(parentTask)

        // 为每个离散时间窗口创建一个任务
        usability.availabilityDiscreteData.forEach((timeWindow, index) => {
          const task = {
            id: `${resourceIndex + 1}-${index + 1}`, // 生成唯一ID
            text: formHead.resourceName, // 使用资源名称
            earliest_start: this.formatDate(timeWindow.startTime),
            latest_end: this.formatDate(timeWindow.endTime),
            parent: `${resourceIndex + 1}` // 关联到父任务
          }

          // 添加任务到store
          resourceViewStore.addTask(task)
        })
      })

      return {
        success: true,
        message: '数据转换成功'
      }
    } catch (error) {
      console.error('数据转换失败:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }
}