<template>
  <Steps :current_page="-1" />
  <section class="page-shell workspace-page">
    <header class="page-header">
      <div>
        <h1 class="page-heading">历史文档</h1>
        <p class="page-description">打开最近使用的规划包，或从本地导入已有文件。</p>
      </div>
      <a-upload :show-upload-list="false" :before-upload="handleUpload" accept=".sts,.zip">
        <a-button type="primary">
          <template #icon><FolderOpenOutlined /></template>
          打开规划包
        </a-button>
      </a-upload>
    </header>

    <div v-if="fileDetailList.length" class="history-toolbar">
      <a-input-search
        v-model:value="searchText"
        allow-clear
        placeholder="搜索文件名或规划包名称"
        class="history-search"
      />
      <span class="history-count">共 {{ fileDetailList.length }} 个规划包</span>
    </div>

    <a-table
      v-if="filteredFiles.length"
      :data-source="filteredFiles"
      :columns="columns"
      :pagination="{ pageSize: 8, hideOnSinglePage: true }"
      :scroll="{ x: 880 }"
      row-key="key"
      class="workspace-table"
    >
      <template #headerCell="{ column }">
        <span v-if="column.key === 'filename'" class="filename-heading">
          <FolderOutlined />
          文件名
        </span>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'filename'">
          <button class="file-link" type="button" @click="handleOpen(record)">
            <FileTextOutlined aria-hidden="true" />
            <span>
              <strong>{{ record.filename }}</strong>
              <small>{{ record.packageName }}</small>
            </span>
          </button>
        </template>
        <template v-else-if="column.key === 'updatedAt'">
          <span class="updated-time"><ClockCircleOutlined />{{ formatTime(record.updatedAt) }}</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === '已有调度结果' ? 'green' : 'default'">
            {{ record.status }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="row-actions">
            <a-tooltip title="打开">
              <a-button type="text" aria-label="打开规划包" @click="handleOpen(record)">
                <FolderOpenOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="下载副本">
              <a-button type="text" aria-label="下载规划包" @click="handleDownload(record)">
                <DownloadOutlined />
              </a-button>
            </a-tooltip>
            <a-popconfirm
              title="确定删除这条历史记录吗？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="removeFile(record.key)"
            >
              <a-tooltip title="删除记录">
                <a-button type="text" danger aria-label="删除历史记录">
                  <DeleteOutlined />
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>

    <a-empty v-else :description="emptyDescription" class="workspace-empty">
      <a-upload :show-upload-list="false" :before-upload="handleUpload" accept=".sts,.zip">
        <a-button type="primary">
          <template #icon><FolderOpenOutlined /></template>
          选择规划包
        </a-button>
      </a-upload>
    </a-empty>
  </section>
</template>

<script setup>
import {
  ClockCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  FolderOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import Steps from '@/components/Steps.vue'
import { useFileDetailStore } from '@/stores/useFileDetailStore'
import {
  downloadPlanningPackageSnapshot,
  handleFileChange,
  restorePlanningPackageSnapshot
} from '@/utils/fileHandler'

const router = useRouter()
const fileDetailStore = useFileDetailStore()
const { fileDetailList } = storeToRefs(fileDetailStore)
const { removeFile, setCurrentFile } = fileDetailStore
const searchText = ref('')

const columns = [
  { title: '文件名', dataIndex: 'filename', key: 'filename', width: 300 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
  { title: '内容', dataIndex: 'info', key: 'info', width: 170 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 130 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' }
]

const filteredFiles = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return fileDetailList.value
  return fileDetailList.value.filter((item) =>
    [item.filename, item.packageName].some((value) => String(value || '').toLowerCase().includes(keyword))
  )
})

const emptyDescription = computed(() =>
  fileDetailList.value.length ? '没有找到匹配的规划包' : '暂无历史规划包'
)

const formatTime = (value) => dayjs(value).format('YYYY-MM-DD HH:mm')

const handleOpen = async (record) => {
  try {
    restorePlanningPackageSnapshot(record.snapshot)
    setCurrentFile(record.key)
    await router.push('/attributes')
    message.success(`已打开 ${record.filename}`)
  } catch (error) {
    message.error(error.message || '历史规划包已损坏')
  }
}

const handleDownload = async (record) => {
  try {
    await downloadPlanningPackageSnapshot(record.snapshot, record.filename)
    message.success(`已下载 ${record.filename}`)
  } catch (error) {
    message.error(error.message || '规划包下载失败')
  }
}

const handleUpload = async (file) => {
  try {
    await handleFileChange(file)
    await router.push('/attributes')
    message.success(`已打开 ${file.name}`)
  } catch (error) {
    message.error(error.message || '规划包打开失败')
  }
  return false
}
</script>

<style scoped>
.workspace-page {
  display: grid;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.page-description {
  margin: 6px 0 0;
  color: var(--sts-ink-secondary);
}

.history-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.history-search {
  width: min(420px, 100%);
}

.history-count {
  color: var(--sts-ink-muted);
  font-size: 13px;
  white-space: nowrap;
}

.filename-heading,
.updated-time {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filename-heading .anticon {
  color: var(--sts-primary);
}

.updated-time {
  color: var(--sts-ink-secondary);
}

.file-link {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--sts-ink-primary);
  text-align: left;
  cursor: pointer;
}

.file-link > .anticon {
  flex: 0 0 auto;
  color: var(--sts-primary);
  font-size: 24px;
}

.file-link span {
  display: grid;
  min-width: 0;
}

.file-link strong,
.file-link small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-link small {
  margin-top: 2px;
  color: var(--sts-ink-muted);
  font-size: 12px;
}

.row-actions {
  display: flex;
  gap: 2px;
}

.workspace-empty {
  padding: 72px 24px;
  border: 1px dashed var(--sts-border-strong);
  background: var(--sts-surface-raised);
}

@media (max-width: 767px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .page-header :deep(.ant-upload),
  .page-header :deep(.ant-btn) {
    width: 100%;
  }

  .history-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
