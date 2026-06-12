// src/utils/fileHandler.js
import JSZip from 'jszip'
import { useConfigStore } from '@/stores/useConfigStore'
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
import { generateKey, getKey } from '@/stores/keyManager.js'

// 时态约束
import { useAnchorContraintListStore } from '@/stores/useAnchorContraintListStore.js'

// 保存 ZIP 文件的函数
export const saveZipFile = async () => {
  // 总体配置页面相关的store
  const configStore = useConfigStore()
  // 资源页面相关的store
  const resource_formHeadStore = resource_useFormHeadStore()
  const resource_basicInfoStore = resource_useBasicInfoStore()
  const resource_usabilityStore = resource_useUsabilityStore()
  const resource_threePartsStore = resource_useThreePartsStore()
  const resource_occupancyStore = resource_useOccupancyStore()
  // 任务页面相关的store
  const task_formHeadStore = task_useFormHeadStore()
  const task_basicInfoStore = task_useBasicInfoStore()
  const task_propStore = task_usePropStore()
  const task_durationStore = task_useDurationStore()
  const task_schedulerStateStore = task_useSchedulerStateStore()
  // 锚定约束
  const anchorContraintListStore = useAnchorContraintListStore()

  const zip = new JSZip()

  // 将 basicConfig 转换为 JSON 字符串
  const basicConfig = configStore.basicConfig
  const jsonContent = JSON.stringify(basicConfig, null, 2)
  zip.file('basicConfig.json', jsonContent)

  // 将 resourceDetail 转换为 JSON 字符串
  const resourceDetail = {
    resourceFormHeadList: resource_formHeadStore.formHeadList,
    resourceBasicInfoList: resource_basicInfoStore.basicInfoList,
    resourceUsabilityList: resource_usabilityStore.usabilityList,
    resourceThreePartsList: resource_threePartsStore.threePartsList,
    resourceOccupancyMap: resource_occupancyStore.occupancyMap
  }
  const resourceDetailContent = JSON.stringify(resourceDetail, null, 2)
  zip.file('resourceDetail.json', resourceDetailContent)

  // 将 taskDetail 转换为 JSON 字符串
  const taskDetail = {
    taskFormHeadList: task_formHeadStore.formHeadList,
    taskBasicInfoList: task_basicInfoStore.basicInfoList,
    taskPropList: task_propStore.propList,
    taskDurationList: task_durationStore.durationList,
    taskSchedulerStateMap: task_schedulerStateStore.schedulerStateMap
  }
  const taskDetailContent = JSON.stringify(taskDetail, null, 2)
  zip.file('taskDetail.json', taskDetailContent)

  // 将 锚定约束 转换为 JSON 字符串
  const anchorContraintList = anchorContraintListStore.anchorContraintList
  const anchorContraintListJsonContent = JSON.stringify(anchorContraintList, null, 2)
  zip.file('anchorContraintList.json', anchorContraintListJsonContent)

  // 生成 ZIP 文件
  const blob = await zip.generateAsync({ type: 'blob' })

  // 获取当前日期和时间
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0') // 月份从0开始，需要加1
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  // 格式化文件名
  const formattedTime = `${month}${day}${hours}${minutes}_config.sts`

  // 创建下载链接
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = formattedTime // 使用格式化的时间作为文件名
  link.click()

  // 释放 URL 对象
  URL.revokeObjectURL(link.href)
}

// 处理文件上传的函数
export const handleFileChange = async (file) => {
  // 总体配置页面相关的store
  const configStore = useConfigStore()
  // 资源页面相关的store
  const resource_formHeadStore = resource_useFormHeadStore()
  const resource_basicInfoStore = resource_useBasicInfoStore()
  const resource_usabilityStore = resource_useUsabilityStore()
  const resource_threePartsStore = resource_useThreePartsStore()
  const resource_occupancyStore = resource_useOccupancyStore()
  // 任务页面相关的store
  const task_formHeadStore = task_useFormHeadStore()
  const task_basicInfoStore = task_useBasicInfoStore()
  const task_propStore = task_usePropStore()
  const task_durationStore = task_useDurationStore()
  const task_schedulerStateStore = task_useSchedulerStateStore()

  console.log('文件上传状态: 手动处理')

  const zip = new JSZip()
  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      const content = e.target.result
      const loadedZip = await zip.loadAsync(content)

      // 处理 basicConfig.json
      const basicConfigFile = loadedZip.file('basicConfig.json')
      if (basicConfigFile) {
        const jsonContent = await basicConfigFile.async('string')
        const parsedConfig = JSON.parse(jsonContent)

        // 更新 Pinia store 的 basicConfig
        configStore.$patch({
          basicConfig: parsedConfig
        })

        console.log('导入的 basicConfig 数据:', parsedConfig)
      } else {
        console.error('ZIP 文件中未找到 basicConfig.json')
      }

      // 处理 resourceDetail.json
      const resourceDetailFile = loadedZip.file('resourceDetail.json')
      if (resourceDetailFile) {
        const resourceDetailContent = await resourceDetailFile.async('string')
        const parsedResourceDetail = JSON.parse(resourceDetailContent)

        // 清空现有数据
        resource_formHeadStore.formHeadList = []
        resource_basicInfoStore.basicInfoList = []
        resource_usabilityStore.usabilityList = []
        resource_threePartsStore.threePartsList = []
        resource_occupancyStore.occupancyMap.clear()

        const { addResourceFormHead } = resource_formHeadStore

        // 逐条导入数据
        const formHeadList = parsedResourceDetail.resourceFormHeadList
        const basicInfoList = parsedResourceDetail.resourceBasicInfoList
        const usabilityList = parsedResourceDetail.resourceUsabilityList
        const threePartsList = parsedResourceDetail.resourceThreePartsList

        for (let i = 0; i < formHeadList.length; i++) {
          generateKey()
          addResourceFormHead(formHeadList[i])
          console.log('formHeadList[i]:', formHeadList[i])
          console.log('资源pinia里面的formHeadList:', resource_formHeadStore.formHeadList)
          resource_basicInfoStore.addResourceBasicInfo(basicInfoList[i])
          console.log('basicInfoList[i]:', basicInfoList[i])

          resource_usabilityStore.addResourceUsability(usabilityList[i])
          resource_threePartsStore.addResourceThreeParts(threePartsList[i])
        }
        console.log('导入的 resourceDetail 数据:', parsedResourceDetail)
        console.log('资源pinia里面的formHeadList:', resource_formHeadStore.formHeadList)
      } else {
        console.error('ZIP 文件中未找到 resourceDetail.json')
      }

      // 处理 taskDetail.json
      const taskDetailFile = loadedZip.file('taskDetail.json')
      if (taskDetailFile) {
        const taskDetailContent = await taskDetailFile.async('string')
        const parsedTaskDetail = JSON.parse(taskDetailContent)

        // 清空现有数据
        task_formHeadStore.formHeadList = []
        task_basicInfoStore.basicInfoList = []
        task_propStore.propList = []
        task_durationStore.durationList = []
        task_schedulerStateStore.schedulerStateMap.clear()

        // 逐条导入数据
        const formHeadList = parsedTaskDetail.taskFormHeadList
        const basicInfoList = parsedTaskDetail.taskBasicInfoList
        const propList = parsedTaskDetail.taskPropList
        const durationList = parsedTaskDetail.taskDurationList

        for (let i = 0; i < formHeadList.length; i++) {
          generateKey()
          task_formHeadStore.addTaskFormHead(formHeadList[i])
          task_basicInfoStore.addTaskBasicInfo(basicInfoList[i])
          task_propStore.addTaskProp(propList[i])
          task_durationStore.addTaskDuration(durationList[i])
        }
        console.log('导入的 taskDetail 数据:', parsedTaskDetail)
      } else {
        console.error('ZIP 文件中未找到 taskDetail.json')
      }
    } catch (error) {
      console.error('解析 ZIP 文件时出错:', error)
    }
  }

  reader.onerror = (error) => {
    console.error('文件读取错误:', error)
  }

  reader.readAsArrayBuffer(file)

  // 返回 false 以阻止自动上传
  return false
}
