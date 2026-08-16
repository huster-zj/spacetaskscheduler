/*
 * @Author: Jerry
 * @Date: 2025-05-13 15:21:17
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-05-26 11:17:59
 * @FilePath: \spacetaskscheduler\src\services\Algorithm.js
 */
import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput.js'

class AlgorithmService {
  constructor() {
    this.baseUrl = ''
    // 移除所有前端文件路径，改为使用后端API
  }

  async executeAlgorithm({ algorithm = '1', target = '1' } = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/schedule_algorithm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, target })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || '算法运行失败')
      }

      // 获取算法输出存储实例
      const algorithmOutputStore = useAlgorithmOutputStore()

      // 保存输出文本到 pinia
      if (result.data && result.data.output_text) {
        algorithmOutputStore.updateOutputText(result.data.output_text)
      }

      return {
        success: true,
        data: result.data,
        message: '算法执行成功'
      }
    } catch (error) {
      console.error('算法执行失败:', error)
      return {
        success: false,
        message: error.message || '算法执行失败'
      }
    }
  }
}

export default new AlgorithmService()
