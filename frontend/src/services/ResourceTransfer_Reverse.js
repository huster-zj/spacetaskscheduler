import { useFormHeadStore, useUsabilityStore } from '../stores/resourceDetailNumStore'

export default class ResourceTransferReverse {
  calculateDuration(startTime, endTime) {
    const start = new Date(startTime)
    const end = new Date(endTime)
    return Math.floor((end - start) / 1000)
  }

  exportCekongResources() {
    try {
      const formHeadStore = useFormHeadStore()
      const usabilityStore = useUsabilityStore()

      // 转换为目标格式
      const exportedResources = formHeadStore.formHeadList.flatMap((formHead, index) => {
        // 验证表头数据
        if (!formHead || !formHead.resourceName) {
          console.warn('无效的资源表头数据:', formHead)
          return []
        }

        // 获取对应的可用性数据
        const usability = usabilityStore.usabilityList[index]
        if (!usability || !usability.availabilityDiscreteData) {
          console.warn(`资源 ${formHead.resourceName} 的可用性数据无效`)
          return []
        }

        // 处理所有时间窗数据
        return usability.availabilityDiscreteData.map(timeWindow => {
          if (!timeWindow || !timeWindow.startTime || !timeWindow.endTime) {
            console.warn(`资源 ${formHead.resourceName} 的时间窗数据无效`)
            return null
          }

          // 构建输出数据，使用 notes 作为 ID
          return {
            id: timeWindow.notes || `CK-${formHead.resourceName}-${timeWindow.id}`,  // 优先使用 notes
            station: formHead.resourceName.replace('-TIANHE', ''),
            craft: "TIANHE",
            start_time: timeWindow.startTime,
            end_time: timeWindow.endTime,
            duration: this.calculateDuration(timeWindow.startTime, timeWindow.endTime)
          }
        }).filter(Boolean) // 移除无效记录
      })

      // 验证导出结果
      if (exportedResources.length === 0) {
        throw new Error('没有可导出的有效资源数据')
      }

      console.log('导出的测控资源数据:', exportedResources)
      return exportedResources

    } catch (error) {
      console.error('导出资源数据失败:', error)
      throw new Error(`导出失败: ${error.message}`)
    }
  }
}