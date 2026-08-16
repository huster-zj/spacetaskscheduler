import GenerateJsonService from '@/services/Generate_Json'
import ResourceTransferReverse from './ResourceTransfer_Reverse'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'
import { useResourceGroupListStore } from '@/stores/useResourceGroupListStore'
import { useFormHeadStore as useTaskFormHeadStore } from '@/stores/taskDetailNumStore'
import { useTaskResourcePoolStore } from '@/stores/useTaskResourcePoolStore'

const buildResourceCatalog = () => {
  const resourceGroupStore = useResourceGroupListStore()
  const resourcePoolStore = useTaskResourcePoolStore()
  return {
    resourceGroups: resourceGroupStore.customResourceGroupList.map((group) => ({
      resourceGroupName: group.resourceGroupName,
      includeResourceList: group.includeResourceList || [],
      excludeResourceList: group.excludeResourceList || []
    })),
    resourcePools: resourcePoolStore.taskResourcePoolList
  }
}

const appendJson = (formData, field, value, filename) => {
  formData.append(
    field,
    new Blob([JSON.stringify(value)], { type: 'application/json' }),
    filename
  )
}

const eventBelongsToTask = (event, task) => {
  if (event?.task_key) return String(event.task_key) === String(task.key)
  return String(event?.task_name || '') === String(task.taskName || '')
}

class PreprocessService {
  constructor() {
    this.baseUrl = 'http://localhost:8000'
    this.requestVersion = 0
  }

  createTaskStates(data, continuousEvents, discreteEvents) {
    const taskStore = useTaskFormHeadStore()
    const noResultKeys = new Set(
      (data?.no_result_tasks || []).map((item) => String(item.task_key || item.key || ''))
    )
    const allEvents = [...continuousEvents, ...discreteEvents]

    return Object.fromEntries(taskStore.formHeadList.map((task) => {
      const hasEvents = allEvents.some((event) => eventBelongsToTask(event, task))
      const key = String(task.key)
      const status = noResultKeys.has(key) || !hasEvents ? 'empty' : 'success'
      return [key, {
        status,
        message: status === 'empty' ? '未找到可行时间窗' : '',
        updatedAt: new Date().toISOString()
      }]
    }))
  }

  async preprocessTaskTimewindow({ taskKey = '' } = {}) {
    const taskIdentifier = String(taskKey || '').trim()
    const requestVersion = ++this.requestVersion
    try {
      const reverseTransfer = new ResourceTransferReverse()
      const resourceData = reverseTransfer.exportCekongResources()
      const { taskDataStr, taskDataStr2 } = GenerateJsonService.generateTaskJson()

      if (!taskDataStr || !resourceData?.length) {
        throw new Error('请先导入任务和资源数据')
      }

      const taskData = JSON.parse(taskDataStr)
      const taskData2 = JSON.parse(taskDataStr2)
      const resourceCatalog = buildResourceCatalog()

      const formData = new FormData()
      appendJson(formData, 'task_json', taskData, 'taskDetail.json')
      appendJson(formData, 'algorithm_task_json', taskData2, 'taskDetail2.json')
      appendJson(formData, 'ck_json', resourceData, '测控资源.json')
      appendJson(formData, 'resource_catalog_json', resourceCatalog, 'resourceCatalog.json')
      if (taskIdentifier) formData.append('task_key', taskIdentifier)

      let response
      try {
        response = await fetch(`${this.baseUrl}/api/preprocess_task_timewindow`, {
          method: 'POST',
          body: formData
        })
      } catch {
        throw new Error('请确认后端服务正在运行并检查 CORS 设置')
      }

      if (!response.ok) {
        let detail = ''
        try {
          const errorBody = await response.json()
          detail = errorBody?.detail || errorBody?.message || ''
        } catch {
          // Fall back to the HTTP status when the body is not JSON.
        }
        throw new Error(detail || `预处理请求失败：${response.status}`)
      }

      let result
      try {
        result = await response.json()
      } catch {
        throw new Error('预处理接口返回了无法解析的响应')
      }

      if (!result.success) {
        throw new Error(result.message || '预处理失败')
      }

      const data = result.data || {}
      const continuousEvents = data.continuous_events_data || []
      const discreteEvents = data.discrete_events_data || []
      const preprocessStore = usePreprocessOutputStore()
      const isLatest = this.requestVersion === requestVersion

      if (!isLatest) {
        return { success: true, ignored: true, data }
      }

      if (taskIdentifier) {
        const task = useTaskFormHeadStore().formHeadList.find(
          (item) => String(item.key) === taskIdentifier
        )
        const taskName = data.task_name || task?.taskName || ''
        const status = continuousEvents.length || discreteEvents.length ? 'success' : 'empty'
        preprocessStore.replaceTaskEvents(
          taskIdentifier,
          taskName,
          continuousEvents,
          discreteEvents,
          {
            status,
            message: status === 'empty' ? '未找到可行时间窗' : ''
          }
        )
      } else {
        preprocessStore.replaceAllEvents({
          continuousEvents,
          discreteEvents,
          taskStates: this.createTaskStates(data, continuousEvents, discreteEvents)
        })
      }

      return {
        success: true,
        data: {
          ...data,
          continuous_events: continuousEvents,
          discrete_events: discreteEvents,
          file_info: {
            continuous_files: data.continuous_json || [],
            discrete_files: data.non_continuous_json || []
          }
        }
      }
    } catch (error) {
      const isLatest = this.requestVersion === requestVersion
      if (isLatest) {
        const preprocessStore = usePreprocessOutputStore()
        if (taskIdentifier) {
          preprocessStore.markTaskError(taskIdentifier, '', error?.message || '预处理失败')
        } else {
          preprocessStore.markBatchError(error?.message || '预处理失败')
        }
      }
      return {
        success: false,
        message: error?.message || '预处理失败'
      }
    }
  }
}

export default new PreprocessService()
