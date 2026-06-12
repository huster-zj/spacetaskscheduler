/*
 * @Author: Jerry
 * @Date: 2025-05-26 10:54:49
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-05-26 10:57:08
 * @FilePath: \spacetaskscheduler\src\stores\useAlgorithmOutput.js
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlgorithmOutputStore = defineStore(
  'algorithmOutput',
  () => {
    // 存储算法输出结果
    const algorithmOutput = ref({
      outputText: '' // 存储算法输出的原始文本
    })

    // 更新输出文本
    const updateOutputText = (text) => {
      algorithmOutput.value.outputText = text
    }

    // 清空输出
    const clearOutput = () => {
      algorithmOutput.value.outputText = ''
    }

    // 获取输出文本
    const getOutputText = () => algorithmOutput.value.outputText

    return {
      algorithmOutput,
      updateOutputText,
      clearOutput,
      getOutputText
    }
  },
  {
    persist: {
      enabled: true,
      key: 'algorithmOutput',
      storage: sessionStorage
    }
  }
)
