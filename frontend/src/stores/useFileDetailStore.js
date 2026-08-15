import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import { ref } from 'vue'

const MAX_HISTORY_ITEMS = 12

const buildSummary = (snapshot) => {
  const resourceCount = snapshot?.resourceDetail?.resourceFormHeadList?.length || 0
  const taskCount = snapshot?.taskDetail?.taskFormHeadList?.length || 0
  const hasResult = Boolean(snapshot?.execution?.algorithmOutput?.outputText)

  return {
    packageName: snapshot?.basicConfig?.packageName || '未命名规划包',
    resourceCount,
    taskCount,
    status: hasResult ? '已有调度结果' : '待运行',
    info: `${resourceCount} 个资源 · ${taskCount} 个任务`
  }
}

export const useFileDetailStore = defineStore(
  'fileDetail',
  () => {
    const fileDetailList = ref([])
    const currentFileKey = ref(null)

    const upsertFile = ({ key, filename, snapshot, source = 'saved' }) => {
      const now = new Date().toISOString()
      const targetKey = key || (source === 'saved' ? currentFileKey.value : null)
      const existingIndex = targetKey
        ? fileDetailList.value.findIndex((item) => item.key === targetKey)
        : -1
      const summary = buildSummary(snapshot)
      const record = {
        key: targetKey || nanoid(),
        filename,
        updatedAt: now,
        source,
        snapshot,
        ...summary
      }

      if (existingIndex >= 0) {
        fileDetailList.value.splice(existingIndex, 1, record)
      } else {
        fileDetailList.value.unshift(record)
      }

      fileDetailList.value.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      fileDetailList.value = fileDetailList.value.slice(0, MAX_HISTORY_ITEMS)
      currentFileKey.value = record.key
      return record
    }

    const removeFile = (key) => {
      const index = fileDetailList.value.findIndex((file) => file.key === key)
      if (index !== -1) {
        fileDetailList.value.splice(index, 1)
      }
      if (currentFileKey.value === key) {
        currentFileKey.value = null
      }
    }

    const getFile = (key) => fileDetailList.value.find((file) => file.key === key)

    const setCurrentFile = (key = null) => {
      currentFileKey.value = key
    }

    return {
      fileDetailList,
      currentFileKey,
      upsertFile,
      removeFile,
      getFile,
      setCurrentFile
    }
  },
  {
    persist: {
      key: 'planningPackageHistory',
      storage: localStorage
    }
  }
)
