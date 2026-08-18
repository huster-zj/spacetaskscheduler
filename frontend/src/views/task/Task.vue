<template>
  <Steps :current_page="page" />
  <a-modal v-model:visible="visible" ok-text="确定" :footer="footer" wrapClassName="result_modal">
    <!-- 使用title插槽实现自定义标题样式 -->
    <template #title>
      <div class="custom_title">{{ result }}</div>
    </template>
    <ul>
      <li v-for="item in task_result_list" :key="item.key" class="result_taskList">
        <RouterLink :to="`/task_detail/${item.key}`">
          {{ item.task }}{{ item.task_result }}
        </RouterLink>
      </li>
    </ul>
    <footer class="footer">
      <a-button type="primary" @click="handleOk" class="sureBtn">确定</a-button>
    </footer>
  </a-modal>

  <section class="page-shell list-page">
    <header class="page-header">
      <div>
        <h1 class="page-heading">任务管理</h1>
        <p class="page-description">导入或定义任务，计算可行时间窗后继续维护约束和调度配置。</p>
      </div>
    </header>
    <ShowTable :columns="columns" :data="formHeadList">
    <!-- 特定按钮功能 -->
    <template #special_btn>
      <div class="task_btn">
        <a-upload :show-upload-list="true" :before-upload="handleTaskFile" accept=".csv,.json" multiple :max-count="3"
          :file-list="fileList" :auto-upload="false">
          <a-button
            class="import-task-btn"
            :loading="isImporting"
            :disabled="isPreprocessing"
          >
            <span>导入任务</span>
          </a-button>
        </a-upload>
        <div>
          <a-button
            type="primary"
            class="preprocess-btn"
            :loading="isPreprocessing"
            :disabled="isImporting || isPreprocessing"
            @click="showResult"
          >
            计算可行时间窗
          </a-button>
        </div>
        <RouterLink to="/task_detail">
          <div class="custom_btn">自定义</div>
        </RouterLink>
      </div>
    </template>
    <!-- 资源组列表 -->
    <template #column_name="record">
      {{ record.column1.name }}
    </template>
    <!-- 编辑删除操作 -->
    <template #column_action="action">
      <span>
        <RouterLink :to="`/task_detail/${action.column1.key}`">
          <FormOutlined />
        </RouterLink>
        <a-divider type="vertical" />
        <a-popconfirm title="是否删除该数据？" ok-text="是" cancel-text="否" @confirm="deleteTask(action.column1.key)">
          <CloseOutlined />
        </a-popconfirm>
      </span>
    </template>
    </ShowTable>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ShowTable from '@/components/table/show_table.vue'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'
import Steps from '@/components/Steps.vue'
import { deleteTaskKey } from '@/stores/keyManager.js'
import TaskTransferService from '@/services/TaskTransfer.js'
import { message } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue'
import PreprocessService from '@/services/Preprocess.js'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'
import eventBus from '@/utils/eventBus.js'

interface TaskFormHead {
  key: string | number
  taskName: string
}

interface TaskResultItem {
  key: string | number
  task: string
  task_result: string
}

defineOptions({ name: 'PlanningTaskView' })

const page = ref(5)    // 当前所在页面对应的value,计数从0开始,传递给Steps组件

const columns = reactive([
  {
    title: '任务名称',
    dataIndex: 'taskName',
    key: 'taskName'
  },
  {
    title: '任务优先级',
    dataIndex: 'priority',
    key: 'priority'
  },
  {
    title: '备注',
    key: 'taskNotes',
    dataIndex: 'taskNotes'
  },
  {
    title: '操作',
    key: 'action'
  }
])

const formHeadStore = useFormHeadStore()
const { formHeadList } = formHeadStore

const isImporting = ref(false)
const isPreprocessing = ref(false)

const fileList = ref<UploadFile[]>([])  // 添加文件列表状态
const notProcessed = ref(true)  // 添加处理状态标志

// 修改文件处理函数
async function handleTaskFile(_file: File, selectedFiles: File[]) {
  if (isImporting.value || isPreprocessing.value) {
    return false
  }

  const firstFile = selectedFiles[0]
  if (!firstFile) {
    return false
  }

  isImporting.value = true
  try {
    let jsonData: unknown = null
    const fileExtension = firstFile.name.split('.').pop()?.toLowerCase()

    if (fileExtension === 'csv') {
      // CSV 文件需要转换
      if (selectedFiles.length < 3) {
        throw new Error('CSV格式需要上传3个文件')
      }

      const formData = new FormData()
      selectedFiles.forEach((file) => {
        if (file.name.includes('non')) {
          formData.append('task_non_file', file)
        } else if (file.name.includes('con')) {
          formData.append('task_con_file', file)
        } else if (file.name.includes('key')) {
          formData.append('key_points_file', file)
        }
      })

      const response = await fetch('/api/convert_csv_to_json', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      console.log('CSV转换结果:', data)
      if (!data.success) {
        throw new Error(data.message || 'CSV转换失败')
      }
      jsonData = data.data.task
    } else if (fileExtension === 'json') {
      // JSON 文件直接读取
      if (selectedFiles.length > 1) {
        throw new Error('JSON格式只需要上传1个文件')
      }

      const reader = new FileReader()
      jsonData = await new Promise<unknown>((resolve, reject) => {
        reader.onload = () => {
          try {
            if (typeof reader.result !== 'string') {
              throw new Error('文件内容不是文本格式')
            }
            resolve(JSON.parse(reader.result))
          } catch (error) {
            reject(new Error('JSON解析失败'))
          }
        }
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsText(firstFile)
      })
    } else {
      throw new Error('不支持的文件格式，请上传 .json 或 .csv 文件')
    }

    // 统一处理JSON数据
    const taskService = new TaskTransferService()
    const result = taskService.transferTask(jsonData)

    if (result.success) {
      message.success('任务导入成功')
      notProcessed.value = false
      fileList.value = []
    } else {
      throw new Error(result.message || '任务导入失败')
    }

  } catch (error) {
    console.error('文件处理失败:', error)
    message.error(error instanceof Error ? error.message : '文件处理失败')
  } finally {
    isImporting.value = false
  }

  return false
}

function deleteTask(key: string) {
  deleteTaskKey(key)
}

// 计算可行时间窗部分-显示、关闭、跳转至其他页面
let result = ref<string>('')
let visible = ref<boolean>(false)

// 更新任务结果列表函数
function updateTaskResultList() {
  const preprocessStore = usePreprocessOutputStore()
  const formHeadStore = useFormHeadStore()

  task_result_list.length = 0 // 清空现有数据
  formHeadStore.formHeadList.forEach((task: TaskFormHead) => {
    const taskState = preprocessStore.getTaskState(task.key, task.taskName)
    if (taskState.status === 'empty') {
      task_result_list.push({
        key: task.key,
        task: task.taskName,
        task_result: '无可行时间窗'
      })
    }
  })

  console.log('更新后的任务结果列表:', task_result_list)
}

// 修改 showResult 函数，添加结果列表更新
// 修改 showResult 函数
async function showResult() {
  if (isImporting.value || isPreprocessing.value) return

  try {
    isPreprocessing.value = true
    const preprocessResult = await PreprocessService.preprocessTaskTimewindow()

    if (preprocessResult.success) {
      result.value = '预处理成功'  // 修改这里
      // 更新任务结果列表
      updateTaskResultList()
      // 触发预处理成功事件
      eventBus.emit('preprocessSuccess')
      visible.value = true
    } else {
      throw new Error(preprocessResult.message)
    }
  } catch (error) {
    console.error('计算可行时间窗失败:', error)
    message.error(error instanceof Error ? error.message : '计算可行时间窗失败')
    result.value = '预处理失败'  // 修改这里
    visible.value = true
  } finally {
    isPreprocessing.value = false
  }
}

const task_result_list = reactive<TaskResultItem[]>([])

// 清除模态框的底部内容，只显示代码中添加的一个"确定"按钮
const footer = ref(null)

function handleOk() {
  // console.log(e);
  visible.value = false
}

</script>

<style scoped>
li {
  list-style: none;
}

/* 导入任务按钮样式 */
.task_btn {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.task_btn .ant-btn,
.task_btn .custom_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  min-height: 36px;
  white-space: nowrap;
  border: 1px solid var(--sts-border-strong);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-raised);
  color: var(--sts-ink-primary);
  font-size: 14px;
}

.task_btn .import-task-btn {
  width: 108px;
}

.task_btn .preprocess-btn {
  width: 156px;
}

/* 模态框标题样式 */
.result_modal {
  display: flex;
  align-items: center;
}

.result_modal .custom_title {
  font-size: 18px;
  font-weight: 600;
}

/* 模态框内容样式 */
.result_modal ul {
  /* background-color: pink; */
  margin: 0px;
  padding: 0;
}

.result_modal .result_taskList {
  border-bottom: 1px solid #f0f0f0;
  padding: 10px 0 10px 15px;
  font-size: 14px;
}

/* 模态框底部样式 */
.footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.footer .sureBtn {
  min-width: 96px;
}

@media (max-width: 767px) {
  .task_btn {
    justify-content: flex-start;
  }
}
</style>
