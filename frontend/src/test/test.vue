<template>
  <div class="test-container">
    <h2>数据转换接口测试</h2>

    <!-- 测控资源文件上传 -->
    <div class="upload-section">
      <h3>测控资源文件</h3>
      <a-upload :beforeUpload="() => false" @change="handleCkFileChange" :maxCount="1">
        <a-button>选择测控资源文件</a-button>
      </a-upload>
      <span class="file-name">{{ ckFileName }}</span>
    </div>

    <!-- 任务相关文件上传 -->
    <div class="upload-section">
      <h3>任务相关文件</h3>
      <a-upload :beforeUpload="() => false" @change="handleTaskNonFileChange" :maxCount="1">
        <a-button>选择非连续跟踪任务文件</a-button>
      </a-upload>
      <span class="file-name">{{ taskNonFileName }}</span>

      <a-upload :beforeUpload="() => false" @change="handleTaskConFileChange" :maxCount="1">
        <a-button>选择连续跟踪任务文件</a-button>
      </a-upload>
      <span class="file-name">{{ taskConFileName }}</span>

      <a-upload :beforeUpload="() => false" @change="handleKeyPointsFileChange" :maxCount="1">
        <a-button>选择关键点约束文件</a-button>
      </a-upload>
      <span class="file-name">{{ keyPointsFileName }}</span>
    </div>

    <!-- 转换按钮 -->
    <div class="action-section">
      <a-button type="primary" @click="handleConvert" :loading="loading">
        开始转换
      </a-button>
    </div>

    <!-- 结果展示 -->
    <div class="result-section" v-if="result">
      <h3>转换结果</h3>
      <a-alert :type="result.success ? 'success' : 'error'" :message="result.message" show-icon />
      <div class="json-viewer" v-if="result.success">
        <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'

// 文件状态
const ckFile = ref(null)
const taskNonFile = ref(null)
const taskConFile = ref(null)
const keyPointsFile = ref(null)

// 文件名显示
const ckFileName = ref('')
const taskNonFileName = ref('')
const taskConFileName = ref('')
const keyPointsFileName = ref('')

// 加载和结果状态
const loading = ref(false)
const result = ref(null)

// 文件选择处理函数
const handleCkFileChange = (info) => {
  ckFile.value = info.file
  ckFileName.value = info.file.name
}

const handleTaskNonFileChange = (info) => {
  taskNonFile.value = info.file
  taskNonFileName.value = info.file.name
}

const handleTaskConFileChange = (info) => {
  taskConFile.value = info.file
  taskConFileName.value = info.file.name
}

const handleKeyPointsFileChange = (info) => {
  keyPointsFile.value = info.file
  keyPointsFileName.value = info.file.name
}

// 转换处理函数
const handleConvert = async () => {
  // 检查是否有文件被选择
  if (!ckFile.value && !taskNonFile.value) {
    message.warning('请至少选择测控资源文件或任务相关文件')
    return
  }

  loading.value = true
  try {
    const formData = new FormData()

    // 添加选择的文件到表单
    if (ckFile.value) {
      formData.append('ck_file', ckFile.value)
    }
    if (taskNonFile.value) {
      formData.append('task_non_file', taskNonFile.value)
    }
    if (taskConFile.value) {
      formData.append('task_con_file', taskConFile.value)
    }
    if (keyPointsFile.value) {
      formData.append('key_points_file', keyPointsFile.value)
    }

    // 发送请求
    const response = await fetch('/api/convert_csv_to_json', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    result.value = data

    if (data.success) {
      message.success('转换成功')
    } else {
      message.error(data.message)
    }
  } catch (error) {
    message.error('请求失败：' + error.message)
    result.value = {
      success: false,
      message: error.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.upload-section {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.upload-section h3 {
  margin-bottom: 16px;
}

.file-name {
  margin-left: 12px;
  color: #666;
}

.action-section {
  margin: 20px 0;
}

.result-section {
  margin-top: 20px;
}

.json-viewer {
  margin-top: 16px;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 4px;
}

.json-viewer pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background: #f8f8f8;
  padding: 16px;
  border-radius: 4px;
  font-family: monospace;
}

:deep(.ant-upload-list) {
  margin-top: 12px;
}

.ant-btn {
  margin-right: 12px;
  margin-bottom: 12px;
}
</style>
