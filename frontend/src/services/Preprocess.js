/*
 * @Author: Jerry
 * @Date: 2025-05-13 15:21:17
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-09-10 21:20:37
 * @FilePath: \spacetaskscheduler\frontend\src\services\Preprocess.js
 */
import GenerateJsonService from '@/services/Generate_Json'
import ResourceTransferReverse from './ResourceTransfer_Reverse'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

class PreprocessService {
  constructor() {
    this.baseUrl = 'http://localhost:8000' // 后端基础URL
    // 移除所有文件路径，改为使用后端API
  }

  // 预处理任务时间窗
  async preprocessTaskTimewindow() {
    try {
      // 生成资源JSON数据
      const reverseTransfer = new ResourceTransferReverse()
      const resourceData = reverseTransfer.exportCekongResources()

      // 生成任务JSON数据
      const { taskDataStr, taskDataStr2 } = GenerateJsonService.generateTaskJson()

      console.log('1. 生成的任务JSON数据:', taskDataStr)
      console.log('1. 生成的任务JSON数据2:', taskDataStr2)

      if (!taskDataStr || !resourceData) {
        throw new Error('请先导入任务和资源数据')
      }

      // 将JSON字符串解析为JS对象
      const taskData = JSON.parse(taskDataStr)
      const taskData2 = JSON.parse(taskDataStr2)

      console.log('生成的任务JSON数据:', taskData)
      console.log('生成的任务JSON数据2:', taskData2)
      console.log('生成的资源JSON数据:', resourceData)

      // 调用后端接口保存数据
      try {
        // 保存资源数据
        const saveResourceResponse = await fetch(`${this.baseUrl}/api/save_json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: resourceData,
            file_name: '测控资源.json',
            file_path: 'interface/transfer_json_output'
          })
        })

        if (!saveResourceResponse.ok) {
          throw new Error(`保存资源数据失败: ${saveResourceResponse.status}`)
        }

        // 保存任务数据
        const saveTaskResponse = await fetch(`${this.baseUrl}/api/save_json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: taskData,
            file_name: 'taskDetail.json',
            file_path: 'interface/transfer_json_output'
          })
        })

        if (!saveTaskResponse.ok) {
          throw new Error(`保存任务数据失败: ${saveTaskResponse.status}`)
        }

        // 调用后端接口保存任务数据2
        const saveTaskResponse2 = await fetch(`${this.baseUrl}/api/save_json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: taskData2,
            file_name: 'taskDetail2.json',
            file_path: 'interface/transfer_json_output'
          })
        })
        
        if (!saveTaskResponse2.ok) {
          const errorText = await saveTaskResponse2.text()
          console.error('保存任务数据2失败，服务器响应:', errorText)
          throw new Error(
            `保存任务数据2失败: ${saveTaskResponse2.status} ${saveTaskResponse2.statusText}`
          )
        }

        console.log('JSON数据保存成功')
      } catch (error) {
        console.error('保存JSON数据失败:', error)
        throw new Error('保存JSON数据失败: ' + error.message)
      }

      // 创建FormData，直接传递JSON数据
      const formData = new FormData()

      // 将JSON数据转换为Blob并添加到FormData
      formData.append(
        'task_json',
        new Blob([JSON.stringify(taskData)], { type: 'application/json' }),
        'taskDetail.json'
      )
      formData.append(
        'ck_json',
        new Blob([JSON.stringify(resourceData)], { type: 'application/json' }),
        '测控资源.json'
      )

      // 调用后端预处理接口
      const response = await fetch(`${this.baseUrl}/api/preprocess_task_timewindow`, {
        method: 'POST',
        body: formData
      })

      console.log('后端请求的结果：', response)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || '预处理失败')
      }

      // 直接使用后端返回的结果，而不是读取文件
      try {
        const preprocessStore = usePreprocessOutputStore()

        // 从后端返回的数据中获取结果
        if (result.data && result.data.continuous_json) {
          console.log('后端返回的预处理结果:', result.data)

          // 从后端返回的数据中获取具体的事件数据
          const continuousEvents = result.data.continuous_events_data || []
          const discreteEvents = result.data.discrete_events_data || []

          console.log('连续跟踪事件数据:', continuousEvents)
          console.log('非连续跟踪事件数据:', discreteEvents)

          // 更新到 Pinia store
          preprocessStore.updateContinuousEvents(continuousEvents)
          preprocessStore.updateDiscreteEvents(discreteEvents)

          console.log('预处理结果已更新到 Pinia store')

          return {
            success: true,
            data: {
              continuous_events: continuousEvents,
              discrete_events: discreteEvents,
              file_info: {
                continuous_files: result.data.continuous_json,
                discrete_files: result.data.non_continuous_json
              }
            }
          }
        } else {
          throw new Error('后端未返回预处理结果')
        }
      } catch (error) {
        console.error('处理预处理结果失败:', error)
        throw new Error('处理预处理结果失败: ' + error.message)
      }
    } catch (error) {
      console.error('预处理失败:', error)
      return {
        success: false,
        message: error.message || '预处理失败'
      }
    }
  }
}

export default new PreprocessService()
