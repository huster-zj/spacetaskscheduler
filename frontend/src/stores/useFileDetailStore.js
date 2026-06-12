import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileDetailStore = defineStore(
  'fileDetail',
  () => {
    const initialData = [
      {
        key: '1',
        filename: 'STKScheduler Tutorial.sts',
        updateTime: '周一 11:11',
        info: '未完成'
      },
      {
        key: '2',
        filename: 'Test.sts',
        updateTime: '周四 9:42',
        info: '存在3个冲突'
      },
      {
        key: '3',
        filename: '测试.sts',
        updateTime: '周五 10:20',
        info: '存在2个冲突'
      },
      {
        key: '4',
        filename: '测控资源分配.sts',
        updateTime: '8月12日 15:00',
        info: '未完成'
      },
      {
        key: '5',
        filename: '测试2.sts',
        updateTime: '周五 11:20',
        info: '存在2个冲突'
      },
      {
        key: '6',
        filename: '测控资源分配2.sts',
        updateTime: '8月12日 18:00',
        info: '未完成'
      }
    ]

    // 存储文件列表
    const fileDetailList = ref(initialData)
    const currentKey = ref(0)  // 添加计数器

    // 创建文件详情对象
    const createFileDetail = (
      filename = '',
      updateTime = '',
      info = ''
    ) => {
      return {
        key: getKey(),
        filename,
        updateTime,
        info
      }
    }

    // 修改为递增方式
    const getKey = () => {
      currentKey.value += 1
      return currentKey.value.toString()
    }

    // 添加文件
    const addFile = (file) => {
      fileDetailList.value.push(file)
    }

    // 删除文件
    const removeFile = (key) => {
      const index = fileDetailList.value.findIndex(file => file.key === key)
      if (index !== -1) {
        fileDetailList.value.splice(index, 1)
      }
    }

    return {
      fileDetailList,
      createFileDetail,
      addFile,
      removeFile
    }
  }
)