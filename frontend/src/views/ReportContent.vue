<template>
  <div class="content">
    <div class="header">
      <a-button type="primary" @click="downloadMarkdown">
        <template #icon>
          <DownloadOutlined />
        </template>
        下载报告
      </a-button>
    </div>
    <div class="markdown-container" v-html="renderedContent"></div>
  </div>
</template>

<script setup>
import { DownloadOutlined } from '@ant-design/icons-vue'
import MarkdownIt from 'markdown-it'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useReportContentStore } from '@/stores/useReportContentStore'
import { storeToRefs } from 'pinia'

const route = useRoute()
const store = useReportContentStore()

// 获取所有报告内容
const {
  scheduleReport,
  resourceReport,
  summaryReport,
  taskGroupReport,
  taskConflictReport,
  taskReport
} = storeToRefs(store)

// 根据路由参数获取对应报告内容
const getReportContent = () => {
  const type = route.params.type
  switch (type) {
    case 'schedule': return scheduleReport.value
    case 'resource': return resourceReport.value
    case 'summary': return summaryReport.value
    case 'taskGroup': return taskGroupReport.value
    case 'taskConflict': return taskConflictReport.value
    case 'task': return taskReport.value
    default: return ''
  }
}

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
})

const renderedContent = ref('')

watch(() => route.params.type, () => {
  renderedContent.value = md.render(getReportContent())
}, { immediate: true })

const downloadMarkdown = () => {
  const now = new Date()
  const fileName = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    '报告.md'

  const blob = new Blob([getReportContent()], { type: 'text/markdown' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.content {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.markdown-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(h1) {
  font-size: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

:deep(h2) {
  font-size: 20px;
  margin: 16px 0;
}

:deep(p) {
  line-height: 1.6;
  margin: 12px 0;
}

:deep(pre) {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

:deep(th),
:deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
</style>